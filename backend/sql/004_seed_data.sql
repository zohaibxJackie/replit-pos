-- Seed initial data for development

-- Insert mobile catalog (master data - hardcoded devices)
INSERT INTO mobile_catalog (brand, name, memory, color, gsm_url) VALUES
    ('Apple', 'iPhone 15 Pro Max', '256GB', 'Natural Titanium', 'https://www.gsmarena.com/apple_iphone_15_pro_max-12548.php'),
    ('Apple', 'iPhone 15 Pro Max', '512GB', 'Blue Titanium', 'https://www.gsmarena.com/apple_iphone_15_pro_max-12548.php'),
    ('Apple', 'iPhone 15 Pro', '256GB', 'Black Titanium', 'https://www.gsmarena.com/apple_iphone_15_pro-12547.php'),
    ('Apple', 'iPhone 15', '128GB', 'Blue', 'https://www.gsmarena.com/apple_iphone_15-12559.php'),
    ('Apple', 'iPhone 15', '256GB', 'Pink', 'https://www.gsmarena.com/apple_iphone_15-12559.php'),
    ('Apple', 'iPhone 14 Pro Max', '256GB', 'Deep Purple', 'https://www.gsmarena.com/apple_iphone_14_pro_max-11773.php'),
    ('Apple', 'iPhone 14', '128GB', 'Blue', 'https://www.gsmarena.com/apple_iphone_14-11861.php'),
    ('Apple', 'iPhone 13', '128GB', 'Midnight', 'https://www.gsmarena.com/apple_iphone_13-11103.php'),
    ('Apple', 'iPhone SE (2022)', '64GB', 'Midnight', 'https://www.gsmarena.com/apple_iphone_se_(2022)-11410.php'),
    ('Samsung', 'Galaxy S24 Ultra', '256GB', 'Titanium Black', 'https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php'),
    ('Samsung', 'Galaxy S24 Ultra', '512GB', 'Titanium Violet', 'https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php'),
    ('Samsung', 'Galaxy S24+', '256GB', 'Cobalt Violet', 'https://www.gsmarena.com/samsung_galaxy_s24+-12764.php'),
    ('Samsung', 'Galaxy S24', '256GB', 'Onyx Black', 'https://www.gsmarena.com/samsung_galaxy_s24-12763.php'),
    ('Samsung', 'Galaxy Z Fold5', '256GB', 'Phantom Black', 'https://www.gsmarena.com/samsung_galaxy_z_fold5-12418.php'),
    ('Samsung', 'Galaxy Z Flip5', '256GB', 'Lavender', 'https://www.gsmarena.com/samsung_galaxy_z_flip5-12369.php'),
    ('Samsung', 'Galaxy A54 5G', '128GB', 'Awesome Graphite', 'https://www.gsmarena.com/samsung_galaxy_a54_5g-12070.php'),
    ('Google', 'Pixel 8 Pro', '256GB', 'Obsidian', 'https://www.gsmarena.com/google_pixel_8_pro-12546.php'),
    ('Google', 'Pixel 8', '128GB', 'Hazel', 'https://www.gsmarena.com/google_pixel_8-12545.php'),
    ('Google', 'Pixel 7a', '128GB', 'Charcoal', 'https://www.gsmarena.com/google_pixel_7a-12170.php'),
    ('OnePlus', '12', '256GB', 'Flowy Emerald', 'https://www.gsmarena.com/oneplus_12-12615.php'),
    ('OnePlus', '11', '256GB', 'Titan Black', 'https://www.gsmarena.com/oneplus_11-12048.php'),
    ('Xiaomi', '14 Ultra', '512GB', 'Black', 'https://www.gsmarena.com/xiaomi_14_ultra-12656.php'),
    ('Xiaomi', '14', '256GB', 'White', 'https://www.gsmarena.com/xiaomi_14-12459.php'),
    ('Xiaomi', 'Redmi Note 13 Pro+', '256GB', 'Midnight Black', 'https://www.gsmarena.com/xiaomi_redmi_note_13_pro+-12571.php'),
    ('Oppo', 'Find X7 Ultra', '256GB', 'Ocean Blue', 'https://www.gsmarena.com/oppo_find_x7_ultra-12603.php'),
    ('Vivo', 'X100 Pro', '256GB', 'Asteroid Black', 'https://www.gsmarena.com/vivo_x100_pro-12569.php'),
    ('Motorola', 'Edge 40 Pro', '256GB', 'Lunar Blue', 'https://www.gsmarena.com/motorola_edge_40_pro-12113.php'),
    ('Huawei', 'P60 Pro', '256GB', 'Black', 'https://www.gsmarena.com/huawei_p60_pro-12131.php'),
    ('Realme', 'GT5 Pro', '256GB', 'Bright Moon', 'https://www.gsmarena.com/realme_gt5_pro-12583.php'),
    ('Nothing', 'Phone (2)', '256GB', 'Dark Grey', 'https://www.gsmarena.com/nothing_phone_(2)-12231.php')
ON CONFLICT DO NOTHING;

-- Insert accessory catalog (master data - hardcoded accessories)
INSERT INTO accessory_catalog (brand, name) VALUES
    ('Apple', 'AirPods Pro (2nd Gen)'),
    ('Apple', 'AirPods Max'),
    ('Apple', 'AirPods (3rd Gen)'),
    ('Apple', 'MagSafe Charger'),
    ('Apple', 'MagSafe Battery Pack'),
    ('Apple', 'USB-C to Lightning Cable'),
    ('Apple', '20W USB-C Power Adapter'),
    ('Apple', 'iPhone Leather Case'),
    ('Apple', 'iPhone Silicone Case'),
    ('Apple', 'iPhone Clear Case'),
    ('Samsung', 'Galaxy Buds2 Pro'),
    ('Samsung', 'Galaxy Buds FE'),
    ('Samsung', '45W Super Fast Charger'),
    ('Samsung', 'Wireless Charger Pad'),
    ('Samsung', 'Galaxy Watch6 Classic'),
    ('Samsung', 'Galaxy S Pen'),
    ('Samsung', 'Clear View Cover'),
    ('Samsung', 'Silicone Cover'),
    ('Google', 'Pixel Buds Pro'),
    ('Google', 'Pixel Watch 2'),
    ('Google', '30W USB-C Charger'),
    ('Google', 'Pixel Case'),
    ('OnePlus', 'Buds Pro 2'),
    ('OnePlus', 'SUPERVOOC 100W Charger'),
    ('OnePlus', 'Sandstone Bumper Case'),
    ('Xiaomi', 'Buds 4 Pro'),
    ('Xiaomi', '120W HyperCharge Adapter'),
    ('Anker', '65W GaN Charger'),
    ('Anker', 'PowerCore 26800mAh'),
    ('Anker', 'Soundcore Liberty 4'),
    ('JBL', 'Tune 770NC'),
    ('JBL', 'Flip 6'),
    ('Sony', 'WH-1000XM5'),
    ('Sony', 'WF-1000XM5'),
    ('Baseus', '100W USB-C Cable'),
    ('Baseus', '20000mAh Power Bank'),
    ('Spigen', 'Tough Armor Case'),
    ('Spigen', 'Screen Protector'),
    ('OtterBox', 'Defender Series Case'),
    ('OtterBox', 'Symmetry Series Case'),
    ('Generic', 'Tempered Glass Screen Protector'),
    ('Generic', 'USB-C Cable 1m'),
    ('Generic', 'USB-C Cable 2m'),
    ('Generic', 'Car Phone Mount'),
    ('Generic', 'Pop Socket Grip')
ON CONFLICT DO NOTHING;

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
