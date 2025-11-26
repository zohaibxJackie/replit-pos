import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const updateCustomerSchema = createCustomerSchema.partial();

export default { createCustomerSchema, updateCustomerSchema };
