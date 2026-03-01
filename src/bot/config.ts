import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:4000',
    BOT_API_KEY: process.env.BOT_API_KEY || '',

    // AI CONFIGURATION
    AI_PROVIDER: process.env.AI_PROVIDER || (process.env.OPENAI_API_KEY?.startsWith('gsk_') ? 'groq' : 'openai'),
    AI_API_KEYS: (process.env.OPENAI_API_KEY || '').split(',').map(key => key.trim()).filter(Boolean),

    // OLLAMA SPECIFIC (If AI_PROVIDER is 'ollama')
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',

    // MODELS
    AI_BASE_URL: process.env.AI_BASE_URL, // Explicit override
    AI_MODEL: process.env.AI_MODEL || 'llama3',
    AI_TRANSCRIPTION_MODEL: process.env.AI_TRANSCRIPTION_MODEL || 'whisper-large-v3',

    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    TEMP_DIR: process.env.TEMP_DIR || path.join(process.cwd(), 'temp'),
};
