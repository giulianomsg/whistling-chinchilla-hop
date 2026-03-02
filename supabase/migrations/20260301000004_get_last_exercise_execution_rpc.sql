-- Migration: History Injection RPC for Workout Execution Logs
-- This function gets the last execution weight and reps for a specific client and exercise

CREATE OR REPLACE FUNCTION get_last_exercise_execution(
  p_client_id UUID,
  p_exercise_id UUID
)
RETURNS TABLE (
  weight NUMERIC,
  reps INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wel.weight, 
    wel.reps
  FROM workout_execution_logs wel
  JOIN workout_sessions ws ON ws.id = wel.workout_session_id
  WHERE ws.client_id = p_client_id
    AND wel.exercise_id = p_exercise_id
    AND ws.status = 'completed'
    AND wel.weight IS NOT NULL
    AND wel.reps IS NOT NULL
  ORDER BY wel.completed_at DESC
  LIMIT 1;
END;
$$;
