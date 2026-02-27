import fs from 'fs';
import { aiManager } from './aiManager';
import { config } from '../config';

export async function transcribeAudio(filePath: string): Promise<string> {
    return await aiManager.execute(async (client) => {
        const response = await client.audio.transcriptions.create({
            model: config.AI_TRANSCRIPTION_MODEL,
            file: fs.createReadStream(filePath),
        });

        return response.text;
    });
}
