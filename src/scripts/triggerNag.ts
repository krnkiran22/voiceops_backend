import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const BOT_API_KEY = process.env.BOT_API_KEY;
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:4000';

async function run() {
    const action = process.argv[2] || 'nag';
    const param = process.argv[3];

    console.log(`🔗 Target URL: ${BACKEND_URL}`);
    console.log(`🔑 API Key Status: ${BOT_API_KEY ? 'Present' : 'MISSING'}`);

    try {
        let endpoint = '/api/admin/trigger-nag';
        let method: 'POST' = 'POST';

        if (action === 'reset-all') {
            endpoint = '/api/admin/reset-all-attendance';
            console.log('🧹 NUKE: Marking all users as ABSENT...');
        } else if (action === 'reset-user' && param) {
            endpoint = `/api/admin/reset-user-attendance/${param}`;
            console.log(`🧹 RESET: Marking unit ${param} as ABSENT...`);
        } else if (action === 'delete-user' && param) {
            endpoint = '/api/admin/delete-user';
            console.log(`🔥 PURGE: Deleting account and intel for ${param}...`);
            const response = await axios.post(`${BACKEND_URL}${endpoint}`, { email: param }, {
                headers: {
                    'x-bot-api-key': BOT_API_KEY
                }
            });
            console.log('✅ Success:', response.data.message);
            return;
        } else {
            console.log('🚀 NAGGING: Initiating manual laggard audit (15m threshold)...');
        }

        const response = await axios.post(`${BACKEND_URL}${endpoint}`, {}, {
            headers: {
                'x-bot-api-key': BOT_API_KEY
            }
        });

        console.log('✅ Success:', response.data.message || response.data);
    } catch (error: any) {
        console.error('❌ Action Failed:', error.response?.data?.message || error.response?.data || error.message);
    }
}

run();
