import axios from 'axios';
import { config } from './config';

const apiClient = axios.create({
    baseURL: config.BACKEND_API_URL,
    headers: {
        'x-bot-api-key': config.BOT_API_KEY,
    },
});

export default apiClient;
