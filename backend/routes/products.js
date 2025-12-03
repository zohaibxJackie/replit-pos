import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createProductSchema, updateProductSchema, updateStockSchema } from '../validators/product.js';

const router = Router();

router.use(authenticateToken);

router.get('/', productController.getProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/catalog/mobiles', productController.getMobileCatalog);
router.get('/catalog/mobiles/brands', productController.getMobileCatalogBrands);
router.get('/catalog/mobiles/models', productController.getMobileCatalogModels);
router.get('/catalog/mobiles/colors', productController.getMobileCatalogColors);
router.get('/catalog/mobiles/item', productController.getMobileCatalogItem);
router.get('/catalog/accessories', productController.getAccessoryCatalog);
router.get('/catalog/accessories/brands', productController.getAccessoryCatalogBrands);
router.get('/barcode/:barcode', productController.getProductByBarcode);
router.get('/imei/:imei', productController.getProductByImei);
router.get('/:id', productController.getProductById);
router.post('/', requireRole('admin', 'super_admin'), validate(createProductSchema), productController.createProduct);
router.put('/:id', requireRole('admin', 'super_admin'), validate(updateProductSchema), productController.updateProduct);
router.patch('/:id/stock', requireRole('admin', 'super_admin', 'sales_person'), validate(updateStockSchema), productController.updateStock);
router.delete('/:id', requireRole('admin', 'super_admin'), productController.deleteProduct);

export default router;
