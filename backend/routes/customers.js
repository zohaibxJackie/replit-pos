import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { createCustomerSchema } from '../validators/customer.js';

const router = Router();

router.use(authenticateToken);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
