-- Migration: 20260122_auto_cleanup_sessions_v2.sql
-- Purpose: Implement auto-cleanup with XP calculation for abandoned sessions.

CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    active_timeout interval := '1 hour';
    pause_timeout interval := '2 hours';
    
    -- XP Variables
    calc_xp INTEGER;
    log_count INTEGER;
    sess_duration INTEGER;
BEGIN
    -- A. Auto-Pause (Unchanged, just updates status)
    UPDATE workout_sessions
    SET 
        status = 'paused',
        active_timer_id = NULL,
        active_timer_started_at = NULL
    WHERE 
        status = 'started' 
        AND last_activity_at < (NOW() - active_timeout);

    -- B. Auto-Finish with XP Calculation
    -- We need to loop to calculate XP per session (since it depends on logs)
    
    FOR rec IN 
        SELECT id, client_id, duration_seconds 
        FROM workout_sessions 
        WHERE status = 'paused' AND last_activity_at < (NOW() - pause_timeout)
    LOOP
        -- 1. Calculate XP Components
        -- Work XP: 15 per log
        SELECT COUNT(*) INTO log_count 
        FROM workout_execution_logs 
        WHERE workout_session_id = rec.id;
        
        -- Time XP: 2 per minute
        sess_duration := COALESCE(rec.duration_seconds, 0);
        
        -- Formula: (Duration / 60 * 2) + (Logs * 15)
        calc_xp := FLOOR((sess_duration / 60.0) * 2) + (log_count * 15);
        
        -- Cap Time XP at 180 (90 min) as per JS rule?
        -- JS: Math.min(Math.floor(effectiveTime / 60) * 2, 180)
        IF (FLOOR((sess_duration / 60.0) * 2) > 180) THEN
             calc_xp := 180 + (log_count * 15);
        END IF;

        -- 2. Update Profile XP
        IF calc_xp > 0 THEN
            UPDATE profiles 
            SET 
                current_xp = COALESCE(current_xp, 0) + calc_xp,
                level = FLOOR((COALESCE(current_xp, 0) + calc_xp) / 1000) + 1
            WHERE id = rec.client_id;
        END IF;

        -- 3. Close Session
        UPDATE workout_sessions
        SET 
            status = 'completed',
            ended_at = NOW()
        WHERE id = rec.id;
        
        -- Optional: Log internal note or notification?
    END LOOP;

END;
$$;
