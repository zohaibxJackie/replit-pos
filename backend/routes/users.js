import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/profile', userController.getMyProfile);
router.put('/profile', userController.updateMyProfile);

router.get('/staff-limits', requireRole('admin'), userController.getStaffLimits);
router.post('/sales-person', requireRole('admin'), userController.createSalesPerson);

router.post('/request-password-reset', requireRole('sales_person'), userController.requestPasswordReset);
router.get('/password-reset-requests', requireRole('admin', 'super_admin'), userController.getPasswordResetRequests);
router.post('/:id/reset-password', requireRole('admin', 'super_admin'), userController.resetUserPassword);
router.post('/password-reset-requests/:id/reject', requireRole('admin', 'super_admin'), userController.rejectPasswordResetRequest);

router.get('/', requireRole('super_admin', 'admin'), userController.getUsers);
router.get('/:id', requireRole('super_admin', 'admin'), userController.getUserById);
router.post('/', requireRole('super_admin', 'admin'), userController.createUser);
router.put('/:id', requireRole('super_admin', 'admin'), userController.updateUser);
router.delete('/:id', requireRole('super_admin', 'admin'), userController.deleteUser);

export default router;
