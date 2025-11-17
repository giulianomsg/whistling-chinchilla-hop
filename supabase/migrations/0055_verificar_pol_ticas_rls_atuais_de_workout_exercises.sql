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
WHERE tablename = 'workout_exercises' 
  AND schemaname = 'public'
ORDER BY policyname;