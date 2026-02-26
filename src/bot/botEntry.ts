import { Bot } from 'grammy';
import { config } from './config';
import { handleStart, handleLink, handleHelp } from './handlers/commandHandler';
import { handleVoice } from './handlers/voiceHandler';
import { handleVideo } from './handlers/videoHandler';
import { handleTextMention } from './handlers/textHandler';

if (!config.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is missing!');
    process.exit(1);
}

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

export const startBot = () => {
    // Commands
    bot.command('start', handleStart);
    bot.command('link', handleLink);
    bot.command('help', handleHelp);

    // Media Handlers
    bot.on('message:voice', handleVoice);
    bot.on('message:video', handleVideo);
    bot.on('message:video_note', handleVideo); // Circular video messages

    // Handle @mentions in text or captions
    bot.on('message:text', handleTextMention);
    bot.on('message:caption', handleTextMention);

    // Error Handling
    bot.catch((err) => {
        console.error(`Error while handling update ${err.ctx.update.update_id}:`);
        console.error(err.error);
    });

    // Start Bot
    console.log('VoiceOps Bot is starting...');
    bot.start();
};
