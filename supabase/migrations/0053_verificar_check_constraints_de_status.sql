-- Verificar check constraints para status
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid IN (
  'public.client_meal_plans'::regclass,
  'public.meal_logs'::regclass
) 
  AND contype = 'c'
  AND conname LIKE '%status%';