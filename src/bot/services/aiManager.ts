import OpenAI from 'openai';
import { config } from '../config';

class AIClientManager {
    private clients: OpenAI[];
    private currentKeyIndex: number = 0;

    constructor() {
        if (config.AI_PROVIDER === 'ollama') {
            this.clients = [new OpenAI({
                apiKey: 'ollama', // Dummy key
                baseURL: config.OLLAMA_BASE_URL,
            })];
        } else {
            this.clients = config.AI_API_KEYS.map(key => {
                const baseURL = config.AI_BASE_URL || (key.startsWith('gsk_') ? 'https://api.groq.com/openai/v1' : undefined);
                return new OpenAI({
                    apiKey: key,
                    baseURL: baseURL,
                });
            });
        }
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
                console.log(`🤖 AI Request [index ${index}]: Starting... (Model: ${config.AI_MODEL})`);
                const result = await fn(this.clients[index]);
                console.log(`✅ AI Request [index ${index}]: Success.`);
                return result;
            } catch (error: any) {
                console.error(`❌ AI Request [index ${index}]: Failed!`);
                console.error(`   Error: ${error.message}`);
                if (error.response) {
                    console.error(`   Status: ${error.response.status}`);
                    console.error(`   Data:`, JSON.stringify(error.response.data));
                }
                lastError = error;
                continue;
            }
        }

        console.error('🛑 All AI Providers failed.');
        throw lastError || new Error('All AI API keys failed');
    }

    getCurrentClient(): OpenAI {
        return this.clients[this.currentKeyIndex];
    }
}

export const aiManager = new AIClientManager();
