import { Router } from 'express';
import * as reasonController from '../controllers/reasonController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', reasonController.getReasons);
router.get('/active', reasonController.getActiveReasons);
router.get('/:id', reasonController.getReasonById);
router.post('/', reasonController.createReason);
router.put('/:id', reasonController.updateReason);
router.delete('/:id', reasonController.deleteReason);

export default router;
