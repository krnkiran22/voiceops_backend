import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const BOT_API_KEY = process.env.BOT_API_KEY;

export const botApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-bot-api-key'];

    if (!apiKey || apiKey !== BOT_API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid Bot API Key' });
    }

    next();
};
