import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import shopRoutes from './shops.js';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import customerRoutes from './customers.js';
import saleRoutes from './sales.js';
import repairRoutes from './repairs.js';
import wholesalerRoutes from './wholesaler.js';
import notificationRoutes from './notifications.js';
import vendorRoutes from './vendors.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/shops', shopRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/sales', saleRoutes);
router.use('/repairs', repairRoutes);
router.use('/wholesaler', wholesalerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/vendors', vendorRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
