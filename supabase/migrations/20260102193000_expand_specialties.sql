-- Migration to update allowed specialties in professional_details
-- First, drop the existing constraint if it exists. 
-- Note: The constraint name might vary, but usually it is "professional_details_specialty_check" based on default naming or previous migrations.

ALTER TABLE public.professional_details 
DROP CONSTRAINT IF EXISTS professional_details_specialty_check;

-- Add the new constraint with expanded values
ALTER TABLE public.professional_details 
ADD CONSTRAINT professional_details_specialty_check 
CHECK (specialty IN (
  'personal_trainer', 
  'nutritionist', 
  'sports_doctor', 
  'clinic', 
  'performance_coach'
));
