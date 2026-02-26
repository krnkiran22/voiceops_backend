import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Update from '../models/Update';
import User from '../models/User';

export const createUpdate = asyncHandler(async (req: Request, res: Response) => {
    const {
        telegramUserId, telegramMessageId, telegramChatId, mediaType,
        transcript, summary, topic, durationSeconds, senderName,
        senderTelegramUsername
    } = req.body;

    const user = await User.findOne({ telegramUserId });
    if (!user) {
        res.status(404);
        throw new Error('User not found for this Telegram ID');
    }

    // Check if tracking is active (within 10 hours of last /start)
    if (!user.trackedUntil || new Date() > user.trackedUntil) {
        res.status(403);
        throw new Error('Tracking session expired. Send /start to start a new 10-hour tracking session.');
    }

    const update = await Update.create({
        userId: user._id,
        telegramMessageId,
        telegramChatId,
        mediaType,
        transcript,
        summary,
        topic,
        durationSeconds,
        senderName,
        senderTelegramUsername
    });

    res.status(201).json(update);
});

export const getUpdates = asyncHandler(async (req: Request, res: Response) => {
    const { search, topic, from, to, page = '1', limit = '10' } = req.query;
    const query: any = { userId: req.user?.userId };

    if (search) {
        query.$text = { $search: search as string };
    }

    if (topic && topic !== 'All') {
        query.topic = topic;
    }

    if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from as string);
        if (to) query.createdAt.$lte = new Date(to as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const updates = await Update.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    const total = await Update.countDocuments(query);

    res.json({
        updates,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
    });
});

export const getUpdateById = asyncHandler(async (req: Request, res: Response) => {
    const update = await Update.findOne({ _id: req.params.id, userId: req.user?.userId });
    if (!update) {
        res.status(404);
        throw new Error('Update not found');
    }
    res.json(update);
});

export const deleteUpdate = asyncHandler(async (req: Request, res: Response) => {
    const update = await Update.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });
    if (!update) {
        res.status(404);
        throw new Error('Update not found');
    }
    res.json({ message: 'Update deleted' });
});
