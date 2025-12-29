CREATE TYPE "public"."shop_type" AS ENUM('retail_shop', 'wholesaler', 'repair_center');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('in_stock', 'out_of_stock', 'reserved', 'sold', 'defective', 'returned', 'transferred');--> statement-breakpoint
CREATE TYPE "public"."tracking_mode" AS ENUM('serialized', 'bulk');--> statement-breakpoint
CREATE TYPE "public"."vendor_type" AS ENUM('vendor', 'customer', 'wholesaler');--> statement-breakpoint
CREATE TABLE "garbage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" varchar NOT NULL,
	"reason_id" varchar NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reason" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"user_id" varchar NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_center_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" varchar NOT NULL,
	"warranty_terms" text,
	"estimated_turnaround" text,
	"accepts_walk_ins" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repair_center_settings_shop_id_unique" UNIQUE("shop_id")
);
--> statement-breakpoint
CREATE TABLE "repair_services" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" varchar NOT NULL,
	"service_name" text NOT NULL,
	"description" text,
	"base_price" numeric(10, 2),
	"estimated_time" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_units" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" varchar NOT NULL,
	"shop_id" varchar NOT NULL,
	"sale_item_id" varchar,
	"primary_imei" text,
	"secondary_imei" text,
	"serial_number" text,
	"barcode" text,
	"purchase_price" numeric(10, 2),
	"sale_price" numeric(10, 2) NOT NULL,
	"stock_status" "stock_status" DEFAULT 'in_stock' NOT NULL,
	"is_sold" boolean DEFAULT false NOT NULL,
	"notes" text,
	"condition" "product_condition" DEFAULT 'new' NOT NULL,
	"vendor_id" varchar NOT NULL,
	"vendor_type" "vendor_type" NOT NULL,
	"tax_id" varchar,
	"low_stock_threshold" numeric,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_batches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" varchar NOT NULL,
	"shop_id" varchar NOT NULL,
	"barcode" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"purchase_price" numeric(10, 2),
	"sale_price" numeric(10, 2),
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"vendor_id" varchar,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_transfer_batch_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_transfer_id" varchar NOT NULL,
	"stock_batch_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"variant_name" text NOT NULL,
	"color" text,
	"storage_size" text,
	"sku" text,
	"tracking_mode" "tracking_mode" DEFAULT 'serialized' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wholesaler_offers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" varchar NOT NULL,
	"variant_id" varchar,
	"offer_name" text NOT NULL,
	"discount_percent" numeric(5, 2),
	"discount_amount" numeric(10, 2),
	"min_quantity" integer DEFAULT 1,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wholesaler_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" varchar NOT NULL,
	"minimum_order_amount" numeric(10, 2),
	"delivery_terms" text,
	"payment_terms" text,
	"return_policy" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wholesaler_settings_shop_id_unique" UNIQUE("shop_id")
);
--> statement-breakpoint
ALTER TABLE "accessory_catalog" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "colors" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mobile_catalog" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "phone_units" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_models" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_types" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sale_item_units" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "storage_options" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "used_products" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "accessory_catalog" CASCADE;--> statement-breakpoint
DROP TABLE "colors" CASCADE;--> statement-breakpoint
DROP TABLE "mobile_catalog" CASCADE;--> statement-breakpoint
DROP TABLE "phone_units" CASCADE;--> statement-breakpoint
DROP TABLE "product_categories" CASCADE;--> statement-breakpoint
DROP TABLE "product_models" CASCADE;--> statement-breakpoint
DROP TABLE "product_types" CASCADE;--> statement-breakpoint
DROP TABLE "sale_item_units" CASCADE;--> statement-breakpoint
DROP TABLE "storage_options" CASCADE;--> statement-breakpoint
DROP TABLE "used_products" CASCADE;--> statement-breakpoint
ALTER TABLE "stock_units" ALTER COLUMN "condition" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "stock_units" ALTER COLUMN "condition" SET DEFAULT 'new'::text;--> statement-breakpoint
DROP TYPE "public"."product_condition";--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('new', 'used');--> statement-breakpoint
ALTER TABLE "stock_units" ALTER COLUMN "condition" SET DEFAULT 'new'::"public"."product_condition";--> statement-breakpoint
ALTER TABLE "stock_units" ALTER COLUMN "condition" SET DATA TYPE "public"."product_condition" USING "condition"::"public"."product_condition";--> statement-breakpoint
DROP TYPE "public"."tax_type";--> statement-breakpoint
CREATE TYPE "public"."tax_type" AS ENUM('flat');--> statement-breakpoint
ALTER TABLE "activity_logs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "brands" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "brands" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "deal_requests" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "deal_requests" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feature_flags" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feature_flags" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "login_history" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_requests" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_requests" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_plans" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_plans" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "repair_payments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "repair_persons" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "repair_persons" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "quantity" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_transfer_items" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_transfers" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_transfers" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "taxes" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "taxes" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_shop" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wholesaler_products" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wholesaler_products" ALTER COLUMN "min_order_quantity" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wholesaler_products" ALTER COLUMN "unit" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wholesaler_products" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wholesaler_products" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "document_type" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "document_number" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "dob" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "nationality" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "unpaid_balance" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "last_purchase_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "deal_requests" ADD COLUMN "variant_id" varchar;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "stock_id" varchar;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "variant_id" varchar;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "stock_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "shop_type" "shop_type" DEFAULT 'retail_shop' NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "currency_code" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_transfer_items" ADD COLUMN "stock_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "currency_code" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "brands" DROP COLUMN "logo";--> statement-breakpoint
ALTER TABLE "deal_requests" DROP COLUMN "wholesaler_product_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "shop_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "mobile_catalog_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "accessory_catalog_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "custom_name";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "sku";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "barcode";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "stock";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "purchase_price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "sale_price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "vendor_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "low_stock_threshold";--> statement-breakpoint
ALTER TABLE "purchase_order_items" DROP COLUMN "wholesaler_product_id";--> statement-breakpoint
ALTER TABLE "sale_items" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "stock_transfer_items" DROP COLUMN "phone_unit_id";--> statement-breakpoint
ALTER TABLE "taxes" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "vendors" DROP COLUMN "shop_id";--> statement-breakpoint
DROP TYPE "public"."phone_unit_status";--> statement-breakpoint
DROP TYPE "public"."used_product_status";