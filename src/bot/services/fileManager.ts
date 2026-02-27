import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Configure ffmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

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

export async function extractAudio(videoPath: string): Promise<string> {
    const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .toFormat('mp3')
            .on('end', () => resolve(audioPath))
            .on('error', (err) => reject(err))
            .save(audioPath);
    });
}

export function deleteFile(filePath: string) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
