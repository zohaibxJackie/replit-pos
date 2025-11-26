import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', requireRole('admin', 'super_admin'), categoryController.createCategory);
router.put('/:id', requireRole('admin', 'super_admin'), categoryController.updateCategory);
router.delete('/:id', requireRole('admin', 'super_admin'), categoryController.deleteCategory);

export default router;
