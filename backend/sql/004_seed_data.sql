-- Seed initial data for development

-- ============================================================================
-- GLOBAL LOOKUP DATA
-- ============================================================================

-- Insert categories
INSERT INTO category (name, is_active) VALUES
    ('Mobile', true),
    ('Accessories', true),
    ('Parts', true),
    ('Tablets', true),
    ('Smartwatches', true),
    ('Audio', true)
ON CONFLICT (name) DO NOTHING;

-- Insert brands
INSERT INTO brand (name, is_active) VALUES
    ('Apple', true),
    ('Samsung', true),
    ('Google', true),
    ('OnePlus', true),
    ('Xiaomi', true),
    ('Oppo', true),
    ('Vivo', true),
    ('Motorola', true),
    ('Huawei', true),
    ('Realme', true),
    ('Nothing', true),
    ('Sony', true),
    ('LG', true),
    ('Nokia', true),
    ('Anker', true),
    ('JBL', true),
    ('Baseus', true),
    ('Spigen', true),
    ('OtterBox', true),
    ('Generic', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- DEFAULT PRICING PLANS
-- ============================================================================

INSERT INTO pricing_plans (name, price, max_staff, max_products, max_shops, features, is_active) VALUES
    ('Silver', 999.00, 3, 100, 1, ARRAY['Basic POS', 'Inventory Management', 'Basic Reports'], true),
    ('Gold', 1999.00, 10, 500, 3, ARRAY['Advanced POS', 'Inventory Management', 'Advanced Reports', 'Repair Module'], true),
    ('Platinum', 4999.00, 50, 5000, 10, ARRAY['Full POS Suite', 'Inventory Management', 'Advanced Reports', 'Repair Module', 'Wholesaler Marketplace', 'Priority Support'], true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEFAULT USERS (for development/testing)
-- ============================================================================

-- Insert super admin user (password: admin123)
INSERT INTO users (username, email, password, role, active) VALUES
    ('superadmin', 'superadmin@pos.com', '$2a$10$8k1.k.wqK/wMQ/JKp0BXz.6G.p2E0l9K.q5Kv5LlY5NqR5jJxK5Gy', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insert demo admin user (password: admin123)
INSERT INTO users (username, email, password, role, active) VALUES
    ('admin', 'admin@pos.com', '$2a$10$8k1.k.wqK/wMQ/JKp0BXz.6G.p2E0l9K.q5Kv5LlY5NqR5jJxK5Gy', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insert demo sales user (password: sales123)
INSERT INTO users (username, email, password, role, active) VALUES
    ('sales', 'sales@pos.com', '$2a$10$8k1.k.wqK/wMQ/JKp0BXz.6G.p2E0l9K.q5Kv5LlY5NqR5jJxK5Gy', 'sales_person', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- GLOBAL FEATURE FLAGS
-- ============================================================================

INSERT INTO feature_flags (name, description, is_enabled) VALUES
    ('repair_module', 'Enable repair management module', true),
    ('wholesaler_marketplace', 'Enable wholesaler marketplace', true),
    ('advanced_analytics', 'Enable advanced analytics dashboard', true),
    ('mobile_app_sync', 'Enable mobile app synchronization', false),
    ('multi_currency', 'Enable multi-currency support', false),
    ('stock_transfers', 'Enable stock transfers between shops', true)
ON CONFLICT (name) DO NOTHING;
