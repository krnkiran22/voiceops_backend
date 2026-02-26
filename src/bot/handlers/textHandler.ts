import { Context } from 'grammy';
import apiClient from '../apiClient';
import { config } from '../config';
import { summarize } from '../services/summarizer';

export const handleTextMention = async (ctx: Context) => {
    const text = ctx.message?.text || ctx.message?.caption;
    if (!text) return;

    const botUsername = ctx.me.username;
    if (!text.toLowerCase().includes(`@${botUsername.toLowerCase()}`)) return;

    // Provide immediate feedback
    const processingMsg = await ctx.reply("✍️ Recording your text update...", {
        reply_parameters: { message_id: ctx.message!.message_id }
    });

    try {
        // Remove the mention from the text to get the actual update
        const cleanText = text.replace(`@${botUsername}`, '').trim();

        if (!cleanText) {
            return await ctx.api.editMessageText(
                ctx.chat!.id,
                processingMsg.message_id,
                "🤖 I'm here! Want to record a text update? Just include your update after my @mention."
            );
        }

        // 1. Summarize the text update
        const { summary, topic } = await summarize(cleanText);

        // 2. Save to Backend
        try {
            const response = await apiClient.post('/api/updates', {
                telegramUserId: String(ctx.from?.id),
                telegramMessageId: String(ctx.message?.message_id),
                telegramChatId: String(ctx.chat?.id),
                mediaType: 'text',
                transcript: cleanText, // For text, transcript is the clean text
                summary,
                topic,
                senderName: ctx.from?.first_name || 'Unknown',
                senderTelegramUsername: ctx.from?.username,
            });

            const updateId = response.data._id;
            const username = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name;

            // 3. Success Reply
            await ctx.api.editMessageText(
                ctx.chat!.id,
                processingMsg.message_id,
                `📝 *Text Update from ${username}*\n\n` +
                `📋 *Summary:* ${summary}\n\n` +
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
                console.error('Error saving text update:', error);
                await ctx.api.editMessageText(
                    ctx.chat!.id,
                    processingMsg.message_id,
                    "❌ Error saving your update. Please try again later."
                );
            }
        }

    } catch (error) {
        console.error('Text processing error:', error);
        await ctx.api.editMessageText(
            ctx.chat!.id,
            processingMsg.message_id,
            "❌ Failed to process text update."
        );
    }
};
