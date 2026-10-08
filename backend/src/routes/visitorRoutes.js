import { Router } from 'express';
import { body } from 'express-validator';
import { getVisitorStats, recordVisit } from '../controllers/visitorController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { visitorLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
router.post('/', visitorLimiter, requireDatabase, body('page').trim().matches(/^\/[a-zA-Z0-9/_-]{0,119}$/).withMessage('Invalid page path.'), validateRequest, recordVisit);
router.get('/stats', requireAdmin, getVisitorStats);

export default router;
