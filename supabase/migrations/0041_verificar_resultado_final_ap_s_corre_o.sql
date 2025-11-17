SELECT 
  cw.client_id,
  p.email as client_email,
  COUNT(*) as total_plans,
  COUNT(CASE WHEN cw.status = 'active' THEN 1 END) as active_plans
FROM client_workouts cw
JOIN profiles p ON cw.client_id = p.id
GROUP BY cw.client_id, p.email
ORDER BY active_plans DESC;