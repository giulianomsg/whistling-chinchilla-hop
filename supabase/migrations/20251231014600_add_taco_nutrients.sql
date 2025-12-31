-- Migration to add comprehensive micronutrients from TACO table
-- Created: 2025-12-31

ALTER TABLE "public"."foods_library"
    ADD COLUMN IF NOT EXISTS "magnesium" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "manganese" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "phosphorus" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "copper" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "zinc" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "retinol" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "thiamine" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "riboflavin" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "pyridoxine" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "niacin" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "ashes" numeric DEFAULT 0;

-- Update the check constraint to explicitly allow 'taco_api' 
ALTER TABLE "public"."foods_library" DROP CONSTRAINT IF EXISTS "foods_library_source_type_check";
ALTER TABLE "public"."foods_library" ADD CONSTRAINT "foods_library_source_type_check" 
    CHECK (source_type IN ('manual', 'fatsecret_api', 'taco_api', 'system'));
