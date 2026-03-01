import cron from 'node-cron';
import User from '../../models/User';
import { Bot } from 'grammy';
import { config } from '../config';

const JOKES = [
    "Are you taking a nap or did you join a monastery? We need updates! 🧘‍♂️",
    "I've seen slower snails in a salt factory. Where's the intel? 🐌",
    "Did you forget how to talk, or is your internet powered by a hamster? 🐹",
    "Even my grandma updates her status faster than you. Get to work! 👵",
    "Is 'Silence' your new tactical strategy? Because it's not working. 🤫",
    "The only update I have from you is that you’re still alive (barely). Signal now! 💀",
    "Are you waiting for a written invitation from the Queen to send a video? 👑",
    "I'm starting to think you're a secret agent... for the competition. 🕵️‍♂️",
    "My AI brain is growing cobwebs waiting for your 15m update. 🕸️",
    "If lack of updates were an Olympic sport, you'd have the gold medal. 🥇",
    "Did you drop your phone in the toilet, or are you just being lazy? 🚽",
    "We need intel, not your ghosting techniques. Send an update! 👻",
    "I've processed entire encyclopedias while waiting for your 30-second video. 📚",
    "Are you in a witness protection program? Tag, you're it! 🏃‍♂️",
    "Is your update stuck in traffic, or did it just decide not to show up? 🚗",
    "You’re making the Slack notifications look like busy work. Move it! 🔔",
    "I'm charging you 1 intelligence point for every minute you’re late. 📈",
    "If you don't update soon, I'm telling everyone your browser history. 🌐",
    "Is your mic broken, or are you just giving us the 'silent treatment'? 🎤",
    "Your updates are like Bigfoot. People talk about them, but I've never seen one. 👣"
];

let botInstance: Bot | null = null;

export const initMonitoring = (bot: Bot) => {
    botInstance = bot;

    // 1. Every 15 minutes: Check for laggards
    cron.schedule('*/15 * * * *', async () => {
        console.log('⏰ Running 15-minute Intelligence Audit...');
        checkLaggards(15);
    });

    // 2. Every Hour: Check for hour-long laggards (stricter nag)
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Running Hourly Intelligence Audit...');
        checkLaggards(60);
    });

    // 3. Daily at Midnight: Reset "Present" status
    cron.schedule('0 0 * * *', async () => {
        console.log('🌅 Resetting daily attendance...');
        await User.updateMany({}, { isPresent: false });
    });
};

async function checkLaggards(thresholdMinutes: number) {
    if (!botInstance || !config.MONITORING_GROUP_ID) {
        console.warn('⚠️ Monitoring skipped: Bot or Group ID missing.');
        return;
    }

    const thresholdDate = new Date(Date.now() - thresholdMinutes * 60 * 1000);

    try {
        // Find users who are present today but haven't updated in X minutes
        const laggards = await User.find({
            isPresent: true,
            $or: [
                { lastUpdateAt: { $lt: thresholdDate } },
                { lastUpdateAt: null }
            ]
        });

        if (laggards.length === 0) {
            console.log('✅ All present units are reporting correctly.');
            return;
        }

        const mentions = laggards.map(u => {
            if (u.telegramUsername) return `@${u.telegramUsername}`;
            if (u.telegramUserId) return `[${u.name}](tg://user?id=${u.telegramUserId})`;
            return u.name;
        }).join(', ');
        const joke = JOKES[Math.floor(Math.random() * JOKES.length)];

        const message = `⚠️ **INTEL GAP DETECTED**\n\nAttention ${mentions}:\n\n"${joke}"\n\nStatus: overdue by ${thresholdMinutes}m. Report in immediately! 🚨`;

        await botInstance.api.sendMessage(config.MONITORING_GROUP_ID, message, { parse_mode: 'Markdown' });
        console.log(`📢 Sent nag message to ${laggards.length} units.`);

    } catch (error) {
        console.error('Error during laggard check:', error);
    }
}
