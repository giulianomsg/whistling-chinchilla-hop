-- Function to safely link a client to a professional via email
-- Bypasses RLS by being SECURITY DEFINER, but enforces checks.
CREATE OR REPLACE FUNCTION public.link_client_via_email(client_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id uuid;
  v_prof_id uuid;
BEGIN
  v_prof_id := auth.uid();
  
  -- Check if user is professional
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_prof_id AND role = 'professional') THEN
    RAISE EXCEPTION 'Apenas profissionais podem vincular alunos.';
  END IF;

  -- Find client
  SELECT id INTO v_client_id FROM public.profiles WHERE email = client_email AND role = 'client';
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Aluno não encontrado com este email.';
  END IF;

  -- Check/Insert/Update
  IF EXISTS (SELECT 1 FROM public.client_professionals WHERE client_id = v_client_id AND professional_id = v_prof_id) THEN
      -- If functionality exists, ensure it is active
      UPDATE public.client_professionals 
      SET status = 'active', started_at = now() -- Update started_at to reflect new linkage? Or keep original? Let's update.
      WHERE client_id = v_client_id AND professional_id = v_prof_id;
  ELSE
      INSERT INTO public.client_professionals (client_id, professional_id, status)
      VALUES (v_client_id, v_prof_id, 'active');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_client_via_email(text) TO authenticated;
