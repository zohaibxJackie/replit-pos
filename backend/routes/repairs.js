import { Router } from 'express';
import * as repairController from '../controllers/repairController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createRepairJobSchema, repairPaymentSchema, createRepairPersonSchema } from '../validators/repair.js';

const router = Router();

router.use(authenticateToken);

router.get('/jobs', repairController.getRepairJobs);
router.get('/jobs/:id', repairController.getRepairJobById);
router.post('/jobs', validate(createRepairJobSchema), repairController.createRepairJob);
router.put('/jobs/:id', repairController.updateRepairJob);
router.post('/jobs/:id/payments', validate(repairPaymentSchema), repairController.addRepairPayment);

router.get('/persons', repairController.getRepairPersons);
router.post('/persons', requireRole('admin', 'super_admin'), validate(createRepairPersonSchema), repairController.createRepairPerson);
router.put('/persons/:id', requireRole('admin', 'super_admin'), repairController.updateRepairPerson);
router.delete('/persons/:id', requireRole('admin', 'super_admin'), repairController.deleteRepairPerson);

export default router;
