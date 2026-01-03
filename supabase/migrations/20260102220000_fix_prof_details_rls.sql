-- Enable RLS on professional_details if not already (it likely is)
ALTER TABLE public.professional_details ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read professional_details
DROP POLICY IF EXISTS "Professional details are viewable by everyone" ON public.professional_details;

CREATE POLICY "Professional details are viewable by everyone"
ON public.professional_details FOR SELECT
USING (true);
