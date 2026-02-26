import OpenAI from 'openai';
import { config } from '../config';

class AIClientManager {
    private clients: OpenAI[];
    private currentKeyIndex: number = 0;

    constructor() {
        this.clients = config.AI_API_KEYS.map(key => new OpenAI({
            apiKey: key,
            baseURL: config.AI_BASE_URL,
        }));
    }

    async execute<T>(fn: (client: OpenAI) => Promise<T>): Promise<T> {
        if (this.clients.length === 0) {
            throw new Error('No AI API keys configured');
        }

        let lastError: any;
        const startIndex = this.currentKeyIndex;

        // Try each client starting from the current index
        for (let i = 0; i < this.clients.length; i++) {
            const index = (startIndex + i) % this.clients.length;
            this.currentKeyIndex = index;

            try {
                console.log(`Using AI API key index: ${index}`);
                return await fn(this.clients[index]);
            } catch (error: any) {
                console.error(`AI Request failed with key index ${index}:`, error.message);
                lastError = error;

                // If it's a rate limit or server error, continue to next key
                // Otherwise, if it's a structural error (e.g. invalid request), maybe throw immediately
                // But for rotation, we generally want to try the next key
                continue;
            }
        }

        throw lastError || new Error('All AI API keys failed');
    }

    getCurrentClient(): OpenAI {
        return this.clients[this.currentKeyIndex];
    }
}

export const aiManager = new AIClientManager();
