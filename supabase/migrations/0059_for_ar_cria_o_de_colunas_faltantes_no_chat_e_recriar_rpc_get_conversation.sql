-- 1. Forçar adição de colunas
DO $$
BEGIN
    -- created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='created_at') THEN
        ALTER TABLE public.chat_messages ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    END IF;

    -- updated_at (O erro principal)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='updated_at') THEN
        ALTER TABLE public.chat_messages ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    END IF;

    -- read_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='read_at') THEN
        ALTER TABLE public.chat_messages ADD COLUMN read_at TIMESTAMPTZ;
    END IF;
END $$;

-- 2. Recriar a função get_conversation alinhada
DROP FUNCTION IF EXISTS public.get_conversation(uuid, uuid, integer, integer);

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

-- 3. Garantir permissões
GRANT EXECUTE ON FUNCTION public.get_conversation(uuid, uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_conversation(uuid, uuid, integer, integer) TO service_role;