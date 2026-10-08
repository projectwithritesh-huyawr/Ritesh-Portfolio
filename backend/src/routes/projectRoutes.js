import { Router } from 'express';
import { body, param } from 'express-validator';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../controllers/projectController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
const idParam = param('id').isMongoId().withMessage('Invalid project ID.');
const projectValidation = [
  body('title').trim().isLength({ min: 1, max: 120 }).withMessage('Please enter a project title.'),
  body('slug').optional({ values: 'falsy' }).trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Project slug must contain lowercase letters, numbers, and hyphens.'),
  body('category').trim().isLength({ min: 1, max: 100 }).withMessage('Please enter a project category.'),
  body('description').trim().isLength({ min: 1, max: 3000 }).withMessage('Please enter a project description.'),
  body('technologies').optional().isArray({ max: 30 }).withMessage('Technologies must be a list of up to 30 items.'),
  body('technologies.*').optional().isString().trim().isLength({ min: 1, max: 60 }),
  body('image').optional().isString().trim().isLength({ max: 1000 }).custom((value) => {
    if (!value) return true;
    return /^https:\/\//i.test(value) || /^(?!\/)(?!.*\.\.)[\w./-]+\.(?:jpe?g|png|webp|gif|svg)$/i.test(value);
  }).withMessage('Use an HTTPS image URL or a safe relative image path.'),
  body('githubUrl').optional({ values: 'falsy' }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('GitHub URL must use HTTPS.'),
  body('liveUrl').optional({ values: 'falsy' }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('Live URL must use HTTPS.'),
  body('featured').optional().isBoolean().withMessage('Featured must be true or false.'),
  body('order').optional().isInt({ min: 0, max: 10000 }).withMessage('Order must be between 0 and 10000.')
];

router.get('/', requireDatabase, listProjects);
router.get('/:slug', requireDatabase, param('slug').matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), validateRequest, getProject);
router.post('/', requireAdmin, requireDatabase, projectValidation, validateRequest, createProject);
router.put('/:id', requireAdmin, requireDatabase, idParam, projectValidation, validateRequest, updateProject);
router.delete('/:id', requireAdmin, requireDatabase, idParam, validateRequest, deleteProject);

export default router;
