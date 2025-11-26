import { Router } from 'express';
import * as saleController from '../controllers/saleController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createSaleSchema } from '../validators/sale.js';

const router = Router();

router.use(authenticateToken);

router.get('/', saleController.getSales);
router.get('/today', saleController.getTodaySales);
router.get('/analytics', saleController.getSalesAnalytics);
router.get('/:id', saleController.getSaleById);
router.post('/', validate(createSaleSchema), saleController.createSale);

export default router;
