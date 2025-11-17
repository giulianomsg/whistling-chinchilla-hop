-- Verificar triggers de updated_at
SELECT 
  event_object_table as table_name,
  trigger_name,
  event_manipulation as event_type,
  action_timing as timing,
  action_condition as condition,
  action_statement as function_call
FROM information_schema.triggers 
WHERE event_object_table IN ('meal_plans', 'client_meal_plans')
  AND trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;