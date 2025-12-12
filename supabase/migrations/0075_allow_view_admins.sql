-- Allow anyone to view profiles that have the 'admin' role
CREATE POLICY "everyone_can_view_admins" ON public.profiles
FOR SELECT
USING (role = 'admin');
