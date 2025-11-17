SELECT 
  cw.id,
  cw.client_id,
  cw.workout_id,
  cw.professional_id,
  cw.status,
  cw.start_date,
  cw.end_date,
  cw.created_at,
  w.name as workout_name,
  p.full_name as client_name,
  prof.full_name as professional_name
FROM client_workouts cw
JOIN workouts w ON cw.workout_id = w.id
JOIN profiles p ON cw.client_id = p.id
JOIN profiles prof ON cw.professional_id = prof.id
WHERE cw.client_id = '855a9cc7-2c06-4650-a8b4-8d46e8921911'
ORDER BY cw.created_at DESC;