import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, getAllUsers } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import handleValidationErrors from '../middleware/validator.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  handleValidationErrors,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidationErrors,
  login
);

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/users', authMiddleware, getAllUsers);

export default router;
