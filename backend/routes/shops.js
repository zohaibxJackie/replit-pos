import { Router } from 'express';
import * as shopController from '../controllers/shopController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createShopSchema } from '../validators/shop.js';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole('super_admin'), shopController.getShops);
router.get('/:id', shopController.getShopById);
router.post('/', requireRole('super_admin', 'admin'), validate(createShopSchema), shopController.createShop);
router.put('/:id', requireRole('super_admin', 'admin'), shopController.updateShop);
router.delete('/:id', requireRole('super_admin'), shopController.deleteShop);

export default router;
