import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
  address: z.string().optional().nullable()
});

export const updateVendorSchema = createVendorSchema.partial();

export default { createVendorSchema, updateVendorSchema };
