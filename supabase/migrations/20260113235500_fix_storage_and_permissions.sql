-- FIX: Ensure Bucket Exists and Policies are applied correctly without permission errors

-- 1. Ensure columns exist (Idempotent)
ALTER TABLE public.exercises_library 
ADD COLUMN IF NOT EXISTS demo_url TEXT,
ADD COLUMN IF NOT EXISTS demo_type TEXT CHECK (demo_type IN ('video', 'gif')),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);

-- 2. Create Storage Bucket (Robustly)
-- validando se o bucket existe antes de tentar inserir para evitar erros de transação
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'exercise-demos', 
        'exercise-demos', 
        true, 
        52428800, -- 50MB
        ARRAY['image/gif', 'video/mp4', 'video/webm']
    )
    ON CONFLICT (id) DO UPDATE
    SET public = true, 
        file_size_limit = 52428800,
        allowed_mime_types = ARRAY['image/gif', 'video/mp4', 'video/webm'];
END $$;

-- 3. Storage Policies (Scoped explicitly to this bucket to avoid locking issues)
-- We DO NOT attempt to ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY as it requires high privileges.
-- We assume RLS is enabled on storage.objects (standard Supabase setup). If not, we can't easily fix it from here without superuser, 
-- but we can apply policies which will work if it IS enabled.

-- Drop existing policies for this bucket to be clean
DROP POLICY IF EXISTS "Public Access Demos" ON storage.objects;
DROP POLICY IF EXISTS "Professional Manage Demos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Insert Demos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Update Demos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Delete Demos" ON storage.objects;

-- Policy: Public Read Access
CREATE POLICY "Public Access Demos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'exercise-demos' );

-- Policy: Admin & Professional Write Access (Insert)
CREATE POLICY "Professional Insert Demos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercise-demos' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'professional')
  )
);

-- Policy: Admin & Professional Write Access (Update)
CREATE POLICY "Professional Update Demos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'exercise-demos' 
  AND auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'professional')
  )
);

-- Policy: Admin & Professional Write Access (Delete)
CREATE POLICY "Professional Delete Demos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exercise-demos' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'professional')
  )
);

-- 4. Ensure Exercise Logs Table Exists
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exercise_id UUID REFERENCES public.exercises_library(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    changes JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins/Pros view logs" ON public.exercise_logs;
CREATE POLICY "Admins/Pros view logs" ON public.exercise_logs
FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'professional'))
);

-- 5. Logging Trigger
CREATE OR REPLACE FUNCTION public.log_exercise_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.exercise_logs (exercise_id, user_id, action, changes)
        VALUES (NEW.id, auth.uid(), 'INSERT', to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
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

-- 6. Updated By Trigger
CREATE OR REPLACE FUNCTION public.set_exercise_updated_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_exercise_updated_by_trigger ON public.exercises_library;
CREATE TRIGGER set_exercise_updated_by_trigger
BEFORE UPDATE ON public.exercises_library
FOR EACH ROW EXECUTE FUNCTION public.set_exercise_updated_by();
