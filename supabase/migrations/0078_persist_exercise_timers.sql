-- Add columns to store individual timer states
ALTER TABLE public.workout_sessions 
ADD COLUMN IF NOT EXISTS exercise_timers_state JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS active_timer_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS active_timer_started_at TIMESTAMPTZ DEFAULT NULL;

-- Comment: 
-- exercise_timers_state: Stores the ACCUMULATED time for each exercise (excluding the current running segment). Format: { "exercise_uuid": seconds, ... }
-- active_timer_id: The ID of the exercise currently running (if any).
-- active_timer_started_at: When the current active timer started ticking.
