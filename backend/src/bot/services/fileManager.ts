import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

export async function downloadFile(url: string, fileName: string): Promise<string> {
    const filePath = path.join(config.TEMP_DIR, fileName);

    if (!fs.existsSync(config.TEMP_DIR)) {
        fs.mkdirSync(config.TEMP_DIR, { recursive: true });
    }

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
}

export function deleteFile(filePath: string) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
