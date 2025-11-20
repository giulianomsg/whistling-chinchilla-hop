-- Migração: Criar infraestrutura completa para sistema de chat
-- Objetivo: Tabela chat_messages com segurança, performance e suporte a Realtime

-- 1. Criar tabela chat_messages com estrutura completa
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Criar índices para performance otimizada
-- Índice para buscar mensagens enviadas por um usuário
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);

-- Índice para buscar mensagens recebidas por um usuário
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON public.chat_messages(receiver_id);

-- Índice para ordenação por data (mais recentes primeiro)
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Índice composto para conversas (performance crítica)
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(sender_id, receiver_id, created_at DESC);

-- Índice para mensagens não lidas (notificações)
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON public.chat_messages(receiver_id, is_read, created_at DESC);

-- Índice para mensagens por tipo (filtragem)
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON public.chat_messages(message_type);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança (Policies)

-- Política SELECT: Usuários só podem ver mensagens onde são remetente ou destinatário
CREATE POLICY "chat_messages_select_participants" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Política INSERT: Usuários só podem enviar mensagens como eles mesmos (sender_id = auth.uid())
CREATE POLICY "chat_messages_insert_sender" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Política UPDATE: Usuários só podem atualizar mensagens que enviaram
CREATE POLICY "chat_messages_update_sender" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Política UPDATE adicional: Destinatário pode marcar mensagem como lida
CREATE POLICY "chat_messages_update_read_status" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id AND is_read = false)
  WITH CHECK (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Política DELETE: Usuários só podem deletar mensagens que enviaram
CREATE POLICY "chat_messages_delete_sender" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

-- 5. Criar triggers automáticos

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_chat_messages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Aplicar trigger de updated_at
CREATE TRIGGER handle_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_chat_messages_updated_at();

-- Trigger para marcar data de leitura automaticamente
CREATE OR REPLACE FUNCTION public.handle_chat_read_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se a mensagem está sendo marcada como lida e antes não estava
  IF NEW.is_read = true AND OLD.is_read = false AND NEW.receiver_id = auth.uid() THEN
    NEW.read_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger de leitura
CREATE TRIGGER handle_chat_read_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_chat_read_at();

-- 6. Habilitar Realtime para mensagens em tempo real
-- Nota: Esta operação pode requerer permissões de superuser
DO $$
BEGIN
  -- Verificar se a publicação supabase_realtime existe
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Criar publicação se não existir
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  -- Adicionar tabela à publicação se ainda não estiver
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Se não tiver permissão, registrar o erro para debug
    RAISE NOTICE 'AVISO: Não foi possível habilitar Realtime para chat_messages. Execute manualmente no dashboard do Supabase.';
END $$;

-- 7. Criar funções auxiliares para consultas comuns

-- Função para buscar conversa entre dois usuários
CREATE OR REPLACE FUNCTION public.get_conversation(
  user1_id UUID,
  user2_id UUID,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  message_type TEXT,
  file_url TEXT,
  is_read BOOLEAN,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.sender_id,
    cm.receiver_id,
    cm.content,
    cm.message_type,
    cm.file_url,
    cm.is_read,
    cm.read_at,
    cm.created_at,
    cm.updated_at
  FROM public.chat_messages cm
  WHERE (cm.sender_id = user1_id AND cm.receiver_id = user2_id)
     OR (cm.sender_id = user2_id AND cm.receiver_id = user1_id)
  ORDER BY cm.created_at ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Função para contar mensagens não lidas de um usuário
CREATE OR REPLACE FUNCTION public.count_unread_messages(
  user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.chat_messages
  WHERE receiver_id = user_id AND is_read = false;
  
  RETURN unread_count;
END;
$$;

-- Função para marcar todas as mensagens de uma conversa como lidas
CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(
  current_user_id UUID,
  other_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  marked_count INTEGER;
BEGIN
  UPDATE public.chat_messages
  SET is_read = true,
      read_at = NOW(),
      updated_at = NOW()
  WHERE receiver_id = current_user_id 
    AND sender_id = other_user_id 
    AND is_read = false;
  
  GET DIAGNOSTICS ROW_COUNT = marked_count;
  RETURN marked_count;
END;
$$;

-- 8. Adicionar comentários para documentação
COMMENT ON TABLE public.chat_messages IS 'Tabela para armazenar mensagens de chat entre profissionais e clientes';
COMMENT ON COLUMN public.chat_messages.sender_id IS 'ID do usuário que enviou a mensagem';
COMMENT ON COLUMN public.chat_messages.receiver_id IS 'ID do usuário que recebeu a mensagem';
COMMENT ON COLUMN public.chat_messages.content IS 'Conteúdo da mensagem de texto';
COMMENT ON COLUMN public.chat_messages.message_type IS 'Tipo da mensagem: text, image, file, system';
COMMENT ON COLUMN public.chat_messages.file_url IS 'URL do arquivo (para mensagens do tipo image ou file)';
COMMENT ON COLUMN public.chat_messages.is_read IS 'Indica se a mensagem foi lida pelo destinatário';
COMMENT ON COLUMN public.chat_messages.read_at IS 'Data/hora em que a mensagem foi marcada como lida';
COMMENT ON COLUMN public.chat_messages.created_at IS 'Data/hora de criação da mensagem';
COMMENT ON COLUMN public.chat_messages.updated_at IS 'Data/hora da última atualização da mensagem';

COMMENT ON FUNCTION public.get_conversation IS 'Busca conversa entre dois usuários com paginação';
COMMENT ON FUNCTION public.count_unread_messages IS 'Conta mensagens não lidas para um usuário';
COMMENT ON FUNCTION public.mark_conversation_as_read IS 'Marca todas as mensagens de uma conversa como lidas';

-- 9. Criar view para estatísticas de chat (opcional, para dashboard)
CREATE OR REPLACE VIEW public.chat_stats AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  p.role,
  COUNT(CASE WHEN cm.sender_id = p.id THEN 1 END) as messages_sent,
  COUNT(CASE WHEN cm.receiver_id = p.id THEN 1 END) as messages_received,
  COUNT(CASE WHEN cm.receiver_id = p.id AND cm.is_read = false THEN 1 END) as unread_messages,
  MAX(cm.created_at) as last_message_at
FROM public.profiles p
LEFT JOIN public.chat_messages cm ON (p.id = cm.sender_id OR p.id = cm.receiver_id)
GROUP BY p.id, p.full_name, p.email, p.role;

COMMENT ON VIEW public.chat_stats IS 'Estatísticas de chat por usuário para dashboard';