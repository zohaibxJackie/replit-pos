-- POS System Database Tables

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Shop type enum
CREATE TYPE shop_type AS ENUM ('retail_shop', 'wholesaler', 'repair_center');

-- Product condition enum
CREATE TYPE product_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');

-- Stock status enum
CREATE TYPE stock_status AS ENUM ('in_stock', 'out_of_stock', 'reserved', 'sold', 'defective', 'returned', 'transferred');

-- Purchase order status
CREATE TYPE purchase_order_status AS ENUM ('pending', 'approved', 'rejected', 'fulfilled');

-- Deal request status
CREATE TYPE deal_request_status AS ENUM ('pending', 'approved', 'rejected', 'negotiating');

-- Repair enums
CREATE TYPE repair_priority AS ENUM ('normal', 'urgent');
CREATE TYPE repair_status AS ENUM ('pending', 'assigned', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled');

-- Password reset status
CREATE TYPE password_reset_status AS ENUM ('pending', 'approved', 'rejected');

-- Tax type enum
CREATE TYPE tax_type AS ENUM ('percent', 'flat');

-- Stock transfer status
CREATE TYPE stock_transfer_status AS ENUM ('pending', 'completed', 'cancelled');

-- ============================================================================
-- GLOBAL LOOKUP TABLES (Master Data)
-- ============================================================================

-- Category - global categories for products (e.g., Mobile, Accessories, Parts)
CREATE TABLE IF NOT EXISTS category (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brand - global brands (e.g., Apple, Samsung, Xiaomi)
CREATE TABLE IF NOT EXISTS brand (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product - global product names (e.g., iPhone 15 Pro, Galaxy S24)
CREATE TABLE IF NOT EXISTS product (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    name TEXT NOT NULL,
    category_id VARCHAR NOT NULL,
    brand_id VARCHAR NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Variant - global product variants (e.g., iPhone 15 Pro 256GB)
CREATE TABLE IF NOT EXISTS variant (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    product_id VARCHAR NOT NULL,
    variant_name TEXT NOT NULL,
    color TEXT,
    storage_size TEXT,
    sku TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reason - reasons for garbage/disposal
CREATE TABLE IF NOT EXISTS reason (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    text TEXT NOT NULL,
    user_id VARCHAR NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- USER & AUTH TABLES
-- ============================================================================

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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Login history table
CREATE TABLE IF NOT EXISTS login_history (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    user_id VARCHAR NOT NULL,
    ip_address TEXT,
    device_info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Password reset requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    user_id VARCHAR NOT NULL,
    admin_id VARCHAR,
    status password_reset_status NOT NULL DEFAULT 'pending',
    request_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SHOP & BUSINESS TABLES
-- ============================================================================

-- Shops table - unified for retail shops, wholesalers, and repair centers
CREATE TABLE IF NOT EXISTS shops (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    name TEXT NOT NULL,
    owner_id VARCHAR NOT NULL,
    shop_type shop_type NOT NULL DEFAULT 'retail_shop',
    currency_code TEXT NOT NULL DEFAULT 'USD',
    subscription_tier TEXT NOT NULL DEFAULT 'silver',
    subscription_status TEXT NOT NULL DEFAULT 'active',
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User-Shop junction table
CREATE TABLE IF NOT EXISTS user_shop (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    user_id VARCHAR NOT NULL,
    shop_id VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, shop_id)
);

-- Vendors table - suppliers for a shop
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INVENTORY TABLES (Shop-specific)
-- ============================================================================

-- Stock - actual inventory per shop (individual items with IMEI/serial)
CREATE TABLE IF NOT EXISTS stock (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    variant_id VARCHAR NOT NULL,
    shop_id VARCHAR NOT NULL,
    sale_item_id VARCHAR,
    primary_imei TEXT,
    secondary_imei TEXT,
    serial_number TEXT,
    barcode TEXT,
    purchase_price DECIMAL(10, 2),
    sale_price DECIMAL(10, 2),
    stock_status stock_status NOT NULL DEFAULT 'in_stock',
    is_sold BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    condition product_condition NOT NULL DEFAULT 'new',
    low_stock_threshold INTEGER NOT NULL DEFAULT 1,
    vendor_id VARCHAR,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garbage - disposed/damaged stock items
CREATE TABLE IF NOT EXISTS garbage (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    stock_id VARCHAR NOT NULL,
    reason_id VARCHAR NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- CUSTOMER & SALES TABLES
-- ============================================================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    total_purchases DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sale items table - links sales to stock items
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    sale_id VARCHAR NOT NULL,
    stock_id VARCHAR NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TAXES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS taxes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    type tax_type NOT NULL DEFAULT 'percent',
    value DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- STOCK TRANSFER TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_transfers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    from_shop_id VARCHAR NOT NULL,
    to_shop_id VARCHAR NOT NULL,
    status stock_transfer_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_by VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    stock_transfer_id VARCHAR NOT NULL,
    stock_id VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- WHOLESALER EXTENSION TABLES
-- ============================================================================

-- Wholesaler settings
CREATE TABLE IF NOT EXISTS wholesaler_settings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL UNIQUE,
    minimum_order_amount DECIMAL(10, 2),
    delivery_terms TEXT,
    payment_terms TEXT,
    return_policy TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wholesaler offers
CREATE TABLE IF NOT EXISTS wholesaler_offers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    variant_id VARCHAR,
    offer_name TEXT NOT NULL,
    discount_percent DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    min_quantity INTEGER DEFAULT 1,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchase orders from shops to wholesalers
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Purchase order items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    purchase_order_id VARCHAR NOT NULL,
    stock_id VARCHAR,
    variant_id VARCHAR,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal requests between shops and wholesalers
CREATE TABLE IF NOT EXISTS deal_requests (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    wholesaler_id VARCHAR NOT NULL,
    shop_name TEXT NOT NULL,
    shop_phone TEXT,
    shop_email TEXT,
    variant_id VARCHAR,
    product_name TEXT,
    requested_discount DECIMAL(5, 2),
    requested_price DECIMAL(10, 2),
    quantity INTEGER,
    message TEXT NOT NULL,
    status deal_request_status NOT NULL DEFAULT 'pending',
    wholesaler_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- REPAIR CENTER EXTENSION TABLES
-- ============================================================================

-- Repair center settings
CREATE TABLE IF NOT EXISTS repair_center_settings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL UNIQUE,
    warranty_terms TEXT,
    estimated_turnaround TEXT,
    accepts_walk_ins BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Repair services offered
CREATE TABLE IF NOT EXISTS repair_services (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    service_name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2),
    estimated_time TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Repair persons
CREATE TABLE IF NOT EXISTS repair_persons (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    shop_id VARCHAR NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Repair jobs
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

-- Repair payments
CREATE TABLE IF NOT EXISTS repair_payments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    repair_job_id VARCHAR NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SUBSCRIPTION & ADMIN TABLES
-- ============================================================================

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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    shop_id VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
