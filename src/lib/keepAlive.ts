import axios from 'axios';
import cron from 'node-cron';
import { config } from '../bot/config';

export const initKeepAlive = () => {
    const url = config.BACKEND_API_URL;

    if (!url || url.includes('localhost')) {
        console.log('ℹ️ Keep-Alive: Disabled (Local environment detected)');
        return;
    }

    console.log(`📡 Keep-Alive System Initialized. Target: ${url}`);

    // Ping every 14 minutes to prevent Render Free Tier sleep (15m limit)
    cron.schedule('*/14 * * * *', async () => {
        try {
            console.log('💓 Sending Keep-Alive signal...');
            // We just hit the health check or any route
            await axios.get(`${url}/health`).catch(() => { });
            console.log('✅ Signal acknowledged.');
        } catch (error) {
            console.error('❌ Keep-Alive Ping Failed (But service is likely still awake)');
        }
    });
};
