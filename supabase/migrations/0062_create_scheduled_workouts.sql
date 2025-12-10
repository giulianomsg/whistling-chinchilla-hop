-- Migration: Create scheduled_workouts table
-- Description: Stores future workout schedules for clients

CREATE TABLE IF NOT EXISTS public.scheduled_workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_client_id ON public.scheduled_workouts(client_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_scheduled_at ON public.scheduled_workouts(scheduled_at);

-- RLS
ALTER TABLE public.scheduled_workouts ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Clients can view their own schedules
CREATE POLICY "scheduled_workouts_select_client_own"
ON public.scheduled_workouts
FOR SELECT
USING (auth.uid() = client_id);

-- 2. Clients can insert their own schedules
CREATE POLICY "scheduled_workouts_insert_client_own"
ON public.scheduled_workouts
FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- 3. Clients can update their own schedules
CREATE POLICY "scheduled_workouts_update_client_own"
ON public.scheduled_workouts
FOR UPDATE
USING (auth.uid() = client_id);

-- 4. Clients can delete their own schedules
CREATE POLICY "scheduled_workouts_delete_client_own"
ON public.scheduled_workouts
FOR DELETE
USING (auth.uid() = client_id);

-- 5. Professionals can view schedules of their clients (via workouts relationship could be tricky, 
-- but generally pros should see schedules of clients they coach. 
-- For simplicities sake ensuring pros can see if they are 'professional' role or linked)
-- A simpler approach for now: If the professional created the workout, they might want to see it, 
-- but usually relational checks 'client linked to professional' are better.
-- Let's stick to the pattern used in other tables:
CREATE POLICY "scheduled_workouts_select_professional_view"
ON public.scheduled_workouts
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.client_details cd
        WHERE cd.profile_id = scheduled_workouts.client_id
        AND cd.professional_id = auth.uid()
    )
);

-- Trigger for updated_at
CREATE TRIGGER handle_scheduled_workouts_updated_at
BEFORE UPDATE ON public.scheduled_workouts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
