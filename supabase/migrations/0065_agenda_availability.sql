
-- Migration: Add professional_id to scheduled_workouts and Conflict RPC
-- Description: Adds professional_id (FK) and duration_minutes to scheduled_workouts. Adds RPC for availability check.

-- 1. Add columns
ALTER TABLE public.scheduled_workouts
ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_professional_id ON public.scheduled_workouts(professional_id);

-- 2. Function to check conflicts
-- Checks if there are any CONFIRMED or PENDING_APPROVAL schedules that overlap.
-- Rejected or Cancelled schedules are ignored.
CREATE OR REPLACE FUNCTION check_professional_availability(
    p_professional_id UUID,
    p_start_time TIMESTAMPTZ,
    p_duration_minutes INTEGER,
    p_exclude_schedule_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conflict_count INTEGER;
    v_end_time TIMESTAMPTZ;
BEGIN
    v_end_time := p_start_time + (p_duration_minutes || ' minutes')::INTERVAL;

    SELECT COUNT(*)
    INTO v_conflict_count
    FROM public.scheduled_workouts
    WHERE 
        professional_id = p_professional_id
        AND status IN ('confirmed', 'pending_approval') -- We treat pending as 'busy' to be safe, or maybe just confirmed? Let's say pending too to avoid double booking.
        AND (id != p_exclude_schedule_id OR p_exclude_schedule_id IS NULL)
        AND (
            (scheduled_at, scheduled_at + (duration_minutes || ' minutes')::INTERVAL) OVERLAPS (p_start_time, v_end_time)
        );

    RETURN v_conflict_count = 0;
END;
$$;
