import { Router } from 'express';
import * as stockTransferController from '../controllers/stockTransferController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', stockTransferController.getStockTransfers);
router.get('/product/:imei', stockTransferController.getProductByImeiForTransfer);
router.post('/', requireRole('admin', 'super_admin', 'sales_person'), stockTransferController.createStockTransfer);

export default router;
