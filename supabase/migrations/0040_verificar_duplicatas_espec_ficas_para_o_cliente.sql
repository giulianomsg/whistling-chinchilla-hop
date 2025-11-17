-- Verificar se há múltiplos planos ativos para o mesmo cliente
SELECT 
  client_id,
  COUNT(*) as active_plans,
  STRING_AGG(workout_name, ', ') as workout_names
FROM (
  SELECT 
    cw.client_id,
    cw.workout_id,
    w.name as workout_name
  FROM client_workouts cw
  JOIN workouts w ON cw.workout_id = w.id
  WHERE cw.status = 'active'
) active_plans
GROUP BY client_id
HAVING COUNT(*) > 1;