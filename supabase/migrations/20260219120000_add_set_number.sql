-- Add set_number column to workout_execution_logs to allow explicit ordering
ALTER TABLE public.workout_execution_logs
ADD COLUMN IF NOT EXISTS set_number integer;

-- Optional: Add index for performance if querying often by set (premature optimization but good practice)
-- CREATE INDEX IF NOT EXISTS idx_workout_logs_set_number ON public.workout_execution_logs(workout_session_id, workout_exercise_id, set_number);
