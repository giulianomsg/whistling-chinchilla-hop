-- Add cover_url to professional_details
ALTER TABLE public.professional_details ADD COLUMN IF NOT EXISTS cover_url text;

-- Drop dependent view
DROP VIEW IF EXISTS public.marketplace_professionals_view;

-- Recreate View with cover_url
CREATE OR REPLACE VIEW public.marketplace_professionals_view AS
 SELECT p.id,
    p.full_name,
    p.avatar_url,
    pd.cover_url,
    COALESCE(pd.bio, p.bio) AS bio,
    COALESCE(pd.specialty, p.specialties) AS specialties,
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
