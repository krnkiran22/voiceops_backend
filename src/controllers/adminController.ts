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
    const updates = await Update.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    res.json(updates);
});

export const getUsersEfficiency = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find({ role: 'operator' }).select('-passwordHash');

    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    const usersEfficiency = await Promise.all(users.map(async (user) => {
        const updates = await Update.find({
            userId: user._id,
            createdAt: { $gte: startTime }
        }).sort({ createdAt: 1 });

        // Hour slots (last 24 slots)
        const hourSlotsWithUpdates = new Set(updates.map(u => {
            const d = new Date(u.createdAt);
            return `${d.getDate()}-${d.getHours()}`;
        })).size;
        const hourEfficiency = (hourSlotsWithUpdates / 24) * 100;

        // 15-min slots (last 24 * 4 = 96 slots)
        const fifteenMinSlotsWithUpdates = new Set(updates.map(u => {
            const d = new Date(u.createdAt);
            return `${d.getDate()}-${d.getHours()}-${Math.floor(d.getMinutes() / 15)}`;
        })).size;
        const fifteenMinEfficiency = (fifteenMinSlotsWithUpdates / 96) * 100;

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            telegramUsername: user.telegramUsername,
            hourEfficiency: Math.min(hourEfficiency, 100),
            fifteenMinEfficiency: Math.min(fifteenMinEfficiency, 100),
            lastUpdate: updates.length > 0 ? updates[updates.length - 1].createdAt : null,
            totalUpdatesLast24h: updates.length
        };
    }));

    res.json(usersEfficiency);
});

export const getStats = asyncHandler(async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments({ role: 'operator' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalUpdates = await Update.countDocuments();
    const updatesToday = await Update.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
        totalUsers,
        totalAdmins,
        totalUpdates,
        updatesToday
    });
});

export const deleteUserByEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error(`User with email ${email} not found.`);
    }

    // Also delete all updates associated with this user
    await Update.deleteMany({ userId: user._id });
    const emailToLog = user.email;
    await user.deleteOne();

    console.log(`🧹 Account Purge: Deleted ${emailToLog} and all associated intel.`);
    res.json({ success: true, message: `Account and intelligence for ${emailToLog} has been permanently deleted.` });
});
