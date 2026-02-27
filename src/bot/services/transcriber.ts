import fs from 'fs';
import { aiManager } from './aiManager';
import { config } from '../config';

export async function transcribeAudio(filePath: string): Promise<string> {
    return await aiManager.execute(async (client) => {
        const isGroq = client.apiKey.startsWith('gsk_');
        const model = isGroq ? 'whisper-large-v3' : 'whisper-1';

        console.log(`🎙️ Transcribing with ${isGroq ? 'Groq' : 'OpenAI'} (${model})...`);

        const response = await client.audio.transcriptions.create({
            model: model,
            file: fs.createReadStream(filePath),
        });

        return response.text;
    });
}
