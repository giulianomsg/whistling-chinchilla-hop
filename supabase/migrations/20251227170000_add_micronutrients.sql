-- Migration to add micronutrients to foods_library
-- Created: 2025-12-27

ALTER TABLE "public"."foods_library"
    ADD COLUMN IF NOT EXISTS "fiber" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "sugar" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "sodium" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "potassium" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "cholesterol" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "fat_saturated" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "fat_trans" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "fat_monounsaturated" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "fat_polyunsaturated" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "vitamin_a" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "vitamin_c" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "calcium" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "iron" numeric DEFAULT 0;
