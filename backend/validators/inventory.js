import { z } from 'zod';

// ============================================================================
// CATEGORY VALIDATORS (Global lookup)
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name is too long'),
  isActive: z.boolean().optional().default(true)
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name is too long').optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// BRAND VALIDATORS (Global lookup)
// ============================================================================

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100, 'Brand name is too long'),
  isActive: z.boolean().optional().default(true)
});

export const updateBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100, 'Brand name is too long').optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// PRODUCT VALIDATORS (Global lookup - for suggestions)
// ============================================================================

export const createGlobalProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
  categoryId: z.string().uuid('Invalid category ID'),
  brandId: z.string().uuid('Invalid brand ID'),
  isActive: z.boolean().optional().default(true)
});

export const updateGlobalProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long').optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  brandId: z.string().uuid('Invalid brand ID').optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// VARIANT VALIDATORS (Global lookup - for suggestions)
// ============================================================================

export const createVariantSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantName: z.string().min(1, 'Variant name is required').max(300, 'Variant name is too long'),
  color: z.string().max(50, 'Color is too long').optional().nullable(),
  storageSize: z.string().max(20, 'Storage size is too long').optional().nullable(),
  sku: z.string().max(100, 'SKU is too long').optional().nullable(),
  isActive: z.boolean().optional().default(true)
});

export const updateVariantSchema = z.object({
  variantName: z.string().min(1, 'Variant name is required').max(300, 'Variant name is too long').optional(),
  color: z.string().max(50, 'Color is too long').optional().nullable(),
  storageSize: z.string().max(20, 'Storage size is too long').optional().nullable(),
  sku: z.string().max(100, 'SKU is too long').optional().nullable(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// REASON VALIDATORS (User-specific reasons for garbage/disposal)
// Note: userId is typically populated from authenticated user context in controller
// ============================================================================

export const createReasonSchema = z.object({
  text: z.string().min(1, 'Reason text is required').max(500, 'Reason text is too long'),
  userId: z.string().uuid('Invalid user ID').optional(),
  isActive: z.boolean().optional().default(true)
});

export const updateReasonSchema = z.object({
  text: z.string().min(1, 'Reason text is required').max(500, 'Reason text is too long').optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// STOCK VALIDATORS (Shop-specific inventory)
// ============================================================================

const stockStatusValues = ['in_stock', 'out_of_stock', 'reserved', 'sold', 'defective', 'returned', 'transferred'];
const conditionValues = ['new', 'like_new', 'good', 'fair', 'poor'];

export const createStockSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  shopId: z.string().uuid('Invalid shop ID'),
  primaryImei: z.string().max(20, 'Primary IMEI is too long').optional().nullable(),
  secondaryImei: z.string().max(20, 'Secondary IMEI is too long').optional().nullable(),
  serialNumber: z.string().max(100, 'Serial number is too long').optional().nullable(),
  barcode: z.string().max(100, 'Barcode is too long').optional().nullable(),
  purchasePrice: z.union([
    z.number().min(0, 'Purchase price cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid purchase price format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  salePrice: z.union([
    z.number().min(0, 'Sale price cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid sale price format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  stockStatus: z.enum(stockStatusValues).optional().default('in_stock'),
  notes: z.string().max(1000, 'Notes are too long').optional().nullable(),
  condition: z.enum(conditionValues).optional().default('new'),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold cannot be negative').optional().default(5),
  vendorId: z.string().uuid('Invalid vendor ID').optional().nullable(),
  isActive: z.boolean().optional().default(true)
});

export const updateStockSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID').optional(),
  saleItemId: z.string().uuid('Invalid sale item ID').optional().nullable(),
  primaryImei: z.string().max(20, 'Primary IMEI is too long').optional().nullable(),
  secondaryImei: z.string().max(20, 'Secondary IMEI is too long').optional().nullable(),
  serialNumber: z.string().max(100, 'Serial number is too long').optional().nullable(),
  barcode: z.string().max(100, 'Barcode is too long').optional().nullable(),
  purchasePrice: z.union([
    z.number().min(0, 'Purchase price cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid purchase price format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  salePrice: z.union([
    z.number().min(0, 'Sale price cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid sale price format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  stockStatus: z.enum(stockStatusValues).optional(),
  isSold: z.boolean().optional(),
  notes: z.string().max(1000, 'Notes are too long').optional().nullable(),
  condition: z.enum(conditionValues).optional(),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold cannot be negative').optional(),
  vendorId: z.string().uuid('Invalid vendor ID').optional().nullable(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export const bulkCreateStockSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  shopId: z.string().uuid('Invalid shop ID'),
  purchasePrice: z.union([
    z.number().min(0, 'Purchase price cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid purchase price format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  salePrice: z.union([
    z.number().min(0, 'Sale price cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid sale price format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  condition: z.enum(conditionValues).optional().default('new'),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold cannot be negative').optional().default(5),
  vendorId: z.string().uuid('Invalid vendor ID').optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Maximum 100 items per batch'),
  items: z.array(z.object({
    primaryImei: z.string().max(20, 'Primary IMEI is too long').optional().nullable(),
    secondaryImei: z.string().max(20, 'Secondary IMEI is too long').optional().nullable(),
    serialNumber: z.string().max(100, 'Serial number is too long').optional().nullable(),
    barcode: z.string().max(100, 'Barcode is too long').optional().nullable(),
    notes: z.string().max(1000, 'Notes are too long').optional().nullable()
  })).min(1, 'At least one item is required')
}).superRefine((data, ctx) => {
  if (data.quantity !== data.items.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Number of items must match quantity',
      path: ['items']
    });
  }
});

// ============================================================================
// GARBAGE VALIDATORS (Disposed/damaged stock items)
// ============================================================================

export const createGarbageSchema = z.object({
  stockId: z.string().uuid('Invalid stock ID'),
  reasonId: z.string().uuid('Invalid reason ID'),
  isActive: z.boolean().optional().default(true)
});

export const updateGarbageSchema = z.object({
  reasonId: z.string().uuid('Invalid reason ID').optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// STOCK TRANSFER VALIDATORS
// ============================================================================

export const createStockTransferSchema = z.object({
  fromShopId: z.string().uuid('Invalid source shop ID'),
  toShopId: z.string().uuid('Invalid destination shop ID'),
  notes: z.string().max(1000, 'Notes are too long').optional().nullable(),
  stockIds: z.array(z.string().uuid('Invalid stock ID')).min(1, 'At least one stock item is required')
}).superRefine((data, ctx) => {
  if (data.fromShopId === data.toShopId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Source and destination shops must be different',
      path: ['toShopId']
    });
  }
});

export const updateStockTransferStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled']),
  notes: z.string().max(1000, 'Notes are too long').optional().nullable()
});

// ============================================================================
// SEARCH/FILTER VALIDATORS
// ============================================================================

export const stockFilterSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID').optional(),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  stockStatus: z.enum(stockStatusValues).optional(),
  condition: z.enum(conditionValues).optional(),
  vendorId: z.string().uuid('Invalid vendor ID').optional(),
  isSold: z.boolean().optional(),
  search: z.string().max(100, 'Search query is too long').optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20)
});

export const variantSearchSchema = z.object({
  search: z.string().max(100, 'Search query is too long').optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  brandId: z.string().uuid('Invalid brand ID').optional(),
  productId: z.string().uuid('Invalid product ID').optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20)
});

export default {
  createCategorySchema,
  updateCategorySchema,
  createBrandSchema,
  updateBrandSchema,
  createGlobalProductSchema,
  updateGlobalProductSchema,
  createVariantSchema,
  updateVariantSchema,
  createReasonSchema,
  updateReasonSchema,
  createStockSchema,
  updateStockSchema,
  bulkCreateStockSchema,
  createGarbageSchema,
  updateGarbageSchema,
  createStockTransferSchema,
  updateStockTransferStatusSchema,
  stockFilterSchema,
  variantSearchSchema
};
