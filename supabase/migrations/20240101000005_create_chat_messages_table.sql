-- Migração: Criar tabela chat_messages para sistema de chat
-- Objetivo: Permitir troca de mensagens entre profissionais e clientes

-- 1. Criar tabela chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON public.chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON public.chat_messages(receiver_id, is_read, created_at DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança

-- Política SELECT: Usuários só podem ver mensagens onde são remetente ou destinatário
CREATE POLICY "chat_messages_select_participants" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Política INSERT: Usuários só podem enviar mensagens como remetente (sender_id = auth.uid())
CREATE POLICY "chat_messages_insert_sender" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Política UPDATE: Usuários só podem atualizar mensagens que enviaram (marcar como lida pelo destinatário)
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

-- 5. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_chat_messages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 6. Aplicar trigger na tabela
CREATE TRIGGER handle_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_chat_messages_updated_at();

-- 7. Criar trigger para marcar data de leitura
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

-- 8. Aplicar trigger de leitura
CREATE TRIGGER handle_chat_read_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_chat_read_at();

-- 9. Adicionar comentários para documentação
COMMENT ON TABLE public.chat_messages IS 'Tabela para armazenar mensagens de chat entre profissionais e clientes';
COMMENT ON COLUMN public.chat_messages.sender_id IS 'ID do usuário que enviou a mensagem';
COMMENT ON COLUMN public.chat_messages.receiver_id IS 'ID do usuário que recebeu a mensagem';
COMMENT ON COLUMN public.chat_messages.content IS 'Conteúdo da mensagem de texto';
COMMENT ON COLUMN public.chat_messages.message_type IS 'Tipo da mensagem: text, image, file, system';
COMMENT ON COLUMN public.chat_messages.file_url IS 'URL do arquivo (para mensagens do tipo image ou file)';
COMMENT ON COLUMN public.chat_messages.is_read IS 'Indica se a mensagem foi lida pelo destinatário';
COMMENT ON COLUMN public.chat_messages.read_at IS 'Data/hora em que a mensagem foi marcada como lida';