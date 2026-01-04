-- Seed Data for Sandbox Testing

-- 1. Create Users (auth.users) - Mocking auth users
-- Note: In a real Supabase local env, you can insert into auth.users. 
-- If running on cloud, this might fail without service role.
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'prof@capifit.com', 'placeholder_hash_pwd', now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'student_free@capifit.com', 'placeholder_hash_pwd', now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'student_expired@capifit.com', 'placeholder_hash_pwd', now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'student_active@capifit.com', 'placeholder_hash_pwd', now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Profiles
INSERT INTO public.profiles (id, email, role, full_name)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'prof@capifit.com', 'professional', 'Professor Sandbox'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'student_free@capifit.com', 'client', 'Student Free'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'student_expired@capifit.com', 'client', 'Student Expired'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'student_active@capifit.com', 'client', 'Student Active')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 3. Subscription Plans (for Professional)
INSERT INTO public.subscription_plans (id, professional_id, name, price, duration_months, active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mensal', 99.90, 1, true),
  ('22222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Trimestral', 269.90, 3, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Relationships (client_professionals)

-- Student Free: No record

-- Student Expired
INSERT INTO public.client_professionals (client_id, professional_id, current_plan_id, expires_at, status, auto_renew)
VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', now() - interval '1 day', 'expired', false)
ON CONFLICT (client_id, professional_id) DO UPDATE SET status = 'expired', expires_at = now() - interval '1 day';

-- Student Active
INSERT INTO public.client_professionals (client_id, professional_id, current_plan_id, expires_at, status, auto_renew)
VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '22222222-2222-2222-2222-222222222222', now() + interval '30 days', 'active', true)
ON CONFLICT (client_id, professional_id) DO UPDATE SET status = 'active', expires_at = now() + interval '30 days';
