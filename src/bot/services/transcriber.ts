import fs from 'fs';
import { aiManager } from './aiManager';
import { config } from '../config';

export async function transcribeAudio(filePath: string): Promise<string> {
    return await aiManager.execute(async (client) => {
        const model = config.AI_TRANSCRIPTION_MODEL;
        console.log(`🎙️ Transcribing with ${config.AI_PROVIDER.toUpperCase()} (${model})...`);

        const response = await client.audio.transcriptions.create({
            model: model,
            file: fs.createReadStream(filePath),
        });

        return response.text;
    });
}
