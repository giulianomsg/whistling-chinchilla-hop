
-- Migration: Allow Professionals to insert into scheduled_workouts
-- Description: Fixes 403 error when a Professional tries to schedule a workout for a client

CREATE POLICY "scheduled_workouts_insert_professional"
ON public.scheduled_workouts
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.client_professionals cp
        WHERE cp.client_id = scheduled_workouts.client_id
        AND cp.professional_id = auth.uid()
        AND cp.status = 'active'
    )
);
