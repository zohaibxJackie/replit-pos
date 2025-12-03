-- POS System Database Tables

-- Mobile Catalog table (hardcoded master data)
CREATE TABLE IF NOT EXISTS mobile_catalog (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    memory TEXT,
    color TEXT,
    gsm_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Accessory Catalog table (hardcoded master data)
CREATE TABLE IF NOT EXISTS accessory_catalog (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    business_name TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    refresh_token TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    max_shops INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    modified_at TIMESTAMPTZ DEFAULT now()
);

-- Login history table
CREATE TABLE IF NOT EXISTS login_history (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    user_id VARCHAR NOT NULL,
    ip_address TEXT,
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    name TEXT NOT NULL,
    owner_id VARCHAR NOT NULL,
    subscription_tier TEXT NOT NULL DEFAULT 'silver',
    subscription_status TEXT NOT NULL DEFAULT 'active',
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Products table (shop inventory)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    product_type product_type NOT NULL,
    mobile_catalog_id VARCHAR REFERENCES mobile_catalog(id),
    accessory_catalog_id VARCHAR REFERENCES accessory_catalog(id),
    custom_name TEXT,
    category_id VARCHAR,
    sku TEXT,
    imei1 TEXT,
    imei2 TEXT,
    barcode TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    purchase_price DECIMAL(10, 2),
    sale_price DECIMAL(10, 2) NOT NULL,
    vendor_id VARCHAR REFERENCES vendors(id),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    parent_id VARCHAR,
    level INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    total_purchases DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    sales_person_id VARCHAR NOT NULL,
    customer_id VARCHAR,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    sale_id VARCHAR NOT NULL,
    product_id VARCHAR NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL
);

-- Pricing plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    max_staff INTEGER NOT NULL,
    max_products INTEGER NOT NULL,
    max_shops INTEGER NOT NULL DEFAULT 1,
    features TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    user_id VARCHAR NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    user_id VARCHAR NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id VARCHAR,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    shop_id VARCHAR,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Wholesaler products table
CREATE TABLE IF NOT EXISTS wholesaler_products (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    wholesaler_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    discount DECIMAL(5, 2) DEFAULT 0,
    min_order_quantity INTEGER NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pack',
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    order_number TEXT NOT NULL UNIQUE,
    shop_id VARCHAR NOT NULL,
    wholesaler_id VARCHAR NOT NULL,
    shop_name TEXT NOT NULL,
    shop_address TEXT,
    shop_phone TEXT,
    shop_email TEXT,
    contact_person TEXT NOT NULL,
    status purchase_order_status NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    wholesaler_response TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    purchase_order_id VARCHAR NOT NULL,
    wholesaler_product_id VARCHAR NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL
);

-- Deal requests table
CREATE TABLE IF NOT EXISTS deal_requests (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    wholesaler_id VARCHAR NOT NULL,
    shop_name TEXT NOT NULL,
    shop_phone TEXT,
    shop_email TEXT,
    wholesaler_product_id VARCHAR,
    product_name TEXT,
    requested_discount DECIMAL(5, 2),
    requested_price DECIMAL(10, 2),
    quantity INTEGER,
    message TEXT NOT NULL,
    status deal_request_status NOT NULL DEFAULT 'pending',
    wholesaler_response TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Repair persons table
CREATE TABLE IF NOT EXISTS repair_persons (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Repair jobs table
CREATE TABLE IF NOT EXISTS repair_jobs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    ticket_number TEXT NOT NULL UNIQUE,
    customer_id VARCHAR,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_dni TEXT,
    device_brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    imei TEXT,
    defect_summary TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    priority repair_priority NOT NULL DEFAULT 'normal',
    status repair_status NOT NULL DEFAULT 'pending',
    estimated_cost DECIMAL(10, 2),
    advance_payment DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    repair_person_id VARCHAR,
    repair_person_name TEXT,
    auto_assign BOOLEAN NOT NULL DEFAULT false,
    photos TEXT[],
    due_date TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Repair payments table
CREATE TABLE IF NOT EXISTS repair_payments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    repair_job_id VARCHAR NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User-Shop junction table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_shop (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    user_id VARCHAR NOT NULL,
    shop_id VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, shop_id)
);