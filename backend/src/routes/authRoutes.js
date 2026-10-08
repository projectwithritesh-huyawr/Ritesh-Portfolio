import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, me } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { loginLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').isString().isLength({ min: 1, max: 200 }).withMessage('Please enter your password.')
];

router.post('/login', loginLimiter, loginValidation, validateRequest, requireDatabase, login);
router.get('/me', requireAdmin, me);
router.post('/logout', requireAdmin, logout);

export default router;
