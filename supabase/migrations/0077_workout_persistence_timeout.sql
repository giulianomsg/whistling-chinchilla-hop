-- Add last_activity_at column
ALTER TABLE public.workout_sessions 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

-- Update existing rows to have last_activity_at = created_at or updated_at
UPDATE public.workout_sessions 
SET last_activity_at = COALESCE(updated_at, created_at) 
WHERE last_activity_at IS NULL;

-- Drop existing check constraint if it exists (we need to know the name, usually workout_sessions_status_check)
-- We will try to drop it safely.
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workout_sessions_status_check') THEN 
        ALTER TABLE public.workout_sessions DROP CONSTRAINT workout_sessions_status_check; 
    END IF; 
END $$;

-- Add updated check constraint including 'abandoned'
ALTER TABLE public.workout_sessions 
ADD CONSTRAINT workout_sessions_status_check 
CHECK (status IN ('started', 'paused', 'completed', 'cancelled', 'abandoned'));

-- =================================================================
-- Function: Auto-cleanup abandoned sessions
-- Logic: Mark as 'abandoned' if inactive for > 60 mins.
-- Critical: Set ended_at = last_activity_at (real stop time)
-- =================================================================
CREATE OR REPLACE FUNCTION public.cleanup_abandoned_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.workout_sessions
  SET 
    status = 'abandoned',
    ended_at = last_activity_at,
    duration_seconds = EXTRACT(EPOCH FROM (last_activity_at - started_at))::INTEGER
  WHERE 
    status IN ('started', 'paused')
    AND last_activity_at < (NOW() - INTERVAL '60 minutes');
END;
$$;

-- Note: In a production Supabase env, you would run:
-- select cron.schedule('*/30 * * * *', 'select public.cleanup_abandoned_sessions()');

