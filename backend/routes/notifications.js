import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

router.get('/activity-logs', requireRole('super_admin', 'admin'), notificationController.getActivityLogs);

export default router;
