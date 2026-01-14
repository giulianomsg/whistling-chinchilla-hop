-- Migration: 20260113173000_enhance_exercise_permissions_and_logs.sql

-- 1. Add updated_by column to exercises_library
ALTER TABLE public.exercises_library 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- 2. Create Exercise Logs table
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id UUID REFERENCES public.exercises_library(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    changes JSONB, -- Stores the new values or diff
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

-- Policies for logs (Admins/Pros can view logs, system inserts via trigger)
CREATE POLICY "Admins/Pros view logs" ON public.exercise_logs
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'professional'))
);

-- 3. Update RLS on exercises_library
-- First, drop existing restrictive policies if they exist (best effort)
DROP POLICY IF EXISTS "Professionals can create exercises" ON public.exercises_library;
DROP POLICY IF EXISTS "Professionals can update own exercises" ON public.exercises_library;
DROP POLICY IF EXISTS "Professionals can delete own exercises" ON public.exercises_library;
-- Also drop the ones I might have created implicitly or default ones
DROP POLICY IF EXISTS "Enable insert for professionals" ON public.exercises_library;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.exercises_library; 

-- Create new robust policies
-- SELECT: Public exercises are visible to everyone (or authenticated), Private ones only to Pros/Admins
CREATE POLICY "Read Access" ON public.exercises_library
FOR SELECT USING (
  is_public = true 
  OR 
  (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'professional')))
);

-- INSERT: Only Admins/Pros
CREATE POLICY "Write Access (Insert)" ON public.exercises_library
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'professional'))
);

-- UPDATE: Only Admins/Pros (ANY exercise)
CREATE POLICY "Write Access (Update)" ON public.exercises_library
FOR UPDATE USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'professional'))
);

-- DELETE: Only Admins/Pros (ANY exercise)
CREATE POLICY "Write Access (Delete)" ON public.exercises_library
FOR DELETE USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'professional'))
);

-- 4. Trigger for Logging
CREATE OR REPLACE FUNCTION public.log_exercise_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.exercise_logs (exercise_id, user_id, action, changes)
        VALUES (NEW.id, auth.uid(), 'INSERT', to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Update the updated_by field automatically if not set separately (optional, but good practice)
        -- We can't easily change NEW in an AFTER trigger, so we do it in BEFORE or just log here.
        -- Assuming application logic handles updated_by, or we can use a separate trigger for timestamp/user.
        -- Here we just log.
        INSERT INTO public.exercise_logs (exercise_id, user_id, action, changes)
        VALUES (NEW.id, auth.uid(), 'UPDATE', to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.exercise_logs (exercise_id, user_id, action, changes)
        VALUES (OLD.id, auth.uid(), 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_exercise_changes_trigger ON public.exercises_library;
CREATE TRIGGER log_exercise_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.exercises_library
FOR EACH ROW EXECUTE FUNCTION public.log_exercise_changes();

-- 5. Helper Trigger to auto-set updated_by on UPDATE
CREATE OR REPLACE FUNCTION public.set_exercise_updated_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_by = auth.uid();
    NEW.created_at = OLD.created_at; -- Ensure creation time doesn't change
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_exercise_updated_by_trigger ON public.exercises_library;
CREATE TRIGGER set_exercise_updated_by_trigger
BEFORE UPDATE ON public.exercises_library
FOR EACH ROW EXECUTE FUNCTION public.set_exercise_updated_by();

-- 6. Storage Policies (Safely)
-- Do NOT try to enable RLS on storage.objects, it causes 42501 error if not superuser.
-- Just drop and create policies.

DROP POLICY IF EXISTS "Public Access Demos" ON storage.objects;
DROP POLICY IF EXISTS "Professional Manage Demos" ON storage.objects;

-- Policy: Public Select
CREATE POLICY "Public Access Demos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'exercise-demos' );

-- Policy: Professional/Admin Manage Demos
CREATE POLICY "Professional Manage Demos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'exercise-demos' 
  AND auth.role() = 'authenticated'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'professional'))
)
WITH CHECK (
  bucket_id = 'exercise-demos' 
  AND auth.role() = 'authenticated'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'professional'))
);
