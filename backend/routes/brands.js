import { Router } from 'express';
import * as brandController from '../controllers/brandController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', brandController.getBrands);
router.get('/:id', brandController.getBrandById);
router.post('/', requireRole('admin', 'super_admin'), brandController.createBrand);
router.put('/:id', requireRole('admin', 'super_admin'), brandController.updateBrand);
router.delete('/:id', requireRole('admin', 'super_admin'), brandController.deleteBrand);

export default router;
