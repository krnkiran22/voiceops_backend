import { Router } from 'express';
import { getMe, updateMe, generateLinkCode, linkTelegram, startTracking, markPresent, markAbsent, updateLastSeen } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { botApiKey } from '../middleware/botApiKey';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.post('/generate-link-code', authMiddleware, generateLinkCode);
router.post('/link-telegram', botApiKey, linkTelegram);
router.post('/start-tracking', botApiKey, startTracking);
router.post('/mark-present', botApiKey, markPresent);
router.post('/mark-absent', botApiKey, markAbsent);
router.post('/update-last-seen', botApiKey, updateLastSeen);

export default router;
