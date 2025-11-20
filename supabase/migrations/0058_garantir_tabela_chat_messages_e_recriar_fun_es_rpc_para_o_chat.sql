-- 1. Garantir que a tabela chat_messages exista
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS na tabela chat_messages (idempotente)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 3. Recriar a função RPC count_unread_messages (a que estava dando erro 404)
CREATE OR REPLACE FUNCTION public.count_unread_messages(user_id UUID)
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

-- 4. Recriar função RPC mark_conversation_as_read
CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(user_id UUID, other_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.chat_messages
  SET is_read = true,
      read_at = NOW()
  WHERE receiver_id = user_id
    AND sender_id = other_user_id
    AND is_read = false;
END;
$$;

-- 5. Recriar função RPC get_conversation
CREATE OR REPLACE FUNCTION public.get_conversation(user_id UUID, other_user_id UUID)
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
  SELECT *
  FROM public.chat_messages
  WHERE (sender_id = user_id AND receiver_id = other_user_id)
     OR (sender_id = other_user_id AND receiver_id = user_id)
  ORDER BY created_at ASC;
END;
$$;

-- 6. Remover políticas existentes para evitar duplicação
DROP POLICY IF EXISTS "chat_select_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_insert_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_update_policy" ON public.chat_messages;

-- 7. Recriar políticas RLS para a tabela chat_messages
CREATE POLICY "chat_select_policy" ON public.chat_messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "chat_insert_policy" ON public.chat_messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "chat_update_policy" ON public.chat_messages
FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);