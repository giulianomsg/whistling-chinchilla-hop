-- Criar tabela de notificações profissionais
CREATE TABLE IF NOT EXISTS public.professional_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'new_workout', 'completed_workout', 'abandoned_workout', etc
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.professional_notifications ENABLE ROW LEVEL SECURITY;

-- Política: Profissional pode ver (SELECT) suas próprias notificações
CREATE POLICY "prof_view_own_notifications" ON public.professional_notifications
FOR SELECT USING (auth.uid() = professional_id);

-- Política: Profissional pode criar (INSERT) suas próprias notificações
CREATE POLICY "prof_insert_own_notifications" ON public.professional_notifications
FOR INSERT WITH CHECK (auth.uid() = professional_id);

-- Política: Profissional pode atualizar (UPDATE) suas próprias notificações (marcar como lida)
CREATE POLICY "prof_update_own_notifications" ON public.professional_notifications
FOR UPDATE USING (auth.uid() = professional_id);

-- Política: Profissional pode deletar (DELETE) suas próprias notificações
CREATE POLICY "prof_delete_own_notifications" ON public.professional_notifications
FOR DELETE USING (auth.uid() = professional_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_professional_notifications_professional_id ON public.professional_notifications(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_notifications_client_id ON public.professional_notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_professional_notifications_created_at ON public.professional_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_professional_notifications_read ON public.professional_notifications(read);

-- Trigger para atualizar created_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_notifications_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger para garantir created_at seja atualizado em inserts
DROP TRIGGER IF EXISTS handle_notifications_created_at ON public.professional_notifications;
CREATE TRIGGER handle_notifications_created_at
BEFORE INSERT ON public.professional_notifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_notifications_updated_at();