
-- Migration: Fix RLS for scheduled_workouts to allow Professionals to UPDATE
-- Description: Adds a policy allowing linked professionals to update scheduled_workouts (e.g. confirm/reject/cancel)

CREATE POLICY "scheduled_workouts_update_professional"
ON public.scheduled_workouts
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.client_professionals cp
        WHERE cp.client_id = scheduled_workouts.client_id
        AND cp.professional_id = auth.uid()
        AND cp.status = 'active'
    )
);

-- Also ensure they can DELETE if needed (though usually we just cancel/reject via update)
-- But for cleanup, maybe useful. Let's add it carefully or skip if not used. 
-- The app logic currently updates status to 'cancelled' or 'rejected', so UPDATE is sufficient.
