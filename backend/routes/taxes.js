import { Router } from 'express';
import * as taxController from '../controllers/taxController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', taxController.getTaxes);
router.get('/:id', taxController.getTaxById);
router.post('/', requireRole('admin', 'super_admin'), taxController.createTax);
router.put('/:id', requireRole('admin', 'super_admin'), taxController.updateTax);
router.delete('/:id', requireRole('admin', 'super_admin'), taxController.deleteTax);

export default router;
