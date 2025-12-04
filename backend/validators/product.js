import { z } from 'zod';

// categoryId values: 'mobile' or 'accessories' (hardcoded categories)
export const createProductSchema = z.object({
  shopId: z.string().uuid().optional(),
  categoryId: z.enum(['mobile', 'accessories']),
  mobileCatalogId: z.string().uuid().optional().nullable(),
  accessoryCatalogId: z.string().uuid().optional().nullable(),
  customName: z.string().min(1).optional().nullable(),
  sku: z.string().optional().nullable(),
  imeiPrimary: z.string().min(1).optional().nullable(),
  imeiSecondary: z.string().min(1).optional().nullable(),
  barcode: z.string().optional().nullable(),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(1),
  purchasePrice: z.union([z.number().positive('Purchase price must be positive'), z.null()]).optional(),
  salePrice: z.number().positive('Sale price must be positive'),
  vendorId: z.string().uuid().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).default(5),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  colorId: z.string().uuid().optional().nullable(),
  storageId: z.string().uuid().optional().nullable()
}).superRefine((data, ctx) => {
  if (data.categoryId === 'mobile') {
    if (!data.mobileCatalogId && !data.customName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either mobile catalog ID or custom name is required for mobile products',
        path: ['mobileCatalogId']
      });
    }
    if (data.accessoryCatalogId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Accessory catalog ID cannot be set for mobile products',
        path: ['accessoryCatalogId']
      });
    }
  }
  
  if (data.categoryId === 'accessories') {
    if (data.imeiPrimary || data.imeiSecondary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'IMEI fields should not be set for accessory products',
        path: ['imeiPrimary']
      });
    }
    if (!data.accessoryCatalogId && !data.customName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either accessory catalog ID or custom name is required for accessory products',
        path: ['accessoryCatalogId']
      });
    }
    if (data.mobileCatalogId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mobile catalog ID cannot be set for accessory products',
        path: ['mobileCatalogId']
      });
    }
  }
});

export const updateProductSchema = z.object({
  customName: z.string().min(1).optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  purchasePrice: z.union([z.number().positive('Purchase price must be positive'), z.null()]).optional(),
  salePrice: z.union([z.number().positive('Sale price must be positive'), z.null()]).optional(),
  vendorId: z.string().uuid().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).optional()
}).strict();

export const updateStockSchema = z.object({
  quantity: z.number().int(),
  type: z.enum(['add', 'subtract', 'set'])
});

export const bulkCreateProductSchema = z.object({
  shopId: z.string().uuid(),
  categoryId: z.enum(['mobile', 'accessories']),
  mobileCatalogId: z.string().uuid().optional().nullable(),
  accessoryCatalogId: z.string().uuid().optional().nullable(),
  customName: z.string().min(1).optional().nullable(),
  purchasePrice: z.union([z.number().positive('Purchase price must be positive'), z.null()]).optional(),
  salePrice: z.number().positive('Sale price must be positive'),
  vendorId: z.string().uuid().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).default(5),
  quantity: z.number().int().min(1).max(100, 'Maximum 100 items per batch'),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  colorId: z.string().uuid().optional().nullable(),
  storageId: z.string().uuid().optional().nullable(),
  imeis: z.array(z.object({
    imeiPrimary: z.string().min(1).optional(),
    imeiSecondary: z.string().optional().nullable(),
    imei1: z.string().min(1).optional(),
    imei2: z.string().optional().nullable()
  })).min(1)
}).superRefine((data, ctx) => {
  if (data.categoryId === 'mobile') {
    if (!data.mobileCatalogId && !data.customName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either mobile catalog ID or custom name is required for mobile products',
        path: ['mobileCatalogId']
      });
    }
    if (data.quantity !== data.imeis.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Number of IMEI entries must match quantity',
        path: ['imeis']
      });
    }
  }
});

export const phoneUnitUpdateSchema = z.object({
  imeiPrimary: z.string().min(15).max(15).optional(),
  imeiSecondary: z.string().min(15).max(15).optional().nullable(),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  status: z.enum(['in_stock', 'reserved', 'sold', 'transferred', 'returned', 'defective']).optional(),
  notes: z.string().optional().nullable()
}).strict();

export default { 
  createProductSchema, 
  updateProductSchema, 
  updateStockSchema, 
  bulkCreateProductSchema,
  phoneUnitUpdateSchema
};
