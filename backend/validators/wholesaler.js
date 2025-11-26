import { z } from 'zod';

export const createWholesalerProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.enum(['mobile', 'accessory']),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0).default(0),
  discount: z.number().min(0).max(100).default(0),
  minOrderQuantity: z.number().int().positive().default(1),
  unit: z.string().default('pack'),
  imageUrl: z.string().url().optional()
});

export const updateWholesalerProductSchema = createWholesalerProductSchema.partial();

export const purchaseOrderItemSchema = z.object({
  wholesalerProductId: z.string().uuid(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive()
});

export const createPurchaseOrderSchema = z.object({
  wholesalerId: z.string().uuid(),
  contactPerson: z.string().min(1, 'Contact person is required'),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional()
});

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'fulfilled']),
  wholesalerResponse: z.string().optional()
});

export const createDealRequestSchema = z.object({
  wholesalerId: z.string().uuid(),
  wholesalerProductId: z.string().uuid().optional(),
  productName: z.string().optional(),
  requestedDiscount: z.number().min(0).max(100).optional(),
  requestedPrice: z.number().positive().optional(),
  quantity: z.number().int().positive().optional(),
  message: z.string().min(1, 'Message is required')
});

export default {
  createWholesalerProductSchema,
  updateWholesalerProductSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
  createDealRequestSchema
};
