-- 1. Add columns to exercises_library
ALTER TABLE exercises_library 
ADD COLUMN IF NOT EXISTS demo_url TEXT,
ADD COLUMN IF NOT EXISTS demo_type TEXT CHECK (demo_type IN ('video', 'gif'));

-- 2. Create Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-demos', 'exercise-demos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
-- Enable RLS on storage.objects if not already enabled (it usually is)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access Demos" ON storage.objects;
DROP POLICY IF EXISTS "Professional Manage Demos" ON storage.objects;

-- Policy: Public Select
CREATE POLICY "Public Access Demos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'exercise-demos' );

-- Policy: Professional Insert/Update/Delete
-- We verify if the user is authenticated and has the 'professional' role in the profiles table.
CREATE POLICY "Professional Manage Demos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'exercise-demos' 
  AND auth.role() = 'authenticated'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'professional'
)
WITH CHECK (
  bucket_id = 'exercise-demos' 
  AND auth.role() = 'authenticated'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'professional'
);
