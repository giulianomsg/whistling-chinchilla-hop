-- Migração: Criar função RPC link_client_and_update_profile
-- Objetivo: Criar vínculo profissional-cliente E atualizar dados do perfil em uma única transação

-- Função para vincular cliente e atualizar perfil simultaneamente
CREATE OR REPLACE FUNCTION public.link_client_and_update_profile(
  p_client_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com permissões de admin para permitir update no profile de outro user
AS $$
DECLARE
  v_link_id UUID;
  v_updated_profile BOOLEAN := FALSE;
BEGIN
  -- 1. Validar se o cliente existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_client_id AND role = 'client') THEN
    RAISE EXCEPTION 'Cliente não encontrado ou não é um cliente válido';
  END IF;

  -- 2. Validar se já existe vínculo ativo
  IF EXISTS (
    SELECT 1 FROM public.client_professionals 
    WHERE client_id = p_client_id 
      AND professional_id = auth.uid() 
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Cliente já está vinculado a este profissional';
  END IF;

  -- 3. Criar o vínculo
  INSERT INTO public.client_professionals (client_id, professional_id, status, notes, started_at)
  VALUES (p_client_id, auth.uid(), 'active', p_notes, NOW())
  RETURNING id INTO v_link_id;

  -- 4. Atualizar dados do perfil se fornecidos (e não vazios)
  -- NULLIF garante que strings vazias não apaguem dados existentes
  -- COALESCE garante que não sobrescrevemos com NULL se o parâmetro não vier
  IF p_full_name IS NOT NULL AND NULLIF(TRIM(p_full_name), '') IS NOT NULL THEN
    UPDATE public.profiles
    SET full_name = TRIM(p_full_name),
        updated_at = NOW()
    WHERE id = p_client_id;
    v_updated_profile := TRUE;
  END IF;

  IF p_phone IS NOT NULL AND NULLIF(TRIM(p_phone), '') IS NOT NULL THEN
    UPDATE public.profiles
    SET phone = TRIM(p_phone),
        updated_at = NOW()
    WHERE id = p_client_id;
    v_updated_profile := TRUE;
  END IF;

  -- 5. Log da operação (opcional, para auditoria)
  IF v_updated_profile THEN
    -- Aqui poderíamos inserir em uma tabela de logs se necessário
    -- Por enquanto, apenas continuamos
  END IF;

  -- 6. Retornar o ID do vínculo criado
  RETURN v_link_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, fazer rollback e propagar a exceção
    RAISE;
END;
$$;

-- Adicionar comentário para documentação
COMMENT ON FUNCTION public.link_client_and_update_profile IS 
'Vincula um cliente ao profissional atual e opcionalmente atualiza seus dados de perfil (nome, telefone). 
Parâmetros: p_client_id (UUID), p_notes (TEXT), p_full_name (TEXT), p_phone (TEXT).
Retorna: UUID do vínculo criado.';

-- Criar função auxiliar para validar se profissional pode vincular cliente
CREATE OR REPLACE FUNCTION public.professional_can_link_client(p_client_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o profissional atual pode vincular este cliente
  -- Regras: profissional só pode vincular clientes que não estão ativos com ele
  
  -- 1. Verificar se o cliente existe e é um cliente
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_client_id AND role = 'client') THEN
    RETURN FALSE;
  END IF;
  
  -- 2. Verificar se já não existe vínculo ativo
  IF EXISTS (
    SELECT 1 FROM public.client_professionals 
    WHERE client_id = p_client_id 
      AND professional_id = auth.uid() 
      AND status = 'active'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- 3. Verificar se o profissional é realmente um profissional
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professional', 'admin')) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.professional_can_link_client IS 
'Vefica se o profissional atual pode vincular o cliente especificado. 
Retorna TRUE se pode vincular, FALSE caso contrário.';