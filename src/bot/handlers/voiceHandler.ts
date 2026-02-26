import { Context } from 'grammy';
import { transcribeAudio } from '../services/transcriber';
import { summarize } from '../services/summarizer';
import { downloadFile, deleteFile } from '../services/fileManager';
import apiClient from '../apiClient';
import { config } from '../config';

export const handleVoice = async (ctx: Context) => {
    if (!ctx.message?.voice) return;

    const fileId = ctx.message.voice.file_id;
    const fileName = `${ctx.message.message_id}.ogg`;

    // Provide immediate feedback
    const processingMsg = await ctx.reply("⏳ Processing your voice update...", {
        reply_parameters: { message_id: ctx.message!.message_id }
    });

    let filePath: string | null = null;

    try {
        const file = await ctx.api.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        // 1. Download
        filePath = await downloadFile(fileUrl, fileName);

        // 2. Transcribe
        const transcript = await transcribeAudio(filePath);

        // 3. Summarize
        const { summary, topic } = await summarize(transcript);

        // 4. Save to Backend
        try {
            const response = await apiClient.post('/api/updates', {
                telegramUserId: String(ctx.from?.id),
                telegramMessageId: String(ctx.message.message_id),
                telegramChatId: String(ctx.chat?.id),
                mediaType: 'voice',
                transcript,
                summary,
                topic,
                durationSeconds: ctx.message.voice.duration,
                senderName: ctx.from?.first_name || 'Unknown',
                senderTelegramUsername: ctx.from?.username,
            });

            const updateId = response.data._id;
            const username = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name;

            // 5. Success Reply
            await ctx.api.editMessageText(
                ctx.chat!.id,
                processingMsg.message_id,
                `🎙️ *Update from ${username}*\n\n` +
                `📋 *Summary:* ${summary}\n\n` +
                `📝 *Transcript:*\n"${transcript}"\n\n` +
                `🔗 [View Update](${config.FRONTEND_URL}/dashboard/updates/${updateId})`,
                { parse_mode: 'Markdown' }
            );

        } catch (error: any) {
            const username = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name;
            if (error.response?.status === 404) {
                await ctx.api.editMessageText(
                    ctx.chat!.id,
                    processingMsg.message_id,
                    `⚠️ ${username}, your Telegram is not linked to a VoiceOps account yet.\n` +
                    `Go to ${config.FRONTEND_URL}/profile to link your account.`
                );
            } else if (error.response?.status === 403) {
                await ctx.api.editMessageText(
                    ctx.chat!.id,
                    processingMsg.message_id,
                    `⏱️ ${username}, your 10-hour tracking session has expired.\n` +
                    `Send /start to start a new 10-hour tracking session.`
                );
            } else {
                console.error('Error saving update:', error);
                await ctx.api.editMessageText(
                    ctx.chat!.id,
                    processingMsg.message_id,
                    "❌ Error saving your update. Please try again later."
                );
            }
        }

    } catch (error) {
        console.error('Voice processing error:', error);
        await ctx.api.editMessageText(
            ctx.chat!.id,
            processingMsg.message_id,
            "❌ Failed to process voice note. Please check your AI API keys."
        );
    } finally {
        // Cleanup
        if (filePath) {
            deleteFile(filePath);
        }
    }
};
