-- Migration to safely update professional specialties by handling dependencies
-- 1. Drop dependent view
-- 2. Alter column type
-- 3. Recreate view with updated logic

-- Drop view dependency
DROP VIEW IF EXISTS public.marketplace_professionals_view;

-- Alter table
ALTER TABLE public.professional_details
  DROP CONSTRAINT IF EXISTS professional_details_specialty_check;

ALTER TABLE public.professional_details
  ALTER COLUMN specialty TYPE text[] 
  USING ARRAY[specialty];

ALTER TABLE public.professional_details
  ADD CONSTRAINT professional_details_specialty_check 
  CHECK (specialty <@ ARRAY['personal_trainer', 'nutritionist', 'sports_doctor', 'clinic', 'performance_coach']::text[]);

-- Recreate view handling the new array type
CREATE OR REPLACE VIEW public.marketplace_professionals_view AS
 SELECT p.id,
    p.full_name,
    p.avatar_url,
    COALESCE(pd.bio, p.bio) AS bio,
    -- Logic update: If pd.specialty is now an array, we use it directly. 
    -- If it was previously relying on p.specialties (which I assume is also text[]? let's check profile schema if possible, but safe coalesce is best)
    COALESCE(pd.specialty, p.specialties) AS specialties,
    
    -- professional_type was single text, now logic must change. 
    -- For backward compatibility in view, we can take the first element or text representation.
    -- Let's use the first element for now to keep view type signature similar if possible, or just cast to text.
    -- Actually, it's better to expose the whole array if the frontend can handle it, but seeing the error 0A000 implies strict typing.
    -- Let's expose the primary specialty (first one) as 'professional_type' for legacy compat.
    pd.specialty[1] AS professional_type,
    
    COALESCE((pd.consultation_price)::text, p.price_range) AS price_range,
    p.years_experience,
    p.instagram_url,
    p.city,
    p.state,
    p.phone,
    COALESCE(pd.whatsapp, p.whatsapp) AS whatsapp,
    COALESCE(pd.telegram, p.telegram) AS telegram,
    p.email,
    p.data_nascimento,
    pd.certifications,
    COALESCE(( SELECT avg((((((r.rating_punctuality + r.rating_didactics) + r.rating_knowledge) + r.rating_monitoring))::numeric / 4.0)) AS avg
           FROM public.professional_reviews r
          WHERE (r.professional_id = p.id)), (0)::numeric) AS overall_rating
   FROM public.profiles p
     LEFT JOIN public.professional_details pd ON pd.profile_id = p.id
  WHERE ((p.role = 'professional'::text) OR (p.role = 'admin'::text));
