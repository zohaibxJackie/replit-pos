import { z } from 'zod';

export const createShopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  subscriptionTier: z.enum(['silver', 'gold', 'platinum']).default('silver')
});

export const updateShopSchema = createShopSchema.partial();

export default { createShopSchema, updateShopSchema };
