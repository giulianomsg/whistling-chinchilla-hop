// ... (imports e interfaces permanecem os mesmos)

// ... (componentes ContactsList e ChatArea permanecem os mesmos)

const Chat: React.FC = () => {
  // ... (estados e hooks permanecem os mesmos)

  // Buscar histórico de mensagens - CORREÇÃO DA QUERY APLICADA AQUI
  const fetchMessages = async (contactId: string) => {
    if (!user || !contactId) return

    try {
      console.log('🔍 [CHAT] Buscando mensagens com:', contactId)
      setMessagesLoading(true)

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ [CHAT] Erro ao buscar mensagens:', error)
        setMessages([])
        return
      }

      console.log('✅ [CHAT] Mensagens carregadas:', data?.length || 0)
      setMessages(data || [])

      // Marcar mensagens como lidas
      await markMessagesAsRead(contactId)

    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado ao buscar mensagens:', error)
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  // ... (resto do componente permanece o mesmo)
}

export default Chat