import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { signToken } from '../lib/jwt';

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        phone,
        passwordHash
    });

    res.status(201).json({
        message: 'User registered successfully',
        userId: user._id
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    const token = signToken({ userId: user._id, role: user.role });

    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            telegramUserId: user.telegramUserId,
            telegramUsername: user.telegramUsername
        }
    });
});
 