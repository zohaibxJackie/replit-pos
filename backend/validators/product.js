import { z } from 'zod';

export const createProductSchema = z.object({
  productType: z.enum(['mobile', 'accessory']),
  mobileCatalogId: z.string().uuid().optional().nullable(),
  accessoryCatalogId: z.string().uuid().optional().nullable(),
  customName: z.string().min(1).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  sku: z.string().optional().nullable(),
  imei1: z.string().min(1).optional().nullable(),
  imei2: z.string().min(1).optional().nullable(),
  barcode: z.string().optional().nullable(),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  purchasePrice: z.union([z.number().positive('Purchase price must be positive'), z.null()]).optional(),
  salePrice: z.number().positive('Sale price must be positive'),
  vendorId: z.string().uuid().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).default(5)
}).superRefine((data, ctx) => {
  if (data.productType === 'mobile') {
    if (!data.imei1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'IMEI1 is required for mobile products',
        path: ['imei1']
      });
    }
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
  
  if (data.productType === 'accessory') {
    if (data.imei1 || data.imei2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'IMEI fields should not be set for accessory products',
        path: ['imei1']
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
  categoryId: z.string().uuid().optional().nullable(),
  sku: z.string().optional().nullable(),
  imei1: z.string().min(1).optional().nullable(),
  imei2: z.string().min(1).optional().nullable(),
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

export default { createProductSchema, updateProductSchema, updateStockSchema };
