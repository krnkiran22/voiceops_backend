import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import LinkCode from '../models/LinkCode';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user?.userId,
        { name, phone },
        { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json(user);
});

export const generateLinkCode = asyncHandler(async (req: Request, res: Response) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await LinkCode.create({
        userId: req.user?.userId,
        code,
        expiresAt,
        used: false
    });

    res.json({ code });
});

export const linkTelegram = asyncHandler(async (req: Request, res: Response) => {
    const { code, telegramUserId, telegramUsername } = req.body;

    const linkCode = await LinkCode.findOne({ code, used: false, expiresAt: { $gt: new Date() } });
    if (!linkCode) {
        res.status(400);
        throw new Error('Invalid or expired code');
    }

    const user = await User.findById(linkCode.userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.telegramUserId = telegramUserId;
    user.telegramUsername = telegramUsername;
    await user.save();

    linkCode.used = true;
    await linkCode.save();

    res.json({ success: true, userName: user.name });
});

export const startTracking = asyncHandler(async (req: Request, res: Response) => {
    const { telegramUserId } = req.body;
    const user = await User.findOne({ telegramUserId });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Set tracking to 10 hours from now
    user.trackedUntil = new Date(Date.now() + 10 * 60 * 60 * 1000);
    await user.save();

    res.json({ success: true, trackedUntil: user.trackedUntil });
});
