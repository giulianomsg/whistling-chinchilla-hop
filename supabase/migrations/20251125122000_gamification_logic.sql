-- Add activity_type to workout_sessions
ALTER TABLE public.workout_sessions 
ADD COLUMN IF NOT EXISTS activity_type text DEFAULT 'strength';

-- Function to calculate CapiPoints
CREATE OR REPLACE FUNCTION public.calculate_capipoints(
    duration_seconds integer,
    activity_type text,
    calories integer,
    distance_meters numeric
) RETURNS numeric AS $$
DECLARE
    duration_min numeric;
    intensity_factor numeric;
    steps_est numeric;
    base_cp numeric;
BEGIN
    duration_min := duration_seconds / 60.0;
    
    -- Determine Intensity Factor
    CASE 
        WHEN activity_type ILIKE '%crossfit%' OR activity_type ILIKE '%hiit%' THEN intensity_factor := 1.5;
        WHEN activity_type ILIKE '%run%' OR activity_type ILIKE '%cycling%' THEN intensity_factor := 1.4;
        WHEN activity_type ILIKE '%weightlifting%' OR activity_type ILIKE '%strength%' THEN intensity_factor := 1.2;
        WHEN activity_type ILIKE '%yoga%' OR activity_type ILIKE '%pilates%' THEN intensity_factor := 0.8;
        WHEN activity_type ILIKE '%walk%' THEN intensity_factor := 0.5;
        ELSE intensity_factor := 1.0;
    END CASE;

    -- Estimate steps if not provided (simplified logic)
    IF activity_type ILIKE '%run%' OR activity_type ILIKE '%walk%' THEN
        -- Approx 1000 steps per km
        steps_est := (distance_meters / 1000.0) * 1000; 
    ELSE
        steps_est := 0;
    END IF;

    -- Formula: (Duration_min * Intensity) + (Calories / 10) + (Steps / 100)
    base_cp := (duration_min * intensity_factor) + (COALESCE(calories, 0) / 10.0) + (steps_est / 100.0);
    
    RETURN ROUND(base_cp, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate Final XP with Trust Score and Multipliers
CREATE OR REPLACE FUNCTION public.calculate_final_xp(
    base_cp numeric,
    trust_score numeric,
    workout_date timestamp with time zone,
    activity_type text
) RETURNS integer AS $$
DECLARE
    final_xp numeric;
    multiplier numeric := 1.0;
    dow integer;
BEGIN
    -- Apply Trust Score
    final_xp := base_cp * trust_score;

    -- Apply Behavioral Multipliers
    
    -- Weekend Warrior (Sat=6, Sun=0)
    dow := EXTRACT(DOW FROM workout_date);
    IF dow = 0 OR dow = 6 THEN
        multiplier := multiplier + 0.10; -- +10%
    END IF;

    -- Leg Day Bonus
    IF activity_type ILIKE '%leg%' OR activity_type ILIKE '%perna%' OR activity_type ILIKE '%squat%' THEN
        multiplier := multiplier + 0.20; -- +20%
    END IF;

    -- Apply Multiplier
    final_xp := final_xp * multiplier;

    -- Cap for manual entries (Trust Score <= 0.5)
    IF trust_score <= 0.5 AND final_xp > 500 THEN
        final_xp := 500;
    END IF;

    RETURN FLOOR(final_xp)::integer;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate XP on insert/update
CREATE OR REPLACE FUNCTION public.trigger_calculate_xp() RETURNS TRIGGER AS $$
DECLARE
    cp numeric;
BEGIN
    -- Only calculate if status is completed
    IF NEW.status = 'completed' THEN
        cp := public.calculate_capipoints(
            NEW.duration_seconds,
            NEW.activity_type,
            NEW.calories_burned,
            NEW.distance_meters
        );
        
        NEW.normalized_effort := cp;
        
        NEW.final_xp := public.calculate_final_xp(
            cp,
            NEW.trust_score,
            NEW.ended_at,
            NEW.activity_type
        );
        
        -- Update User Profile XP (Simple increment, ideally should handle updates correctly to avoid double counting)
        -- For this example, we assume a separate process or more complex trigger handles profile aggregation
        -- or we just update it here for simplicity.
        UPDATE public.profiles
        SET current_xp = current_xp + (NEW.final_xp - COALESCE(OLD.final_xp, 0))
        WHERE id = NEW.client_id;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_workout_xp
    BEFORE INSERT OR UPDATE ON public.workout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_calculate_xp();
