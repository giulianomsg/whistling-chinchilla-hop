-- =================================================================
-- Migration: Criar tabela 'workout_sessions'
-- Objetivo: Armazenar logs de treinos dos clientes (start/stop/duration)
-- =================================================================

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- IDs de Referência
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  client_workout_id UUID NOT NULL REFERENCES public.client_workouts(id) ON DELETE CASCADE,
  
  -- Timestamps da Sessão
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT, -- Duração total em segundos, calculada no fim
  
  -- Status da Sessão
  -- 'started': Treino iniciado, ainda não finalizado.
  -- 'paused': Treino pausado pelo usuário.
  -- 'completed': Treino finalizado com sucesso.
  -- 'abandoned': Usuário saiu sem finalizar (lógica futura).
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'paused', 'completed', 'abandoned')),
  
  -- Datas de Controle
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
  
  -- (Pode-se adicionar um trigger para auto-atualizar updated_at)
);

-- Índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_workout_sessions_client_id ON public.workout_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_professional_id ON public.workout_sessions(professional_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_client_workout_id ON public.workout_sessions(client_workout_id);

-- =================================================================
-- Trigger para auto-atualizar updated_at
-- =================================================================

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Criar trigger para auto-atualizar updated_at
DROP TRIGGER IF EXISTS handle_workout_sessions_updated_at ON public.workout_sessions;
CREATE TRIGGER handle_workout_sessions_updated_at
BEFORE UPDATE ON public.workout_sessions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =================================================================
-- Habilitar RLS na tabela
-- =================================================================

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- Políticas de RLS para 'workout_sessions'
-- =================================================================

-- Apagar políticas antigas (se existirem)
DROP POLICY IF EXISTS "workout_sessions_select_client_own" ON public.workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_insert_client_own" ON public.workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_update_client_own" ON public.workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_delete_client_own" ON public.workout_sessions;
DROP POLICY IF EXISTS "workout_sessions_select_professional_clients" ON public.workout_sessions;

-- 1. Política de INSERT (Clientes)
-- Clientes podem iniciar (criar) suas próprias sessões de treino.
CREATE POLICY "workout_sessions_insert_client_own"
ON public.workout_sessions
FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- 2. Política de SELECT (Clientes e Profissionais)
-- Clientes podem ver suas sessões.
-- Profissionais podem ver as sessões dos seus clientes.
CREATE POLICY "workout_sessions_select_policy"
ON public.workout_sessions
FOR SELECT
USING (
  -- Regra 1: Cliente pode ver suas próprias sessões
  auth.uid() = client_id
  OR
  -- Regra 2: Profissional pode ver as sessões dos seus clientes
  auth.uid() = professional_id
);

-- 3. Política de UPDATE (Clientes)
-- Clientes podem atualizar (pausar, finalizar) suas próprias sessões.
CREATE POLICY "workout_sessions_update_client_own"
ON public.workout_sessions
FOR UPDATE
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- 4. Política de DELETE (Clientes)
-- Clientes podem apagar (se necessário) suas próprias sessões.
CREATE POLICY "workout_sessions_delete_client_own"
ON public.workout_sessions
FOR DELETE
USING (auth.uid() = client_id);

-- =================================================================
-- Função para calcular duração automaticamente ao finalizar sessão
-- =================================================================

CREATE OR REPLACE FUNCTION public.calculate_session_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se ended_at está sendo definido, calcular duration_seconds
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para calcular duração ao finalizar sessão
DROP TRIGGER IF EXISTS calculate_workout_session_duration ON public.workout_sessions;
CREATE TRIGGER calculate_workout_session_duration
BEFORE UPDATE ON public.workout_sessions
FOR EACH ROW
WHEN (NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL)
EXECUTE FUNCTION public.calculate_session_duration();

-- =================================================================
-- RESULTADO ESPERADO:
-- ✅ Tabela workout_sessions criada com estrutura completa
-- ✅ RLS habilitado com políticas seguras
-- ✅ Índices otimizados para performance
-- ✅ Trigger automático para updated_at
-- ✅ Trigger para calcular duração automaticamente
-- ✅ Clientes podem gerenciar suas próprias sessões
-- ✅ Profissionais podem visualizar sessões dos clientes
-- =================================================================