import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole('super_admin', 'admin'), userController.getUsers);
router.get('/:id', requireRole('super_admin', 'admin'), userController.getUserById);
router.post('/', requireRole('super_admin', 'admin'), userController.createUser);
router.put('/:id', requireRole('super_admin', 'admin'), userController.updateUser);
router.delete('/:id', requireRole('super_admin', 'admin'), userController.deleteUser);

export default router;
