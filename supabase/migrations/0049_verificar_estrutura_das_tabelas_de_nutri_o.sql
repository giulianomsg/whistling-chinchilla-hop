-- Verificar todas as tabelas de nutrição criadas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('meal_plans', 'meal_plan_items', 'client_meal_plans', 'meal_logs')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;