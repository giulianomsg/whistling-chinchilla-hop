
-- Migration: Add approval workflow to scheduled_workouts
-- Description: Adds created_by column and updates status check for approval flow

-- 1. Add created_by column
ALTER TABLE public.scheduled_workouts 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- 2. Update status check constraint
-- First drop the existing constraint (we need to know its name, usually scheduled_workouts_status_check)
ALTER TABLE public.scheduled_workouts 
DROP CONSTRAINT IF EXISTS scheduled_workouts_status_check;

-- Add new constraint with expanded status values
ALTER TABLE public.scheduled_workouts 
ADD CONSTRAINT scheduled_workouts_status_check 
CHECK (status IN ('pending', 'pending_approval', 'confirmed', 'completed', 'cancelled', 'rejected'));

-- 3. Update RLS policies to allow creators to view/edit
-- Existing policies cover client_own and professional_view.
-- We might need to ensure that if a Pro creates it, the Client can still see it (Client own policy covers this if client_id is set correctly).
-- And if a Client creates it, the Pro can see it (Professional view policy covers this).

-- Ensure created_by is auto-filled if not provided (optional, but good practice is to handle in app)
-- However, we can set a default for existing rows if needed, but for new rows app should send it.

-- Update existing rows to have a created_by if null?
-- We can assume existing ones were created by the client_id since only clients could schedule before.
UPDATE public.scheduled_workouts 
SET created_by = client_id 
WHERE created_by IS NULL;

-- Make created_by NOT NULL after backfilling
ALTER TABLE public.scheduled_workouts 
ALTER COLUMN created_by SET NOT NULL;
