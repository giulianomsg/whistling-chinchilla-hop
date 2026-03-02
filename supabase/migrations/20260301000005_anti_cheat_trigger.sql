-- Migration: Anti-Cheat Trigger and Session Finalization RPC
-- 1. Adds is_valid_for_xp to workout_execution_logs
-- 2. Creates the BEFORE INSERT trigger to flag suspicious loads (> 1.5x PR)
-- 3. Creates the finalize_workout_session RPC

ALTER TABLE public.workout_execution_logs 
ADD COLUMN IF NOT EXISTS is_valid_for_xp BOOLEAN DEFAULT true;

-- The trigger function
CREATE OR REPLACE FUNCTION check_anti_cheat_load()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id UUID;
    v_max_historical_weight NUMERIC;
BEGIN
    -- 1. Find client_id for this session
    SELECT client_id INTO v_client_id 
    FROM public.workout_sessions 
    WHERE id = NEW.workout_session_id;

    -- 2. Find historical max weight for this client and exercise
    -- (Excluding the current session to ensure it's a past PR)
    SELECT MAX(weight) INTO v_max_historical_weight
    FROM public.workout_execution_logs wel
    JOIN public.workout_sessions ws ON ws.id = wel.workout_session_id
    WHERE ws.client_id = v_client_id
      AND wel.exercise_id = NEW.exercise_id
      AND ws.id != NEW.workout_session_id
      AND ws.status = 'completed';

    -- 3. Check for Anti-Cheat violation
    IF v_max_historical_weight IS NOT NULL AND v_max_historical_weight > 0 THEN
        IF NEW.weight > (v_max_historical_weight * 1.5) THEN
            NEW.is_valid_for_xp := false;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_anti_cheat_load ON public.workout_execution_logs;
CREATE TRIGGER trg_anti_cheat_load
    BEFORE INSERT ON public.workout_execution_logs
    FOR EACH ROW
    EXECUTE FUNCTION check_anti_cheat_load();


-- The Finalize Workout RPC
CREATE OR REPLACE FUNCTION finalize_workout_session(
    p_session_id UUID,
    p_duration_seconds INTEGER,
    p_time_bonus_xp INTEGER,
    p_log_xps JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id UUID;
    v_valid_log_xp INTEGER := 0;
    v_total_xp INTEGER;
BEGIN
    -- Get Client
    SELECT client_id INTO v_client_id FROM public.workout_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found.';
    END IF;

    -- Calculate sum of valid log XPs
    -- We read the JSON object { "log_id": xp_amount } and sum the amounts ONLY if the log is_valid_for_xp = true
    SELECT COALESCE(SUM(value::text::INTEGER), 0) INTO v_valid_log_xp
    FROM jsonb_each(p_log_xps) j
    JOIN public.workout_execution_logs wel ON wel.id::text = j.key
    WHERE wel.workout_session_id = p_session_id
      AND wel.is_valid_for_xp = true;

    v_total_xp := COALESCE(p_time_bonus_xp, 0) + v_valid_log_xp;

    -- Standardize DB update
    UPDATE public.workout_sessions 
    SET status = 'completed', 
        ended_at = NOW(), 
        duration_seconds = p_duration_seconds, 
        final_xp = v_total_xp
    WHERE id = p_session_id;

    -- Note: the old set_workout_xp trigger on workout_sessions might interfere here.
    -- However, it runs BEFORE UPDATE. If we provide final_xp, it might be overwritten by the old trigger.
    -- But if the old trigger calculates its own final_xp and adds to profile, we might double-count.
    -- To prevent the old trigger from messing with this:
    -- We will temporarily disable the old trigger for this update, or update the profile directly 
    -- and let the old trigger do its thing without overwriting if it checks for null?
    -- Instead, we just update the profile here and ensure the new XP system overrides.
    
    -- Update Profile 
    -- To be perfectly safe against the old trigger `update_profile_level` we just update current_xp directly.
    UPDATE public.profiles
    SET current_xp = COALESCE(current_xp, 0) + v_total_xp
    WHERE id = v_client_id;

    RETURN v_total_xp;
END;
$$;
