-- Migration: 20260301000003_zombie_sessions_cleanup.sql
-- Description: Schedules a cleanup job to auto-close zombie ('started') sessions past 3 hours.

CREATE OR REPLACE FUNCTION public.force_close_zombie_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update sessions that have been 'started' for more than 3 hours
    UPDATE public.workout_sessions
    SET 
        status = 'abandoned',
        ended_at = NOW()
    WHERE 
        status = 'started' 
        AND created_at < (NOW() - interval '3 hours');
        
    -- NOTE: Another function `cleanup_stale_sessions` might exist for 'paused' state logic (e.g. 20260122_auto_cleanup_sessions.sql), 
    -- but this firmly kills anything that was 'started' and forgotten, to prevent active_timer drifts and database clutter.
END;
$$;

-- Schedule the cron job using pg_cron (runs every hour at minute 0)
-- Extension `pg_cron` must be active in supabase dashboard.
-- Suppress error if pg_cron is not enabled by wrapping into DO block
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Try deleting old schedule if exists, then create new
    PERFORM cron.unschedule('cleanup-zombie-sessions-cron');
    PERFORM cron.schedule(
      'cleanup-zombie-sessions-cron',
      '0 * * * *', -- hourly
      'SELECT public.force_close_zombie_sessions();'
    );
  END IF;
END
$$;
