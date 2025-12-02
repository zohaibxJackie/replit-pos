-- Create indexes for better query performance

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- User-Shop junction table indexes
CREATE INDEX IF NOT EXISTS idx_user_shop_user_id ON user_shop(user_id);
CREATE INDEX IF NOT EXISTS idx_user_shop_shop_id ON user_shop(shop_id);

-- Login history indexes
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at);

-- Shops indexes
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_subscription_status ON shops(subscription_status);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_shop_id ON categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_shop_id ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_sales_person_id ON sales(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- Sale items indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

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

-- Wholesaler products indexes
CREATE INDEX IF NOT EXISTS idx_wholesaler_products_wholesaler_id ON wholesaler_products(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_wholesaler_products_category ON wholesaler_products(category);
CREATE INDEX IF NOT EXISTS idx_wholesaler_products_is_active ON wholesaler_products(is_active);

-- Purchase orders indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_shop_id ON purchase_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_wholesaler_id ON purchase_orders(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders(created_at);

-- Purchase order items indexes
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_wholesaler_product_id ON purchase_order_items(wholesaler_product_id);

-- Deal requests indexes
CREATE INDEX IF NOT EXISTS idx_deal_requests_shop_id ON deal_requests(shop_id);
CREATE INDEX IF NOT EXISTS idx_deal_requests_wholesaler_id ON deal_requests(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_deal_requests_status ON deal_requests(status);

-- Repair persons indexes
CREATE INDEX IF NOT EXISTS idx_repair_persons_shop_id ON repair_persons(shop_id);
CREATE INDEX IF NOT EXISTS idx_repair_persons_is_available ON repair_persons(is_available);

-- Repair jobs indexes
CREATE INDEX IF NOT EXISTS idx_repair_jobs_shop_id ON repair_jobs(shop_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_ticket_number ON repair_jobs(ticket_number);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_status ON repair_jobs(status);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_repair_person_id ON repair_jobs(repair_person_id);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_created_at ON repair_jobs(created_at);

-- Repair payments indexes
CREATE INDEX IF NOT EXISTS idx_repair_payments_repair_job_id ON repair_payments(repair_job_id);
CREATE INDEX IF NOT EXISTS idx_repair_payments_created_at ON repair_payments(created_at);
