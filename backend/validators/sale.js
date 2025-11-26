import { z } from 'zod';

export const saleItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive')
});

export const createSaleSchema = z.object({
  customerId: z.string().uuid().optional(),
  paymentMethod: z.enum(['cash', 'card', 'mobile', 'bank_transfer']).default('cash'),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  notes: z.string().optional()
});

export const saleReturnSchema = z.object({
  saleId: z.string().uuid(),
  items: z.array(z.object({
    saleItemId: z.string().uuid(),
    quantity: z.number().int().positive(),
    reason: z.string().min(1)
  })).min(1)
});

export default { createSaleSchema, saleItemSchema, saleReturnSchema };
