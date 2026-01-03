-- Enable RLS on user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own goals
CREATE POLICY "Users can view own goals" ON public.user_goals
FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can manage own goals" ON public.user_goals
FOR ALL USING (auth.uid() = client_id);

-- Allow professionals to view/manage linked client goals
CREATE POLICY "Professionals can view linked client goals" ON public.user_goals
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.client_professionals cp
    WHERE cp.client_id = user_goals.client_id
    AND cp.professional_id = auth.uid()
    AND cp.status = 'active'
  )
);

CREATE POLICY "Professionals can insert linked client goals" ON public.user_goals
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_professionals cp
    WHERE cp.client_id = user_goals.client_id
    AND cp.professional_id = auth.uid()
    AND cp.status = 'active'
  )
);

CREATE POLICY "Professionals can update linked client goals" ON public.user_goals
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.client_professionals cp
    WHERE cp.client_id = user_goals.client_id
    AND cp.professional_id = auth.uid()
    AND cp.status = 'active'
  )
);

CREATE POLICY "Professionals can delete linked client goals" ON public.user_goals
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.client_professionals cp
    WHERE cp.client_id = user_goals.client_id
    AND cp.professional_id = auth.uid()
    AND cp.status = 'active'
  )
);

-- Allow admins to view all
CREATE POLICY "Admins can view all goals" ON public.user_goals
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
