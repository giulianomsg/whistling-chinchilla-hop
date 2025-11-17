-- Verificar políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('meal_plans', 'meal_plan_items', 'client_meal_plans', 'meal_logs')
ORDER BY tablename, policyname;