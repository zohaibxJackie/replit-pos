import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Enums
// Note: productTypeEnum removed - using categoryId instead with hardcoded categories (mobile, accessories)

// Master Catalog Tables (hardcoded data - not user-editable)
export const mobileCatalog = pgTable("mobile_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  memory: text("memory"),
  color: text("color"),
  gsmUrl: text("gsm_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const accessoryCatalog = pgTable("accessory_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Vendors table - to track where products come from
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  parentId: varchar("parent_id"),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Products table - actual shop inventory
// categoryId links to hardcoded categories: 'mobile' or 'accessories'
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  categoryId: varchar("category_id").notNull(), // 'mobile' or 'accessories' - now required
  mobileCatalogId: varchar("mobile_catalog_id"),
  accessoryCatalogId: varchar("accessory_catalog_id"),
  customName: text("custom_name"),
  sku: text("sku"),
  imei1: text("imei1"),
  imei2: text("imei2"),
  barcode: text("barcode"),
  stock: integer("stock").notNull().default(1),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  vendorId: varchar("vendor_id"),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  businessName: text("business_name"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  refreshToken: text("refresh_token"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const loginHistory = pgTable("login_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  ipAddress: text("ip_address"),
  deviceInfo: text("device_info"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const shops = pgTable("shops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  ownerId: varchar("owner_id").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("silver"),
  subscriptionStatus: text("subscription_status").notNull().default("active"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const userShop = pgTable("user_shop", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  shopId: varchar("shop_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  totalPurchases: decimal("total_purchases", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  salesPersonId: varchar("sales_person_id").notNull(),
  customerId: varchar("customer_id"),
  paymentMethod: text("payment_method").notNull().default("cash"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const saleItems = pgTable("sale_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  saleId: varchar("sale_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const pricingPlans = pgTable("pricing_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  maxStaff: integer("max_staff").notNull(),
  maxProducts: integer("max_products").notNull(),
  maxShops: integer("max_shops").notNull().default(1),
  features: text("features").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const featureFlags = pgTable("feature_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  isEnabled: boolean("is_enabled").notNull().default(false),
  shopId: varchar("shop_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const wholesalerProducts = pgTable("wholesaler_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wholesalerId: varchar("wholesaler_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),
  minOrderQuantity: integer("min_order_quantity").notNull().default(1),
  unit: text("unit").notNull().default("pack"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", ["pending", "approved", "rejected", "fulfilled"]);

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  shopId: varchar("shop_id").notNull(),
  wholesalerId: varchar("wholesaler_id").notNull(),
  shopName: text("shop_name").notNull(),
  shopAddress: text("shop_address"),
  shopPhone: text("shop_phone"),
  shopEmail: text("shop_email"),
  contactPerson: text("contact_person").notNull(),
  status: purchaseOrderStatusEnum("status").notNull().default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  wholesalerResponse: text("wholesaler_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  purchaseOrderId: varchar("purchase_order_id").notNull(),
  wholesalerProductId: varchar("wholesaler_product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const dealRequestStatusEnum = pgEnum("deal_request_status", ["pending", "approved", "rejected", "negotiating"]);

export const repairPriorityEnum = pgEnum("repair_priority", ["normal", "urgent"]);
export const repairStatusEnum = pgEnum("repair_status", ["pending", "assigned", "in_progress", "waiting_parts", "completed", "delivered", "cancelled"]);

export const repairPersons = pgTable("repair_persons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const repairJobs = pgTable("repair_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  advancePayment: decimal("advance_payment", { precision: 10, scale: 2 }).notNull().default("0"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  repairPersonId: varchar("repair_person_id"),
  repairPersonName: text("repair_person_name"),
  autoAssign: boolean("auto_assign").notNull().default(false),
  photos: text("photos").array(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const repairPayments = pgTable("repair_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repairJobId: varchar("repair_job_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const dealRequests = pgTable("deal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  wholesalerId: varchar("wholesaler_id").notNull(),
  shopName: text("shop_name").notNull(),
  shopPhone: text("shop_phone"),
  shopEmail: text("shop_email"),
  wholesalerProductId: varchar("wholesaler_product_id"),
  productName: text("product_name"),
  requestedDiscount: decimal("requested_discount", { precision: 5, scale: 2 }),
  requestedPrice: decimal("requested_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity"),
  message: text("message").notNull(),
  status: dealRequestStatusEnum("status").notNull().default("pending"),
  wholesalerResponse: text("wholesaler_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const passwordResetStatusEnum = pgEnum("password_reset_status", ["pending", "approved", "rejected"]);

export const productTypes = pgTable("product_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  logo: text("logo"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const colors = pgTable("colors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  hexCode: text("hex_code"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const storageOptions = pgTable("storage_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  capacity: text("capacity").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const productCategories = pgTable("product_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productTypeId: varchar("product_type_id").notNull(),
  name: text("name").notNull(),
  parentId: varchar("parent_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const productModels = pgTable("product_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productTypeId: varchar("product_type_id").notNull(),
  brandId: varchar("brand_id").notNull(),
  categoryId: varchar("category_id"),
  name: text("name").notNull(),
  modelNumber: text("model_number"),
  specifications: text("specifications"),
  releaseYear: integer("release_year"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const productConditionEnum = pgEnum("product_condition", ["new", "like_new", "good", "fair", "poor"]);

export const shopInventory = pgTable("shop_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  productModelId: varchar("product_model_id").notNull(),
  colorId: varchar("color_id"),
  storageId: varchar("storage_id"),
  imei: text("imei"),
  serialNumber: text("serial_number"),
  barcode: text("barcode"),
  condition: productConditionEnum("condition").notNull().default("new"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(1),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const usedProductStatusEnum = pgEnum("used_product_status", ["available", "sold", "reserved"]);

export const usedProducts = pgTable("used_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  productModelId: varchar("product_model_id"),
  brandId: varchar("brand_id"),
  customBrand: text("custom_brand"),
  customModel: text("custom_model"),
  colorId: varchar("color_id"),
  customColor: text("custom_color"),
  storageId: varchar("storage_id"),
  customStorage: text("custom_storage"),
  imei: text("imei"),
  serialNumber: text("serial_number"),
  condition: productConditionEnum("condition").notNull(),
  conditionNotes: text("condition_notes"),
  sellerId: varchar("seller_id"),
  sellerName: text("seller_name").notNull(),
  sellerPhone: text("seller_phone"),
  sellerIdNumber: text("seller_id_number"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }),
  status: usedProductStatusEnum("status").notNull().default("available"),
  photos: text("photos").array(),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).defaultNow(),
  soldDate: timestamp("sold_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const passwordResetRequests = pgTable("password_reset_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  adminId: varchar("admin_id"),
  status: passwordResetStatusEnum("status").notNull().default("pending"),
  requestMessage: text("request_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const taxTypeEnum = pgEnum("tax_type", ["percent", "flat"]);

export const taxes = pgTable("taxes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  type: taxTypeEnum("type").notNull().default("percent"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const stockTransferStatusEnum = pgEnum("stock_transfer_status", ["pending", "completed", "cancelled"]);

export const stockTransfers = pgTable("stock_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  fromShopId: varchar("from_shop_id").notNull(),
  toShopId: varchar("to_shop_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  status: stockTransferStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShopSchema = createInsertSchema(shops).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserShopSchema = createInsertSchema(userShop).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true, totalPurchases: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });
export const insertSaleItemSchema = createInsertSchema(saleItems).omit({ id: true, createdAt: true });
export const insertPricingPlanSchema = createInsertSchema(pricingPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWholesalerProductSchema = createInsertSchema(wholesalerProducts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true, createdAt: true });
export const insertDealRequestSchema = createInsertSchema(dealRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRepairPersonSchema = createInsertSchema(repairPersons).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRepairJobSchema = createInsertSchema(repairJobs).omit({ id: true, createdAt: true, updatedAt: true, totalPaid: true });
export const insertRepairPaymentSchema = createInsertSchema(repairPayments).omit({ id: true, createdAt: true });
export const insertLoginHistorySchema = createInsertSchema(loginHistory).omit({ id: true, createdAt: true });
export const insertPasswordResetRequestSchema = createInsertSchema(passwordResetRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductTypeSchema = createInsertSchema(productTypes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true, updatedAt: true });
export const insertColorSchema = createInsertSchema(colors).omit({ id: true, createdAt: true });
export const insertStorageOptionSchema = createInsertSchema(storageOptions).omit({ id: true, createdAt: true });
export const insertProductCategorySchema = createInsertSchema(productCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductModelSchema = createInsertSchema(productModels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShopInventorySchema = createInsertSchema(shopInventory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUsedProductSchema = createInsertSchema(usedProducts).omit({ id: true, createdAt: true, updatedAt: true });

export const insertMobileCatalogSchema = createInsertSchema(mobileCatalog).omit({ id: true, createdAt: true });
export const insertAccessoryCatalogSchema = createInsertSchema(accessoryCatalog).omit({ id: true, createdAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaxSchema = createInsertSchema(taxes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStockTransferSchema = createInsertSchema(stockTransfers).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertUser = typeof users.$inferInsert;
export type InsertLoginHistory = typeof loginHistory.$inferInsert;
export type InsertCustomer = typeof customers.$inferInsert;
export type InsertPricingPlan = typeof pricingPlans.$inferInsert;
export type InsertNotification = typeof notifications.$inferInsert;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;
export type InsertWholesalerProduct = typeof wholesalerProducts.$inferInsert;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;
export type InsertDealRequest = typeof dealRequests.$inferInsert;
export type InsertRepairPerson = typeof repairPersons.$inferInsert;
export type InsertRepairJob = typeof repairJobs.$inferInsert;
export type InsertRepairPayment = typeof repairPayments.$inferInsert;
export type InsertSaleItem = typeof saleItems.$inferInsert;
export type InsertProductType = typeof productTypes.$inferInsert;
export type InsertBrand = typeof brands.$inferInsert;
export type InsertColor = typeof colors.$inferInsert;
export type InsertStorageOption = typeof storageOptions.$inferInsert;
export type InsertProductCategory = typeof productCategories.$inferInsert;
export type InsertProductModel = typeof productModels.$inferInsert;
export type InsertShopInventory = typeof shopInventory.$inferInsert;
export type InsertUsedProduct = typeof usedProducts.$inferInsert;
export type User = typeof users.$inferSelect;
export type Shop = typeof shops.$inferSelect;
export type UserShop = typeof userShop.$inferSelect;
export type InsertUserShop = typeof userShop.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type SaleItem = typeof saleItems.$inferSelect;
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type WholesalerProduct = typeof wholesalerProducts.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type DealRequest = typeof dealRequests.$inferSelect;
export type RepairPerson = typeof repairPersons.$inferSelect;
export type RepairJob = typeof repairJobs.$inferSelect;
export type RepairPayment = typeof repairPayments.$inferSelect;
export type LoginHistory = typeof loginHistory.$inferSelect;
export type PasswordResetRequest = typeof passwordResetRequests.$inferSelect;
export type InsertPasswordResetRequest = typeof passwordResetRequests.$inferInsert;
export type ProductType = typeof productTypes.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Color = typeof colors.$inferSelect;
export type StorageOption = typeof storageOptions.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type ProductModel = typeof productModels.$inferSelect;
export type ShopInventory = typeof shopInventory.$inferSelect;
export type UsedProduct = typeof usedProducts.$inferSelect;

export type MobileCatalog = typeof mobileCatalog.$inferSelect;
export type InsertMobileCatalog = typeof mobileCatalog.$inferInsert;
export type AccessoryCatalog = typeof accessoryCatalog.$inferSelect;
export type InsertAccessoryCatalog = typeof accessoryCatalog.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Tax = typeof taxes.$inferSelect;
export type InsertTax = typeof taxes.$inferInsert;
export type StockTransfer = typeof stockTransfers.$inferSelect;
export type InsertStockTransfer = typeof stockTransfers.$inferInsert;
