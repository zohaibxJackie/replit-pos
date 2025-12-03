import { Router } from 'express';
import * as vendorController from '../controllers/vendorController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createVendorSchema } from '../validators/vendor.js';

const router = Router();

router.use(authenticateToken);

router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.get('/:id/products', vendorController.getVendorProducts);
router.post('/', requireRole('admin', 'super_admin'), validate(createVendorSchema), vendorController.createVendor);
router.put('/:id', requireRole('admin', 'super_admin'), vendorController.updateVendor);
router.delete('/:id', requireRole('admin', 'super_admin'), vendorController.deleteVendor);

export default router;
