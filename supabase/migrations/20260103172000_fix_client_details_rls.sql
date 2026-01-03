-- Enable RLS on client_details
ALTER TABLE public.client_details ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own details
CREATE POLICY "Users can view own client_details" ON public.client_details
FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own client_details" ON public.client_details
FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own client_details" ON public.client_details
FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Allow professionals to view details of their linked clients
CREATE POLICY "Professionals can view linked client details" ON public.client_details
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.client_professionals cp
    WHERE cp.client_id = client_details.profile_id
    AND cp.professional_id = auth.uid()
    AND cp.status = 'active'
  )
);

-- Allow admins to view all
CREATE POLICY "Admins can view all client_details" ON public.client_details
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
