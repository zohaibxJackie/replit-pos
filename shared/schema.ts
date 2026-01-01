import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ============================================================================
// ENUMS
// ============================================================================

// Shop type enum - retail_shop, wholesaler, repair_center
export const shopTypeEnum = pgEnum("shop_type", [
  "retail_shop",
  "wholesaler",
  "repair_center",
]);

// Product condition enum - used for stock items
export const productConditionEnum = pgEnum("product_condition", [
  "new",
  "used",
]);

// Stock status enum - tracks individual item lifecycle
export const stockStatusEnum = pgEnum("stock_status", [
  "in_stock",
  "out_of_stock",
  "reserved",
  "sold",
  "defective",
  "returned",
  "transferred",
]);

// Purchase order status
export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "pending",
  "approved",
  "rejected",
  "fulfilled",
]);

// Deal request status
export const dealRequestStatusEnum = pgEnum("deal_request_status", [
  "pending",
  "approved",
  "rejected",
  "negotiating",
]);

// Repair enums
export const repairPriorityEnum = pgEnum("repair_priority", [
  "normal",
  "urgent",
]);
export const repairStatusEnum = pgEnum("repair_status", [
  "pending",
  "assigned",
  "in_progress",
  "waiting_parts",
  "completed",
  "delivered",
  "cancelled",
]);

// Password reset status
export const passwordResetStatusEnum = pgEnum("password_reset_status", [
  "pending",
  "approved",
  "rejected",
]);

// Tax type enum - flat only (no percentage)npx tsx backend/server.js
export const taxTypeEnum = pgEnum("tax_type", ["flat"]);

// Stock transfer status
export const stockTransferStatusEnum = pgEnum("stock_transfer_status", [
  "pending",
  "completed",
  "cancelled",
]);

// Tracking mode enum - determines how inventory is tracked for a variant
export const trackingModeEnum = pgEnum("tracking_mode", ["serialized", "bulk"]);

// Vendor type enum
export const vendorTypeEnum = pgEnum("vendor_type", [
  "vendor",
  "customer",
  "wholesaler",
]);

// ============================================================================
// GLOBAL LOOKUP TABLES (Master Data - manually populated, for suggestions)
// ============================================================================

// categories - global categories for products (e.g., Mobile, Accessories, Parts)
export const categories = pgTable("category", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Brand - global brands (e.g., Apple, Samsung, Xiaomi)
export const brand = pgTable("brand", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Product - global product names (e.g., iPhone 15 Pro, Galaxy S24)
export const product = pgTable("product", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  categoryId: varchar("category_id").notNull(),
  brandId: varchar("brand_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Variant - global product variants (e.g., iPhone 15 Pro 256GB)
// variant_name is auto-generated from product name + storage_size
// trackingMode determines if inventory is tracked per-unit (serialized) or by quantity (bulk)
export const variant = pgTable("variant", {
  id: uuid("id").defaultRandom().primaryKey(), // ← Change from varchar to uuid
  productId: uuid("product_id").notNull(), // ← Change from varchar to uuid
  variantName: text("variant_name").notNull(),
  color: text("color"),
  storageSize: text("storage_size"),
  sku: text("sku"),
  trackingMode: trackingModeEnum("tracking_mode")
    .notNull()
    .default("serialized"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
// Reason - reasons for garbage/disposal (linked to user who created it)
export const reason = pgTable("reason", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  userId: varchar("user_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// USER & AUTH TABLES
// ============================================================================

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  businessName: text("business_name"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  currencyCode: text("currency_code").notNull().default("USD"), // User's preferred currency (applies to all their shops)
  refreshToken: text("refresh_token"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const loginHistory = pgTable("login_history", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  ipAddress: text("ip_address"),
  deviceInfo: text("device_info"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const passwordResetRequests = pgTable("password_reset_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  adminId: varchar("admin_id"),
  status: passwordResetStatusEnum("status").notNull().default("pending"),
  requestMessage: text("request_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// SHOP & BUSINESS TABLES
// ============================================================================

// Shops - unified table for retail shops, wholesalers, and repair centers
export const shops = pgTable("shops", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ownerId: varchar("owner_id").notNull(),
  shopType: shopTypeEnum("shop_type").notNull().default("retail_shop"),
  currencyCode: text("currency_code").notNull().default("USD"), // ISO currency code (USD, EUR, GBP, etc.)
  subscriptionTier: text("subscription_tier").notNull().default("silver"),
  subscriptionStatus: text("subscription_status").notNull().default("active"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userShop = pgTable("user_shop", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  shopId: varchar("shop_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Vendors - suppliers for a shop
export const vendors = pgTable("vendors", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  // shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// INVENTORY TABLES (Shop-specific)
// ============================================================================

// Stock - actual inventory per shop (individual items with IMEI/serial)
export const stock = pgTable("stock_units", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  variantId: varchar("variant_id").notNull(), // Links to global variant for suggestions
  shopId: varchar("shop_id").notNull(),
  saleItemId: varchar("sale_item_id"), // Links to sale_items when sold
  primaryImei: text("primary_imei"),
  secondaryImei: text("secondary_imei"),
  serialNumber: text("serial_number"),
  barcode: text("barcode"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  stockStatus: stockStatusEnum("stock_status").notNull().default("in_stock"),
  isSold: boolean("is_sold").notNull().default(false),
  notes: text("notes"),
  condition: productConditionEnum("condition").notNull().default("new"),
  vendorId: varchar("vendor_id").notNull(),
  vendorType: vendorTypeEnum("vendor_type").notNull(),
  taxId: varchar("tax_id"),
  lowStockThreshold: decimal("low_stock_threshold"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Stock Batches - bulk inventory per shop (accessories, parts with quantity tracking)
// Used when variant.trackingMode = 'bulk'
export const stockBatches = pgTable("stock_batches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  variantId: varchar("variant_id").notNull(), // Links to variant with trackingMode='bulk'
  shopId: varchar("shop_id").notNull(),
  barcode: text("barcode"),
  quantity: integer("quantity").notNull().default(0), // Current quantity in stock
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  vendorId: varchar("vendor_id"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Garbage - disposed/damaged stock items (tracks individual items for IMEI tracking)
export const garbage = pgTable("garbage", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stockId: varchar("stock_id").notNull(), // Links to individual stock item
  reasonId: varchar("reason_id").notNull(), // Links to reason table
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// CUSTOMER & SALES TABLES
// ============================================================================

export const customers = pgTable("customers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  documentType: text("document_type"),
  documentNumber: text("document_number"),
  dob: text("dob"),
  nationality: text("nationality"),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  province: text("province"),
  totalPurchases: decimal("total_purchases", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  unpaidBalance: decimal("unpaid_balance", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  lastPurchaseDate: timestamp("last_purchase_date", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sales = pgTable("sales", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  salesPersonId: varchar("sales_person_id").notNull(),
  customerId: varchar("customer_id"),
  paymentMethod: text("payment_method").notNull().default("cash"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Sale Items - links sales to stock items
export const saleItems = pgTable("sale_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  saleId: varchar("sale_id").notNull(),
  stockId: varchar("stock_id").notNull(), // Links to stock table (individual item)
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// TAXES TABLE
// ============================================================================

export const taxes = pgTable("taxes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  // type: taxTypeEnum("type").notNull().default("flat"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// STOCK TRANSFER TABLES
// ============================================================================

export const stockTransfers = pgTable("stock_transfers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fromShopId: varchar("from_shop_id").notNull(),
  toShopId: varchar("to_shop_id").notNull(),
  status: stockTransferStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const stockTransferItems = pgTable("stock_transfer_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stockTransferId: varchar("stock_transfer_id").notNull(),
  stockId: varchar("stock_id").notNull(), // Links to stock table (serialized items)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Stock Transfer Batch Items - for bulk inventory transfers (accessories, parts)
export const stockTransferBatchItems = pgTable("stock_transfer_batch_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stockTransferId: varchar("stock_transfer_id").notNull(),
  stockBatchId: varchar("stock_batch_id").notNull(), // Links to stock_batches table
  quantity: integer("quantity").notNull(), // Quantity transferred
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// WHOLESALER EXTENSION TABLES
// ============================================================================

// Wholesaler settings - extra fields for wholesaler-type shops
export const wholesalerSettings = pgTable("wholesaler_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().unique(), // Links to shops where type='wholesaler'
  minimumOrderAmount: decimal("minimum_order_amount", {
    precision: 10,
    scale: 2,
  }),
  deliveryTerms: text("delivery_terms"),
  paymentTerms: text("payment_terms"),
  returnPolicy: text("return_policy"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Wholesaler offers - discounts and promotions
export const wholesalerOffers = pgTable("wholesaler_offers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(), // Wholesaler shop
  variantId: varchar("variant_id"), // Optional - offer on specific variant
  offerName: text("offer_name").notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  minQuantity: integer("min_quantity").default(1),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Wholesaler products - products listed by wholesalers for sale
export const wholesalerProducts = pgTable("wholesaler_products", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  wholesalerId: varchar("wholesaler_id").notNull(), // User ID of wholesaler
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),
  minOrderQuantity: integer("min_order_quantity").default(1),
  unit: text("unit").default("pack"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Purchase orders from shops to wholesalers
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  shopId: varchar("shop_id").notNull(), // Ordering shop
  wholesalerId: varchar("wholesaler_id").notNull(), // Wholesaler shop
  shopName: text("shop_name").notNull(),
  shopAddress: text("shop_address"),
  shopPhone: text("shop_phone"),
  shopEmail: text("shop_email"),
  contactPerson: text("contact_person").notNull(),
  status: purchaseOrderStatusEnum("status").notNull().default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  wholesalerResponse: text("wholesaler_response"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  purchaseOrderId: varchar("purchase_order_id").notNull(),
  stockId: varchar("stock_id"), // Links to stock if from inventory
  variantId: varchar("variant_id"), // Links to variant for reference
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Deal requests between shops and wholesalers
export const dealRequests = pgTable("deal_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  wholesalerId: varchar("wholesaler_id").notNull(),
  shopName: text("shop_name").notNull(),
  shopPhone: text("shop_phone"),
  shopEmail: text("shop_email"),
  variantId: varchar("variant_id"),
  productName: text("product_name"),
  requestedDiscount: decimal("requested_discount", { precision: 5, scale: 2 }),
  requestedPrice: decimal("requested_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity"),
  message: text("message").notNull(),
  status: dealRequestStatusEnum("status").notNull().default("pending"),
  wholesalerResponse: text("wholesaler_response"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// REPAIR CENTER EXTENSION TABLES
// ============================================================================

// Repair center settings - extra fields for repair-type shops
export const repairCenterSettings = pgTable("repair_center_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull().unique(), // Links to shops where type='repair_center'
  warrantyTerms: text("warranty_terms"),
  estimatedTurnaround: text("estimated_turnaround"),
  acceptsWalkIns: boolean("accepts_walk_ins").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Repair services offered
export const repairServices = pgTable("repair_services", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(), // Repair center shop
  serviceName: text("service_name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  estimatedTime: text("estimated_time"), // e.g., "1-2 hours", "1 day"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Repair persons
export const repairPersons = pgTable("repair_persons", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Repair jobs
export const repairJobs = pgTable("repair_jobs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  ticketNumber: text("ticket_number").notNull().unique(),
  customerId: varchar("customer_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerDni: text("customer_dni"),
  deviceBrand: text("device_brand").notNull(),
  deviceModel: text("device_model").notNull(),
  imei: text("imei"),
  defectSummary: text("defect_summary").notNull(),
  problemDescription: text("problem_description").notNull(),
  priority: repairPriorityEnum("priority").notNull().default("normal"),
  status: repairStatusEnum("status").notNull().default("pending"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  advancePayment: decimal("advance_payment", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  repairPersonId: varchar("repair_person_id"),
  repairPersonName: text("repair_person_name"),
  autoAssign: boolean("auto_assign").notNull().default(false),
  photos: text("photos").array(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Repair payments
export const repairPayments = pgTable("repair_payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  repairJobId: varchar("repair_job_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// SUBSCRIPTION & ADMIN TABLES
// ============================================================================
variant;
export const pricingPlans = pgTable("pricing_plans", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  maxStaff: integer("max_staff").notNull(),
  maxProducts: integer("max_products").notNull(),
  maxShops: integer("max_shops").notNull().default(1),
  features: text("features").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const featureFlags = pgTable("feature_flags", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  isEnabled: boolean("is_enabled").notNull().default(false),
  shopId: varchar("shop_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================================================
// INSERT SCHEMAS (Zod validation)
// ============================================================================

// Global lookup tables
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertBrandSchema = createInsertSchema(brand).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertProductSchema = createInsertSchema(product).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertVariantSchema = createInsertSchema(variant).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertReasonSchema = createInsertSchema(reason).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User & auth
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertLoginHistorySchema = createInsertSchema(loginHistory).omit({
  id: true,
  createdAt: true,
});
export const insertPasswordResetRequestSchema = createInsertSchema(
  passwordResetRequests
).omit({ id: true, createdAt: true, updatedAt: true });

// Shop & business
export const insertShopSchema = createInsertSchema(shops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertUserShopSchema = createInsertSchema(userShop).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Inventory
export const insertStockSchema = createInsertSchema(stock).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertStockBatchSchema = createInsertSchema(stockBatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertGarbageSchema = createInsertSchema(garbage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Customer & sales
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalPurchases: true,
  unpaidBalance: true,
  lastPurchaseDate: true,
});
export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});
export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true,
  createdAt: true,
});

// Taxes
export const insertTaxSchema = createInsertSchema(taxes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Stock transfers
export const insertStockTransferSchema = createInsertSchema(
  stockTransfers
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStockTransferItemSchema = createInsertSchema(
  stockTransferItems
).omit({ id: true, createdAt: true });
export const insertStockTransferBatchItemSchema = createInsertSchema(
  stockTransferBatchItems
).omit({ id: true, createdAt: true });

// Wholesaler
export const insertWholesalerSettingsSchema = createInsertSchema(
  wholesalerSettings
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWholesalerOfferSchema = createInsertSchema(
  wholesalerOffers
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWholesalerProductSchema = createInsertSchema(
  wholesalerProducts
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderSchema = createInsertSchema(
  purchaseOrders
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderItemSchema = createInsertSchema(
  purchaseOrderItems
).omit({ id: true, createdAt: true });
export const insertDealRequestSchema = createInsertSchema(dealRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Repair center
export const insertRepairCenterSettingsSchema = createInsertSchema(
  repairCenterSettings
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRepairServiceSchema = createInsertSchema(
  repairServices
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRepairPersonSchema = createInsertSchema(repairPersons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertRepairJobSchema = createInsertSchema(repairJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalPaid: true,
});
export const insertRepairPaymentSchema = createInsertSchema(
  repairPayments
).omit({ id: true, createdAt: true });

// Admin
export const insertPricingPlanSchema = createInsertSchema(pricingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});
export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Global lookup types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Brand = typeof brand.$inferSelect;
export type InsertBrand = typeof brand.$inferInsert;
export type Product = typeof product.$inferSelect;
export type InsertProduct = typeof product.$inferInsert;
export type Variant = typeof variant.$inferSelect;
export type InsertVariant = typeof variant.$inferInsert;
export type Reason = typeof reason.$inferSelect;
export type InsertReason = typeof reason.$inferInsert;

// User & auth types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LoginHistory = typeof loginHistory.$inferSelect;
export type InsertLoginHistory = typeof loginHistory.$inferInsert;
export type PasswordResetRequest = typeof passwordResetRequests.$inferSelect;
export type InsertPasswordResetRequest =
  typeof passwordResetRequests.$inferInsert;

// Shop & business types
export type Shop = typeof shops.$inferSelect;
export type InsertShop = typeof shops.$inferInsert;
export type UserShop = typeof userShop.$inferSelect;
export type InsertUserShop = typeof userShop.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

// Inventory types
export type Stock = typeof stock.$inferSelect;
export type InsertStock = typeof stock.$inferInsert;
export type StockBatch = typeof stockBatches.$inferSelect;
export type InsertStockBatch = typeof stockBatches.$inferInsert;
export type Garbage = typeof garbage.$inferSelect;
export type InsertGarbage = typeof garbage.$inferInsert;

// Customer & sales types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;
export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = typeof saleItems.$inferInsert;

// Tax types
export type Tax = typeof taxes.$inferSelect;
export type InsertTax = typeof taxes.$inferInsert;

// Stock transfer types
export type StockTransfer = typeof stockTransfers.$inferSelect;
export type InsertStockTransfer = typeof stockTransfers.$inferInsert;
export type StockTransferItem = typeof stockTransferItems.$inferSelect;
export type InsertStockTransferItem = typeof stockTransferItems.$inferInsert;
export type StockTransferBatchItem =
  typeof stockTransferBatchItems.$inferSelect;
export type InsertStockTransferBatchItem =
  typeof stockTransferBatchItems.$inferInsert;

// Wholesaler types
export type WholesalerSettings = typeof wholesalerSettings.$inferSelect;
export type InsertWholesalerSettings = typeof wholesalerSettings.$inferInsert;
export type WholesalerOffer = typeof wholesalerOffers.$inferSelect;
export type InsertWholesalerOffer = typeof wholesalerOffers.$inferInsert;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;
export type DealRequest = typeof dealRequests.$inferSelect;
export type InsertDealRequest = typeof dealRequests.$inferInsert;
export type WholesalerProduct = typeof wholesalerProducts.$inferSelect;
export type InsertWholesalerProduct = typeof wholesalerProducts.$inferInsert;

// Repair center types
export type RepairCenterSettings = typeof repairCenterSettings.$inferSelect;
export type InsertRepairCenterSettings =
  typeof repairCenterSettings.$inferInsert;
export type RepairService = typeof repairServices.$inferSelect;
export type InsertRepairService = typeof repairServices.$inferInsert;
export type RepairPerson = typeof repairPersons.$inferSelect;
export type InsertRepairPerson = typeof repairPersons.$inferInsert;
export type RepairJob = typeof repairJobs.$inferSelect;
export type InsertRepairJob = typeof repairJobs.$inferInsert;
export type RepairPayment = typeof repairPayments.$inferSelect;
export type InsertRepairPayment = typeof repairPayments.$inferInsert;

// Admin types
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = typeof pricingPlans.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;
