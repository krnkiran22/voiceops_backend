import fs from 'fs';
import { aiManager } from './aiManager';

export async function transcribeAudio(filePath: string): Promise<string> {
    return await aiManager.execute(async (client) => {
        const response = await client.audio.transcriptions.create({
            model: 'whisper-1',
            file: fs.createReadStream(filePath),
        });

        return response.text;
    });
}
