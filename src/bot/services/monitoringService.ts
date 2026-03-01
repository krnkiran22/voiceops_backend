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

    // 1. Every 5 minutes: Check for laggards (More aggressive nagging)
    cron.schedule('*/5 * * * *', async () => {
        console.log('⏰ Running Strategic Intelligence Audit...');
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

export async function checkLaggards(thresholdMinutes: number) {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('📡 AUDITOR (V5): STARTING INTELLIGENCE SCAN...');
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

    if (!botInstance || !config.MONITORING_GROUP_ID) {
        console.error('❌ AUDITOR FAILURE (V5): Bot or Group ID missing!');
        return;
    }

    const now = new Date();
    const thresholdDate = new Date(now.getTime() - thresholdMinutes * 60 * 1000);

    console.log(`⏱️ SCAN TIME: ${now.toISOString()}`);
    console.log(`🔍 THRESHOLD (${thresholdMinutes}m): Updates before ${thresholdDate.toISOString()} are laggards.`);

    try {
        const activeUsers = await User.find({ isPresent: true });
        console.log(`📊 ACTIVE UNITS: ${activeUsers.length}`);

        const laggards = [];

        for (const u of activeUsers) {
            const lastUpdate = u.lastUpdateAt ? u.lastUpdateAt.toISOString() : 'NEVER';
            const isLaggard = !u.lastUpdateAt || u.lastUpdateAt < thresholdDate;

            console.log(`👤 UNIT: ${u.name} | LAST SIGNAL: ${lastUpdate} | LAGGARD: ${isLaggard}`);

            if (isLaggard) {
                laggards.push(u);
            }
        }

        if (laggards.length === 0) {
            console.log('✅ AUDIT COMPLETE: All present units are within SOP parameters.');
            return;
        }

        const mentions = laggards.map(u => {
            if (u.telegramUsername) return `@${u.telegramUsername}`;
            if (u.telegramUserId) return `<b>${u.name}</b>`;
            return u.name;
        }).join(', ');

        const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
        const message = `⚠️ <b>INTEL GAP DETECTED</b>\n\nAttention ${mentions}:\n\n<i>"${joke}"</i>\n\nStatus: overdue by ${thresholdMinutes}m. Report in immediately! 🚨`;

        console.log(`📢 DISPATCHING NAG: To ${laggards.length} units...`);

        await botInstance.api.sendMessage(config.MONITORING_GROUP_ID, message, { parse_mode: 'HTML' }).then(() => {
            console.log('✅ DISPATCH SUCCESSFUL.');
        }).catch(err => {
            console.error('❌ DISPATCH FAILED:', err.message);
        });

    } catch (error) {
        console.error('💣 AUDIT CRASHED:', error);
    }
}
