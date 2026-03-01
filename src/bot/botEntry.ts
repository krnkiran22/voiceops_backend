import { Bot } from 'grammy';
import { config } from './config';
import apiClient from './apiClient';
import { handleStart, handleLink, handleHelp, handlePresent } from './handlers/commandHandler';
import { handleVoice } from './handlers/voiceHandler';
import { handleVideo } from './handlers/videoHandler';
import { handleTextMention } from './handlers/textHandler';
import { initMonitoring } from './services/monitoringService';

if (!config.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is missing!');
    process.exit(1);
}

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

export const startBot = () => {
    // Initialize Monitoring Service (Strict 15m/1h checks)
    initMonitoring(bot);
    // Commands
    bot.command('start', handleStart);
    bot.command('link', handleLink);
    bot.command('help', handleHelp);
    bot.command('present', handlePresent);

    // Media Handlers
    bot.on('message:voice', handleVoice);
    bot.on('message:video', handleVideo);
    bot.on('message:video_note', handleVideo); // Circular video messages

    // Generic activity tracker (ensure any message resets the 15m timer)
    bot.on(['message:text', 'message:caption', 'message:voice', 'message:video', 'message:video_note'], async (ctx, next) => {
        try {
            console.log(`📍 Incoming Signal | Chat ID: ${ctx.chat.id} | From: ${ctx.from?.username || ctx.from?.id}`);
            // Background call to update last seen without blocking
            apiClient.post('/api/users/update-last-seen', {
                telegramUserId: String(ctx.from?.id),
            }).catch(() => { }); // Quiet fail
        } catch (e) { }
        return next();
    });

    // Handle @mentions in text or captions
    bot.on(['message:text', 'message:caption'], (ctx) => {
        console.log(`📥 Incoming ${ctx.message?.text ? 'text' : 'caption'} update from ${ctx.from?.username || ctx.from?.id}`);
        return handleTextMention(ctx);
    });

    // Error Handling
    bot.catch((err) => {
        console.error(`Error while handling update ${err.ctx.update.update_id}:`);
        console.error(err.error);
    });

    // Start Bot
    console.log('VoiceOps Bot is starting...');
    bot.start();
};
