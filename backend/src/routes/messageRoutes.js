import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { deleteMessage, getMessage, listMessages, updateMessageStatus } from '../controllers/messageController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
router.use(requireAdmin, requireDatabase);
router.get('/', query('status').optional().isIn(['unread', 'read', 'replied']).withMessage('Invalid message status.'), validateRequest, listMessages);
router.get('/:id', param('id').isMongoId().withMessage('Invalid message ID.'), validateRequest, getMessage);
router.patch('/:id/status', [
  param('id').isMongoId().withMessage('Invalid message ID.'),
  body('status').isIn(['unread', 'read', 'replied']).withMessage('Invalid message status.')
], validateRequest, updateMessageStatus);
router.delete('/:id', param('id').isMongoId().withMessage('Invalid message ID.'), validateRequest, deleteMessage);

export default router;
