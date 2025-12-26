-- Migration to update foods_library for hybrid search and nutrition module
-- Created: 2025-12-26

ALTER TABLE "public"."foods_library"
    ADD COLUMN IF NOT EXISTS "external_fatsecret_id" text UNIQUE,
    ADD COLUMN IF NOT EXISTS "serving_unit" text DEFAULT 'g',
    ADD COLUMN IF NOT EXISTS "metric_serving_amount" numeric DEFAULT 100,
    ADD COLUMN IF NOT EXISTS "source_type" text DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS "created_by" uuid REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT false;

-- Add check constraint for source_type
DO $$ BEGIN
    ALTER TABLE "public"."foods_library" ADD CONSTRAINT "foods_library_source_type_check" CHECK (source_type IN ('manual', 'fatsecret_api', 'system'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Indices for performance
CREATE INDEX IF NOT EXISTS "idx_foods_library_name_trgm" ON "public"."foods_library" USING gin ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_foods_library_external_id" ON "public"."foods_library" ("external_fatsecret_id");
CREATE INDEX IF NOT EXISTS "idx_foods_library_created_by" ON "public"."foods_library" ("created_by");

-- Enable pg_trgm if not exists (it is required for gin_trgm_ops)
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;
