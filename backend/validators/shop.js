import { z } from 'zod';

const shopTypeValues = ['retail_shop', 'wholesaler', 'repair_center'];
const subscriptionTierValues = ['silver', 'gold', 'platinum'];
const subscriptionStatusValues = ['active', 'inactive', 'suspended', 'cancelled'];

export const createShopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters').max(100, 'Shop name is too long'),
  shopType: z.enum(shopTypeValues).optional().default('retail_shop'),
  currencyCode: z.string().length(3, 'Currency code must be 3 characters (ISO format)').optional().default('USD'),
  subscriptionTier: z.enum(subscriptionTierValues).optional().default('silver'),
  subscriptionStatus: z.enum(subscriptionStatusValues).optional().default('active'),
  phone: z.string().max(20, 'Phone is too long').optional().nullable(),
  whatsapp: z.string().max(20, 'WhatsApp is too long').optional().nullable(),
  address: z.string().max(500, 'Address is too long').optional().nullable()
});

export const updateShopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters').max(100, 'Shop name is too long').optional(),
  shopType: z.enum(shopTypeValues).optional(),
  currencyCode: z.string().length(3, 'Currency code must be 3 characters (ISO format)').optional(),
  subscriptionTier: z.enum(subscriptionTierValues).optional(),
  subscriptionStatus: z.enum(subscriptionStatusValues).optional(),
  phone: z.string().max(20, 'Phone is too long').optional().nullable(),
  whatsapp: z.string().max(20, 'WhatsApp is too long').optional().nullable(),
  address: z.string().max(500, 'Address is too long').optional().nullable()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export default { createShopSchema, updateShopSchema };
