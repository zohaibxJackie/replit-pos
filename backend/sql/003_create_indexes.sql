-- Create indexes for better query performance

-- ============================================================================
-- GLOBAL LOOKUP TABLE INDEXES
-- ============================================================================

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_category_name ON category(name);
CREATE INDEX IF NOT EXISTS idx_category_is_active ON category(is_active);

-- Brand indexes
CREATE INDEX IF NOT EXISTS idx_brand_name ON brand(name);
CREATE INDEX IF NOT EXISTS idx_brand_is_active ON brand(is_active);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_product_name ON product(name);
CREATE INDEX IF NOT EXISTS idx_product_category_id ON product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_brand_id ON product(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_is_active ON product(is_active);

-- Variant indexes
CREATE INDEX IF NOT EXISTS idx_variant_product_id ON variant(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_variant_name ON variant(variant_name);
CREATE INDEX IF NOT EXISTS idx_variant_sku ON variant(sku);
CREATE INDEX IF NOT EXISTS idx_variant_is_active ON variant(is_active);

-- Reason indexes
CREATE INDEX IF NOT EXISTS idx_reason_user_id ON reason(user_id);
CREATE INDEX IF NOT EXISTS idx_reason_is_active ON reason(is_active);

-- ============================================================================
-- USER & AUTH TABLE INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Login history indexes
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at);

-- Password reset requests indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_id ON password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status ON password_reset_requests(status);

-- ============================================================================
-- SHOP & BUSINESS TABLE INDEXES
-- ============================================================================

-- Shops indexes
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_shop_type ON shops(shop_type);
CREATE INDEX IF NOT EXISTS idx_shops_subscription_status ON shops(subscription_status);

-- User-Shop junction table indexes
CREATE INDEX IF NOT EXISTS idx_user_shop_user_id ON user_shop(user_id);
CREATE INDEX IF NOT EXISTS idx_user_shop_shop_id ON user_shop(shop_id);

-- Vendors indexes
CREATE INDEX IF NOT EXISTS idx_vendors_shop_id ON vendors(shop_id);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);

-- ============================================================================
-- INVENTORY TABLE INDEXES
-- ============================================================================

-- Stock indexes
CREATE INDEX IF NOT EXISTS idx_stock_variant_id ON stock(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_shop_id ON stock(shop_id);
CREATE INDEX IF NOT EXISTS idx_stock_sale_item_id ON stock(sale_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_primary_imei ON stock(primary_imei);
CREATE INDEX IF NOT EXISTS idx_stock_secondary_imei ON stock(secondary_imei);
CREATE INDEX IF NOT EXISTS idx_stock_serial_number ON stock(serial_number);
CREATE INDEX IF NOT EXISTS idx_stock_barcode ON stock(barcode);
CREATE INDEX IF NOT EXISTS idx_stock_stock_status ON stock(stock_status);
CREATE INDEX IF NOT EXISTS idx_stock_is_sold ON stock(is_sold);
CREATE INDEX IF NOT EXISTS idx_stock_vendor_id ON stock(vendor_id);
CREATE INDEX IF NOT EXISTS idx_stock_is_active ON stock(is_active);
CREATE INDEX IF NOT EXISTS idx_stock_created_at ON stock(created_at);

-- Garbage indexes
CREATE INDEX IF NOT EXISTS idx_garbage_stock_id ON garbage(stock_id);
CREATE INDEX IF NOT EXISTS idx_garbage_reason_id ON garbage(reason_id);
CREATE INDEX IF NOT EXISTS idx_garbage_is_active ON garbage(is_active);

-- ============================================================================
-- CUSTOMER & SALES TABLE INDEXES
-- ============================================================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_shop_id ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_sales_person_id ON sales(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- Sale items indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_stock_id ON sale_items(stock_id);

-- ============================================================================
-- TAXES TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_taxes_shop_id ON taxes(shop_id);
CREATE INDEX IF NOT EXISTS idx_taxes_is_active ON taxes(is_active);

-- ============================================================================
-- STOCK TRANSFER TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_stock_transfers_from_shop_id ON stock_transfers(from_shop_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_to_shop_id ON stock_transfers(to_shop_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_status ON stock_transfers(status);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_created_by ON stock_transfers(created_by);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_created_at ON stock_transfers(created_at);

CREATE INDEX IF NOT EXISTS idx_stock_transfer_items_stock_transfer_id ON stock_transfer_items(stock_transfer_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_items_stock_id ON stock_transfer_items(stock_id);

-- ============================================================================
-- WHOLESALER TABLE INDEXES
-- ============================================================================

-- Wholesaler settings indexes
CREATE INDEX IF NOT EXISTS idx_wholesaler_settings_shop_id ON wholesaler_settings(shop_id);
CREATE INDEX IF NOT EXISTS idx_wholesaler_settings_is_active ON wholesaler_settings(is_active);

-- Wholesaler offers indexes
CREATE INDEX IF NOT EXISTS idx_wholesaler_offers_shop_id ON wholesaler_offers(shop_id);
CREATE INDEX IF NOT EXISTS idx_wholesaler_offers_variant_id ON wholesaler_offers(variant_id);
CREATE INDEX IF NOT EXISTS idx_wholesaler_offers_is_active ON wholesaler_offers(is_active);

-- Purchase orders indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_shop_id ON purchase_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_wholesaler_id ON purchase_orders(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders(created_at);

-- Purchase order items indexes
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_stock_id ON purchase_order_items(stock_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_variant_id ON purchase_order_items(variant_id);

-- Deal requests indexes
CREATE INDEX IF NOT EXISTS idx_deal_requests_shop_id ON deal_requests(shop_id);
CREATE INDEX IF NOT EXISTS idx_deal_requests_wholesaler_id ON deal_requests(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_deal_requests_variant_id ON deal_requests(variant_id);
CREATE INDEX IF NOT EXISTS idx_deal_requests_status ON deal_requests(status);

-- ============================================================================
-- REPAIR CENTER TABLE INDEXES
-- ============================================================================

-- Repair center settings indexes
CREATE INDEX IF NOT EXISTS idx_repair_center_settings_shop_id ON repair_center_settings(shop_id);
CREATE INDEX IF NOT EXISTS idx_repair_center_settings_is_active ON repair_center_settings(is_active);

-- Repair services indexes
CREATE INDEX IF NOT EXISTS idx_repair_services_shop_id ON repair_services(shop_id);
CREATE INDEX IF NOT EXISTS idx_repair_services_is_active ON repair_services(is_active);

-- Repair persons indexes
CREATE INDEX IF NOT EXISTS idx_repair_persons_shop_id ON repair_persons(shop_id);
CREATE INDEX IF NOT EXISTS idx_repair_persons_is_available ON repair_persons(is_available);

-- Repair jobs indexes
CREATE INDEX IF NOT EXISTS idx_repair_jobs_shop_id ON repair_jobs(shop_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_ticket_number ON repair_jobs(ticket_number);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_customer_id ON repair_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_status ON repair_jobs(status);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_priority ON repair_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_repair_person_id ON repair_jobs(repair_person_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_created_at ON repair_jobs(created_at);

-- Repair payments indexes
CREATE INDEX IF NOT EXISTS idx_repair_payments_repair_job_id ON repair_payments(repair_job_id);
CREATE INDEX IF NOT EXISTS idx_repair_payments_created_at ON repair_payments(created_at);

-- ============================================================================
-- SUBSCRIPTION & ADMIN TABLE INDEXES
-- ============================================================================

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Feature flags indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_shop_id ON feature_flags(shop_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON feature_flags(is_enabled);

-- Pricing plans indexes
CREATE INDEX IF NOT EXISTS idx_pricing_plans_is_active ON pricing_plans(is_active);
