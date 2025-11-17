SELECT 
  cw.id,
  cw.client_id,
  cw.workout_id,
  cw.professional_id,
  cw.status,
  cw.start_date,
  cw.end_date,
  cw.created_at,
  p.email as client_email,
  prof.email as professional_email,
  w.name as workout_name
FROM client_workouts cw
JOIN profiles p ON cw.client_id = p.id
JOIN profiles prof ON cw.professional_id = prof.id
JOIN workouts w ON cw.workout_id = w.id
ORDER BY cw.created_at DESC
LIMIT 20;