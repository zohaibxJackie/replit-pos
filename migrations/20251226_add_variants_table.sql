CREATE TABLE IF NOT EXISTS "variants" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" varchar NOT NULL,
  "variant_name" text NOT NULL,
  "color" text,
  "storage_size" text,
  "sku" text,
  "tracking_mode" varchar DEFAULT 'serialized',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index on product_id for better query performance
CREATE INDEX IF NOT EXISTS "variants_product_id_idx" ON "variants" ("product_id");