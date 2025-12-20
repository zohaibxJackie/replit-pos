import { z } from 'zod';

export const createStockSchema = z.object({
  shopId: z.string().uuid().optional(),
  variantId: z.string().uuid(),
  primaryImei: z.string().min(1).optional().nullable(),
  secondaryImei: z.string().min(1).optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  purchasePrice: z.union([z.number().positive('Purchase price must be positive'), z.null()]).optional(),
  salePrice: z.number().positive('Sale price must be positive'),
  vendorId: z.string().uuid().optional().nullable(),
  condition: z.enum(['new', 'used']).default('new'),
  notes: z.string().optional().nullable(),
  vendorType: z.string().nonempty(),
  taxId: z.string().nullable(),
  lowStockThreshold: z.number().int().min(0).optional()
});

export const updateStockItemSchema = z.object({
  barcode: z.string().optional().nullable(),
  purchasePrice: z.union([z.number().positive('Purchase price must be positive'), z.null()]).optional(),
  salePrice: z.union([z.number().positive('Sale price must be positive'), z.null()]).optional(),
  vendorId: z.string().uuid().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).optional(),
  condition: z.enum(['new', 'used']).optional(),
  stockStatus: z.enum(['in_stock', 'reserved', 'sold', 'transferred', 'returned', 'defective']).optional(),
  notes: z.string().optional().nullable()
}).strict();

export const bulkCreateStockSchema = z.object({
  shopId: z.string().uuid().optional(),
  variantId: z.string().uuid(),
  purchasePrice: z.union([z.number().positive('Purchase price must be positive'), z.null()]).optional(),
  salePrice: z.number().positive('Sale price must be positive'),
  vendorId: z.string().uuid().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).default(5),
  quantity: z.number().int().min(1).max(100, 'Maximum 100 items per batch'),
  condition: z.enum(['new']).default('new'),
  items: z.array(z.object({
    primaryImei: z.string().min(1).optional().nullable(),
    secondaryImei: z.string().optional().nullable(),
    serialNumber: z.string().optional().nullable(),
    barcode: z.string().optional().nullable()
  })).min(1)
}).superRefine((data, ctx) => {
  if (data.quantity !== data.items.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Number of items must match quantity',
      path: ['items']
    });
  }
});

export const stockItemUpdateSchema = z.object({
  primaryImei: z.string().min(15).max(15).optional(),
  secondaryImei: z.string().min(15).max(15).optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  condition: z.enum(['new', 'used']).optional(),
  stockStatus: z.enum(['in_stock', 'reserved', 'sold', 'transferred', 'returned', 'defective']).optional(),
  notes: z.string().optional().nullable()
}).strict();

export const createProductSchema = createStockSchema;
export const updateProductSchema = updateStockItemSchema;
export const updateStockSchema = z.object({
  quantity: z.number().int(),
  type: z.enum(['add', 'subtract', 'set'])
});
export const bulkCreateProductSchema = bulkCreateStockSchema;
export const phoneUnitUpdateSchema = stockItemUpdateSchema;

export default { 
  createStockSchema,
  updateStockItemSchema,
  bulkCreateStockSchema,
  stockItemUpdateSchema,
  createProductSchema, 
  updateProductSchema, 
  updateStockSchema, 
  bulkCreateProductSchema,
  phoneUnitUpdateSchema
};
