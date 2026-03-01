import { Router } from 'express';
import { getAllUsers, getUserById, getAllUpdates, getStats, getUsersEfficiency } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminGuard } from '../middleware/adminGuard';

import { checkLaggards } from '../bot/services/monitoringService';

const router = Router();

// Manual trigger for testing (Protected by API Key)
router.post('/trigger-nag', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.BOT_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔗 Manual audit triggered via API');
    await checkLaggards(15);
    res.json({ success: true, message: 'Audit triggered. Check logs/Telegram.' });
});

router.use(authMiddleware, adminGuard);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/updates', getAllUpdates);
router.get('/efficiency', getUsersEfficiency);
router.get('/stats', getStats);

export default router;
