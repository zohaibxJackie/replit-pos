import { Router } from 'express';
import * as shopController from '../controllers/shopController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createShopSchema } from '../validators/shop.js';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole('super_admin'), shopController.getShops);
router.get('/my-shops', requireRole('admin'), shopController.getMyShops);
router.get('/:id', shopController.getShopById);
router.post('/', requireRole('super_admin', 'admin'), validate(createShopSchema), shopController.createShop);
router.post('/admin', requireRole('admin'), shopController.createAdminShop);
router.put('/admin/:id', requireRole('admin'), shopController.updateAdminShop);
router.put('/:id', requireRole('super_admin', 'admin'), shopController.updateShop);
router.delete('/:id', requireRole('super_admin'), shopController.deleteShop);
// Router to get stock quantity of a specific product of a specific shop
router.get('/:shopId/products/:productId/stock', requireRole('admin'), shopController.getStockQty);

export default router;
