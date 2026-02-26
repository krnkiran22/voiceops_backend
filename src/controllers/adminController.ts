import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Update from '../models/Update';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find().select('-passwordHash');
    res.json(users);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user);
});

export const getAllUpdates = asyncHandler(async (req: Request, res: Response) => {
    const updates = await Update.find().sort({ createdAt: -1 });
    res.json(updates);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments();
    const totalUpdates = await Update.countDocuments();
    const updatesToday = await Update.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
        totalUsers,
        totalUpdates,
        updatesToday
    });
});
