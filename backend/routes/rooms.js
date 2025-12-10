import express from 'express';
import { body } from 'express-validator';
import {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom
} from '../controllers/roomController.js';
import authMiddleware from '../middleware/auth.js';
import handleValidationErrors from '../middleware/validator.js';

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  [
    body('name').trim().isLength({ min: 1 }).withMessage('Room name is required'),
    body('description').optional().trim()
  ],
  handleValidationErrors,
  createRoom
);

router.get('/', authMiddleware, getRooms);
router.get('/:id', authMiddleware, getRoomById);
router.post('/:id/join', authMiddleware, joinRoom);
router.post('/:id/leave', authMiddleware, leaveRoom);

export default router;
