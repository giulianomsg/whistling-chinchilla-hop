-- Migration: 20260301000000_auth_role_hardening.sql
-- Description: Hardens role assignment by intercepting 'professional' requests and defaulting to 'client' or 'pending_professional'.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_requested_role TEXT;
  v_final_role TEXT;
BEGIN
  -- Extract requested role from metadata, defaulting to client
  v_requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  
  -- Prevent privilege escalation: if client requests professional, set to pending_professional for admin review
  IF v_requested_role = 'professional' THEN
    v_final_role := 'pending_professional';
  ELSE
    -- For any other requested role (or empty), enforce 'client'
    v_final_role := 'client';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    data_nascimento,
    cpf,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    v_final_role,
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'data_nascimento')::date,
    NEW.raw_user_meta_data->>'cpf',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
