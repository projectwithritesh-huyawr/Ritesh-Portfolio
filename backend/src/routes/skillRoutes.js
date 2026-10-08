import { Router } from 'express';
import { body, param } from 'express-validator';
import { createSkill, deleteSkill, listSkills, updateSkill } from '../controllers/skillController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
const idParam = param('id').isMongoId().withMessage('Invalid skill ID.');
const skillValidation = [
  body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Please enter a skill name.'),
  body('category').trim().isLength({ min: 1, max: 100 }).withMessage('Please enter a skill category.'),
  body('icon').optional().isString().trim().isLength({ max: 100 }),
  body('order').optional().isInt({ min: 0, max: 10000 }).withMessage('Order must be between 0 and 10000.')
];

router.get('/', requireDatabase, listSkills);
router.post('/', requireAdmin, requireDatabase, skillValidation, validateRequest, createSkill);
router.put('/:id', requireAdmin, requireDatabase, idParam, skillValidation, validateRequest, updateSkill);
router.delete('/:id', requireAdmin, requireDatabase, idParam, validateRequest, deleteSkill);

export default router;
