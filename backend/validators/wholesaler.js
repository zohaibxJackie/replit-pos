import { z } from 'zod';

// ============================================================================
// WHOLESALER SETTINGS VALIDATORS
// ============================================================================

export const createWholesalerSettingsSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  minimumOrderAmount: z.union([
    z.number().min(0, 'Minimum order amount cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  deliveryTerms: z.string().max(2000, 'Delivery terms are too long').optional().nullable(),
  paymentTerms: z.string().max(2000, 'Payment terms are too long').optional().nullable(),
  returnPolicy: z.string().max(2000, 'Return policy is too long').optional().nullable(),
  isActive: z.boolean().optional().default(true)
});

export const updateWholesalerSettingsSchema = z.object({
  minimumOrderAmount: z.union([
    z.number().min(0, 'Minimum order amount cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  deliveryTerms: z.string().max(2000, 'Delivery terms are too long').optional().nullable(),
  paymentTerms: z.string().max(2000, 'Payment terms are too long').optional().nullable(),
  returnPolicy: z.string().max(2000, 'Return policy is too long').optional().nullable(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// WHOLESALER OFFERS VALIDATORS
// ============================================================================

export const createWholesalerOfferSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  variantId: z.string().uuid('Invalid variant ID').optional().nullable(),
  offerName: z.string().min(1, 'Offer name is required').max(200, 'Offer name is too long'),
  discountPercent: z.union([
    z.number().min(0, 'Discount percent cannot be negative').max(100, 'Discount percent cannot exceed 100'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid percent format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  discountAmount: z.union([
    z.number().min(0, 'Discount amount cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  minQuantity: z.number().int().min(1, 'Minimum quantity must be at least 1').optional().default(1),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().default(true)
}).superRefine((data, ctx) => {
  if (!data.discountPercent && !data.discountAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either discount percent or discount amount must be provided',
      path: ['discountPercent']
    });
  }
  if (data.discountPercent && data.discountAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Only one of discount percent or discount amount should be provided',
      path: ['discountPercent']
    });
  }
  if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Start date must be before end date',
      path: ['endDate']
    });
  }
});

export const updateWholesalerOfferSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID').optional().nullable(),
  offerName: z.string().min(1, 'Offer name is required').max(200, 'Offer name is too long').optional(),
  discountPercent: z.union([
    z.number().min(0, 'Discount percent cannot be negative').max(100, 'Discount percent cannot exceed 100'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid percent format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  discountAmount: z.union([
    z.number().min(0, 'Discount amount cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  minQuantity: z.number().int().min(1, 'Minimum quantity must be at least 1').optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// WHOLESALER PRODUCTS VALIDATORS
// ============================================================================

export const createWholesalerProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  category: z.string().max(100, 'Category is too long').optional().nullable(),
  price: z.union([
    z.number().positive('Price must be positive'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').transform(v => parseFloat(v))
  ]),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional().default(0),
  discount: z.union([
    z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid discount format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable().default(0),
  minOrderQuantity: z.number().int().min(1, 'Minimum order quantity must be at least 1').optional().default(1),
  unit: z.string().max(50, 'Unit is too long').optional().default('pack'),
  imageUrl: z.string().url('Invalid image URL').max(500, 'Image URL is too long').optional().nullable()
});

export const updateWholesalerProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long').optional(),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  category: z.string().max(100, 'Category is too long').optional().nullable(),
  price: z.union([
    z.number().positive('Price must be positive'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').transform(v => parseFloat(v))
  ]).optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
  discount: z.union([
    z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid discount format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  minOrderQuantity: z.number().int().min(1, 'Minimum order quantity must be at least 1').optional(),
  unit: z.string().max(50, 'Unit is too long').optional(),
  imageUrl: z.string().url('Invalid image URL').max(500, 'Image URL is too long').optional().nullable(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// PURCHASE ORDER VALIDATORS (Updated for new schema)
// ============================================================================

export const purchaseOrderItemSchema = z.object({
  stockId: z.string().uuid('Invalid stock ID').optional().nullable(),
  variantId: z.string().uuid('Invalid variant ID').optional().nullable(),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.union([
    z.number().positive('Price must be positive'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').transform(v => parseFloat(v))
  ])
});

export const createPurchaseOrderSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  wholesalerId: z.string().uuid('Invalid wholesaler ID'),
  shopName: z.string().min(1, 'Shop name is required').max(100, 'Shop name is too long'),
  shopAddress: z.string().max(500, 'Shop address is too long').optional().nullable(),
  shopPhone: z.string().max(20, 'Shop phone is too long').optional().nullable(),
  shopEmail: z.string().email('Invalid email format').max(100, 'Shop email is too long').optional().nullable(),
  contactPerson: z.string().min(1, 'Contact person is required').max(100, 'Contact person name is too long'),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
  notes: z.string().max(2000, 'Notes are too long').optional().nullable()
});

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'fulfilled']),
  wholesalerResponse: z.string().max(2000, 'Response is too long').optional().nullable()
});

// ============================================================================
// DEAL REQUEST VALIDATORS (Updated for new schema)
// ============================================================================

export const createDealRequestSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  wholesalerId: z.string().uuid('Invalid wholesaler ID'),
  shopName: z.string().min(1, 'Shop name is required').max(100, 'Shop name is too long'),
  shopPhone: z.string().max(20, 'Shop phone is too long').optional().nullable(),
  shopEmail: z.string().email('Invalid email format').max(100, 'Shop email is too long').optional().nullable(),
  variantId: z.string().uuid('Invalid variant ID').optional().nullable(),
  productName: z.string().max(200, 'Product name is too long').optional().nullable(),
  requestedDiscount: z.union([
    z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid discount format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  requestedPrice: z.union([
    z.number().positive('Price must be positive'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  quantity: z.number().int().positive('Quantity must be positive').optional().nullable(),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long')
});

export const updateDealRequestStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'negotiating']),
  wholesalerResponse: z.string().max(2000, 'Response is too long').optional().nullable()
});

export default {
  createWholesalerSettingsSchema,
  updateWholesalerSettingsSchema,
  createWholesalerOfferSchema,
  updateWholesalerOfferSchema,
  createWholesalerProductSchema,
  updateWholesalerProductSchema,
  purchaseOrderItemSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
  createDealRequestSchema,
  updateDealRequestStatusSchema
};
