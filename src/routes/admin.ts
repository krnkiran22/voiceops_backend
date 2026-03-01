import { Router } from 'express';
import { getAllUsers, getUserById, getAllUpdates, getStats, getUsersEfficiency } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminGuard } from '../middleware/adminGuard';

import { checkLaggards } from '../bot/services/monitoringService';
import User from '../models/User';
import { botApiKey } from '../middleware/botApiKey';

const router = Router();

// Manual trigger for testing (Protected by API Key)
router.post('/trigger-nag', botApiKey, async (req, res) => {
    console.log('🔗 Manual audit triggered via API (Threshold: 15 minutes)');
    await checkLaggards(15);
    res.json({ success: true, message: 'Audit triggered. Check logs/Telegram.' });
});

// Reset all attendance (Mark everyone absent)
router.post('/reset-all-attendance', botApiKey, async (req, res) => {
    console.log('🧹 Clearing all operational attendance...');
    await User.updateMany({}, { isPresent: false });
    res.json({ success: true, message: 'All users have been marked as ABSENT.' });
});

// Reset specific user attendance by Telegram ID
router.post('/reset-user-attendance/:telegramId', botApiKey, async (req, res) => {
    const { telegramId } = req.params;
    console.log(`🧹 Clearing attendance for unit: ${telegramId}`);
    const result = await User.findOneAndUpdate({ telegramUserId: telegramId }, { isPresent: false });
    if (!result) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: `Unit ${telegramId} marked as ABSENT.` });
});

router.use(authMiddleware, adminGuard);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/updates', getAllUpdates);
router.get('/efficiency', getUsersEfficiency);
router.get('/stats', getStats);

export default router;
