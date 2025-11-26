import { Router } from 'express';
import * as wholesalerController from '../controllers/wholesalerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createWholesalerProductSchema, createPurchaseOrderSchema, updatePurchaseOrderStatusSchema, createDealRequestSchema } from '../validators/wholesaler.js';

const router = Router();

router.use(authenticateToken);

router.get('/list', wholesalerController.getWholesalers);

router.get('/products', wholesalerController.getWholesalerProducts);
router.get('/products/:id', wholesalerController.getWholesalerProductById);
router.post('/products', requireRole('wholesaler'), validate(createWholesalerProductSchema), wholesalerController.createWholesalerProduct);
router.put('/products/:id', requireRole('wholesaler'), wholesalerController.updateWholesalerProduct);
router.delete('/products/:id', requireRole('wholesaler'), wholesalerController.deleteWholesalerProduct);

router.get('/orders', wholesalerController.getPurchaseOrders);
router.get('/orders/:id', wholesalerController.getPurchaseOrderById);
router.post('/orders', requireRole('admin', 'super_admin'), validate(createPurchaseOrderSchema), wholesalerController.createPurchaseOrder);
router.patch('/orders/:id/status', requireRole('wholesaler'), validate(updatePurchaseOrderStatusSchema), wholesalerController.updatePurchaseOrderStatus);

router.get('/deals', wholesalerController.getDealRequests);
router.post('/deals', requireRole('admin', 'super_admin'), validate(createDealRequestSchema), wholesalerController.createDealRequest);
router.patch('/deals/:id/status', requireRole('wholesaler'), wholesalerController.updateDealRequestStatus);

export default router;
