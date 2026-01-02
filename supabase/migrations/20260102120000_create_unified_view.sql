-- Migration to create unified_foods_view and ensure taco table structure
-- Created: 2026-01-02

-- 1. Ensure/Create TACO table (Structure based on JSON usage)
-- We use 'IF NOT EXISTS' to be safe.
CREATE TABLE IF NOT EXISTS "public"."taco" (
    "id" bigint PRIMARY KEY,
    "description" text,
    "category" text,
    "energy_kcal" numeric,
    "protein_g" numeric,
    "carbohydrate_g" numeric,
    "lipid_g" numeric,
    "fiber_g" numeric,
    "created_at" timestamp with time zone DEFAULT now()
);

-- Enable Read Access for TACO (Public Data)
ALTER TABLE "public"."taco" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read TACO" ON "public"."taco";
CREATE POLICY "Public Read TACO" ON "public"."taco" FOR SELECT USING (true);


-- 2. Create Unified View
-- Combines TACO (Public) and foods_library (Custom/RLS)
CREATE OR REPLACE VIEW "public"."unified_foods_view" AS
SELECT
    'taco_' || t.id::text as id, -- Prefix to ensure uniqueness across types
    t.description as name,
    COALESCE(t.energy_kcal, 0) as calories,
    COALESCE(t.protein_g, 0) as protein,
    COALESCE(t.carbohydrate_g, 0) as carbs,
    COALESCE(t.lipid_g, 0) as fats,
    100::numeric as serving_base,
    'taco' as origin,
    NULL::uuid as created_by
FROM "public"."taco" t

UNION ALL

SELECT
    f.id::text as id,
    f.name,
    COALESCE(f.calories_per_serving, 0) as calories,
    COALESCE(f.protein, 0) as protein,
    COALESCE(f.carbs, 0) as carbs,
    COALESCE(f.fat, 0) as fats,
    COALESCE(f.metric_serving_amount, 100) as serving_base,
    'custom' as origin,
    f.created_by
FROM "public"."foods_library" f
WHERE f.deleted_at IS NULL; -- Assuming standard soft delete pattern, or remove if column invalid
