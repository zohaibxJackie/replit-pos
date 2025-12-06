import { Router } from 'express';
import * as variantController from '../controllers/variantController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', variantController.getVariants);
router.get('/search', variantController.searchVariants);
router.get('/:id', variantController.getVariantById);
router.post('/', requireRole('admin', 'super_admin'), variantController.createVariant);
router.put('/:id', requireRole('admin', 'super_admin'), variantController.updateVariant);
router.delete('/:id', requireRole('admin', 'super_admin'), variantController.deleteVariant);

export default router;
