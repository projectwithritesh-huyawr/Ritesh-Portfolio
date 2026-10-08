import { Router } from 'express';
import { body } from 'express-validator';
import { submitContact } from '../controllers/contactController.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { contactLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post('/', contactLimiter, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Please enter your name.'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('subject').trim().isLength({ min: 1, max: 160 }).withMessage('Please enter a subject.'),
  body('message').trim().isLength({ min: 10, max: 5000 }).withMessage('Please enter a message between 10 and 5000 characters.')
], validateRequest, requireDatabase, submitContact);

export default router;
