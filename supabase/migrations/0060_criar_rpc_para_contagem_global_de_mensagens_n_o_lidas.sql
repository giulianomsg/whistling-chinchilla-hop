CREATE OR REPLACE FUNCTION public.count_total_unread_messages(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM public.chat_messages
  WHERE receiver_id = user_id AND is_read = false;

  RETURN COALESCE(total_count, 0);
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION public.count_total_unread_messages(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_total_unread_messages(uuid) TO service_role;