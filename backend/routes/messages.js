import express from 'express';
import { getMessages, createMessage, deleteMessage } from '../controllers/messageController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', authMiddleware, getMessages);
router.post('/', authMiddleware, createMessage);
router.delete('/:messageId', authMiddleware, deleteMessage);

export default router;
