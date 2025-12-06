import { Router } from 'express';
import * as garbageController from '../controllers/garbageController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', garbageController.getGarbage);
router.get('/:id', garbageController.getGarbageById);
router.post('/', requireRole('admin', 'super_admin', 'sales_person'), garbageController.createGarbage);
router.put('/:id', requireRole('admin', 'super_admin'), garbageController.updateGarbage);
router.delete('/:id', requireRole('admin', 'super_admin'), garbageController.deleteGarbage);

export default router;
