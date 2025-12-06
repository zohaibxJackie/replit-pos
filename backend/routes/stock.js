import { Router } from 'express';
import * as stockController from '../controllers/stockController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', stockController.getStock);
router.get('/summary', stockController.getStockSummary);
router.get('/imei/:imei', stockController.getStockByImei);
router.get('/barcode/:barcode', stockController.getStockByBarcode);
router.get('/:id', stockController.getStockById);
router.post('/', requireRole('admin', 'super_admin', 'sales_person'), stockController.createStock);
router.post('/bulk', requireRole('admin', 'super_admin'), stockController.bulkCreateStock);
router.put('/:id', requireRole('admin', 'super_admin', 'sales_person'), stockController.updateStock);
router.delete('/:id', requireRole('admin', 'super_admin'), stockController.deleteStock);

export default router;
