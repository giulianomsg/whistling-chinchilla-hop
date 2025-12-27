-- Migration to add metadata columns to foods_library
-- Created: 2025-12-27

ALTER TABLE "public"."foods_library"
    ADD COLUMN IF NOT EXISTS "brand" text,
    ADD COLUMN IF NOT EXISTS "fatsecret_type" text,
    ADD COLUMN IF NOT EXISTS "url" text;
