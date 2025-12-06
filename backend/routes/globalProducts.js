import { Router } from 'express';
import * as globalProductController from '../controllers/globalProductController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', globalProductController.getGlobalProducts);
router.get('/search', globalProductController.searchGlobalProducts);
router.get('/:id', globalProductController.getGlobalProductById);
router.post('/', requireRole('admin', 'super_admin'), globalProductController.createGlobalProduct);
router.put('/:id', requireRole('admin', 'super_admin'), globalProductController.updateGlobalProduct);
router.delete('/:id', requireRole('admin', 'super_admin'), globalProductController.deleteGlobalProduct);

export default router;
