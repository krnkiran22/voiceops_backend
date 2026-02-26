import { Router } from 'express';
import { createUpdate, getUpdates, getUpdateById, deleteUpdate } from '../controllers/updateController';
import { authMiddleware } from '../middleware/authMiddleware';
import { botApiKey } from '../middleware/botApiKey';

const router = Router();

router.post('/', botApiKey, createUpdate);
router.get('/', authMiddleware, getUpdates);
router.get('/:id', authMiddleware, getUpdateById);
router.delete('/:id', authMiddleware, deleteUpdate);

export default router;
