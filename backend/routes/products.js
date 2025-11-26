import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createProductSchema, updateStockSchema } from '../validators/product.js';

const router = Router();

router.use(authenticateToken);

router.get('/', productController.getProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/barcode/:barcode', productController.getProductByBarcode);
router.get('/:id', productController.getProductById);
router.post('/', requireRole('admin', 'super_admin'), validate(createProductSchema), productController.createProduct);
router.put('/:id', requireRole('admin', 'super_admin'), productController.updateProduct);
router.patch('/:id/stock', requireRole('admin', 'super_admin', 'sales_person'), validate(updateStockSchema), productController.updateStock);
router.delete('/:id', requireRole('admin', 'super_admin'), productController.deleteProduct);

export default router;
