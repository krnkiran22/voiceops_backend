import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const BOT_API_KEY = process.env.BOT_API_KEY;
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:4000';

async function triggerManualNag() {
    console.log('🚀 TACTICAL TRIGGER: Initiating manual nag check...');

    try {
        const response = await axios.post(`${BACKEND_URL}/api/admin/trigger-nag`, {}, {
            headers: {
                'x-api-key': BOT_API_KEY
            }
        });

        console.log('✅ Response:', response.data);
        console.log('Check your Telegram group for the nag message!');
    } catch (error: any) {
        console.error('❌ Trigger Failed:', error.response?.data || error.message);
    }
}

triggerManualNag();
