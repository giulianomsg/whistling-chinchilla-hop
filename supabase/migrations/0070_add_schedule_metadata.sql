
-- Add metadata columns for tracking who performed actions and when
ALTER TABLE public.scheduled_workouts
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Add index for better performance on these columns (optional but good for history queries)
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_confirmed_by ON public.scheduled_workouts(confirmed_by);
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_cancelled_by ON public.scheduled_workouts(cancelled_by);
