import { Router } from 'express';
import { getAllUsers, getUserById, getAllUpdates, getStats } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminGuard } from '../middleware/adminGuard';

const router = Router();

router.use(authMiddleware, adminGuard);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/updates', getAllUpdates);
router.get('/stats', getStats);

export default router;
