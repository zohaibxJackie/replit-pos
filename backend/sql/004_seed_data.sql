-- Seed initial data for development

-- Insert default pricing plans
INSERT INTO pricing_plans (name, price, max_staff, max_products, features, is_active) VALUES
    ('Silver', 999.00, 3, 100, ARRAY['Basic POS', 'Inventory Management', 'Basic Reports'], true),
    ('Gold', 1999.00, 10, 500, ARRAY['Advanced POS', 'Inventory Management', 'Advanced Reports', 'Repair Module'], true),
    ('Platinum', 4999.00, 50, 5000, ARRAY['Full POS Suite', 'Inventory Management', 'Advanced Reports', 'Repair Module', 'Wholesaler Marketplace', 'Priority Support'], true)
ON CONFLICT DO NOTHING;

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

-- Insert global feature flags
INSERT INTO feature_flags (name, description, is_enabled) VALUES
    ('repair_module', 'Enable repair management module', true),
    ('wholesaler_marketplace', 'Enable wholesaler marketplace', true),
    ('advanced_analytics', 'Enable advanced analytics dashboard', true),
    ('mobile_app_sync', 'Enable mobile app synchronization', false),
    ('multi_currency', 'Enable multi-currency support', false)
ON CONFLICT (name) DO NOTHING;
