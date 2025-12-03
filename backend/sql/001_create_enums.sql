-- Create ENUM types for PostgreSQL

-- Purchase order status enum
DO $$ BEGIN
    CREATE TYPE purchase_order_status AS ENUM ('pending', 'approved', 'rejected', 'fulfilled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Deal request status enum
DO $$ BEGIN
    CREATE TYPE deal_request_status AS ENUM ('pending', 'approved', 'rejected', 'negotiating');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Repair priority enum
DO $$ BEGIN
    CREATE TYPE repair_priority AS ENUM ('normal', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Repair status enum
DO $$ BEGIN
    CREATE TYPE repair_status AS ENUM ('pending', 'assigned', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Note: product_type enum removed - now using category_id varchar with values 'mobile' or 'accessories'
