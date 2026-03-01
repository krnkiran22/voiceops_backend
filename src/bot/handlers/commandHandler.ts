import { Context } from 'grammy';
import apiClient from '../apiClient';
import { config } from '../config';

export const handleStart = async (ctx: Context) => {
    try {
        await apiClient.post('/api/users/start-tracking', {
            telegramUserId: String(ctx.from?.id),
        });

        await ctx.reply(
            "👋 Welcome back to VoiceOps! Tracking is now ON for the next 10 hours.\n\nSend voice, video, or mention me in a text message and I'll record your update."
        );
    } catch (error: any) {
        if (error.response?.status === 404) {
            await ctx.reply(
                "👋 Welcome to VoiceOps!\n\n⚠️ Your Telegram is not linked yet. Please link it using /link <code> to start tracking.\n\nLink your account in the web app → Profile → Link Telegram Account."
            );
        } else {
            console.error('Error starting tracking:', error);
            await ctx.reply("👋 Welcome to VoiceOps! (Error starting tracking, please ensure you are linked)");
        }
    }
};

export const handleLink = async (ctx: Context) => {
    const code = ctx.match as string;
    if (!code) {
        return ctx.reply("❌ Please provide a code. Usage: /link 123456");
    }

    try {
        const response = await apiClient.post('/api/users/link-telegram', {
            code,
            telegramUserId: String(ctx.from?.id),
            telegramUsername: ctx.from?.username || '',
        });

        if (response.data.success) {
            await ctx.reply(`✅ Linked! Your updates will now be tracked, ${response.data.userName}.`);
        }
    } catch (error: any) {
        const message = error.response?.data?.message || "Invalid or expired code.";
        await ctx.reply(`❌ ${message} Please generate a new one in the web app.`);
    }
};

export const handlePresent = async (ctx: Context) => {
    try {
        await apiClient.post('/api/users/mark-present', {
            telegramUserId: String(ctx.from?.id),
        });

        const username = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name;
        await ctx.reply(`🫡 Signal Received, ${username}! You are marked **PRESENT** for today's operation.\n\nKeep the updates coming every 15 minutes to avoid the nagging bot!`, { parse_mode: 'Markdown' });
    } catch (error: any) {
        if (error.response?.status === 404) {
            await ctx.reply("⚠️ Your Telegram is not linked. Please use /link <code> first.");
        } else {
            console.error('Error marking present:', error);
            await ctx.reply("❌ Failed to register attendance. Please try again.");
        }
    }
};

export const handleStop = async (ctx: Context) => {
    try {
        await apiClient.post('/api/users/mark-absent', {
            telegramUserId: String(ctx.from?.id),
        });

        const username = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name;
        await ctx.reply(`🛑 Session Terminated, ${username}. You are now marked as **ABSENT**.\n\nTracking and nagging have been disabled. See you next operation!`, { parse_mode: 'Markdown' });
    } catch (error: any) {
        console.error('Error marking absent:', error);
        await ctx.reply("❌ Failed to terminate session. Please try again.");
    }
};

export const handleHelp = async (ctx: Context) => {
    await ctx.reply(
        "📖 *VoiceOps Tactical Help*\n\n" +
        "/start - Start/Reset tracking session\n" +
        "/present - Check in for today's work (STRICT 15m/1h monitoring)\n" +
        "/stop - Stop reporting and exit operational duty\n" +
        "/link <code> - Link your Telegram account\n" +
        "/help - Show this help message\n\n" +
        "Just send or forward a voice note, video, or tag me in a text and I'll record your intel!",
        { parse_mode: "Markdown" }
    );
};
