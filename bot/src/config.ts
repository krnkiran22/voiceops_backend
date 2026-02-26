import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:4000',
    BOT_API_KEY: process.env.BOT_API_KEY || '',
    // Support multiple keys separated by comma
    AI_API_KEYS: (process.env.OPENAI_API_KEY || '').split(',').map(key => key.trim()).filter(Boolean),
    AI_BASE_URL: process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1',
    AI_MODEL: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    TEMP_DIR: process.env.TEMP_DIR || path.join(process.cwd(), 'temp'),
};
