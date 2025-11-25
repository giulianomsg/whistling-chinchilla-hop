import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { supabase } from '@/integrations/supabase/client'
import { useIsMobile } from '@/hooks/use-mobile'
import { showError } from '@/utils/toast'
import { Contact, ChatMessage } from '@/components/chat/types'
import ContactsList from '@/components/chat/ContactsList'
import ChatArea from '@/components/chat/ChatArea'

const Chat: React.FC = () => {
  const { user, profile } = useAuth()
  const { refreshUnreadCount } = useChat()
  const isMobile = useIsMobile()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  const channelRef = useRef<any>(null)

  const fetchContacts = async () => {
    if (!user) return
    try {
      setLoading(true)
      let contactsData: Contact[] = []

      if (profile?.role === 'client') {
        const { data } = await supabase.from('client_professionals').select(`professional:profiles!professional_id(*)`).eq('client_id', user.id).eq('status', 'active')
        contactsData = (data || []).map((i: any) => ({ ...i.professional, unread_count: 0 }))
      } else {
        const { data: clients } = await supabase.from('client_professionals').select(`client:profiles!client_id(*)`).eq('professional_id', user.id).eq('status', 'active')
        const clientContacts = (clients || []).map((i: any) => ({ ...i.client, unread_count: 0 }))
        const { data: msgs } = await supabase.from('chat_messages').select('sender_id, receiver_id').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        const ids = new Set<string>()
        msgs?.forEach(m => { ids.add(m.sender_id); ids.add(m.receiver_id) })
        ids.delete(user.id)
        const { data: otherProfiles } = await supabase.from('profiles').select('*').in('id', Array.from(ids))
        const uniqueMap = new Map()
        clientContacts.forEach(c => uniqueMap.set(c.id, c))
        otherProfiles?.forEach(p => { if (!uniqueMap.has(p.id)) uniqueMap.set(p.id, { ...p, unread_count: 0 }) })
        contactsData = Array.from(uniqueMap.values())
      }

      const enriched = await Promise.all(contactsData.map(async (c) => {
        const { count } = await supabase.from('chat_messages').select('id', { count: 'exact', head: true }).eq('sender_id', c.id).eq('receiver_id', user.id).eq('is_read', false)
        const { data: last } = await supabase.from('chat_messages').select('content, created_at, message_type').or(`and(sender_id.eq.${user.id},receiver_id.eq.${c.id}),and(sender_id.eq.${c.id},receiver_id.eq.${user.id})`).order('created_at', { ascending: false }).limit(1).maybeSingle()
        let lastMsg = last?.content || ''
        if (last?.message_type === 'image') lastMsg = '📷 Imagem'
        if (last?.message_type === 'file') lastMsg = '📎 Arquivo'
        if (last?.message_type === 'call_invite') lastMsg = '📞 Chamada'
        return { ...c, unread_count: count || 0, last_message: lastMsg, last_message_time: last?.created_at }
      }))

      setContacts(enriched.sort((a, b) => new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime()))
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const fetchMessages = async (contactId: string) => {
    setMessagesLoading(true)
    const { data } = await supabase.rpc('get_conversation', { user1_id: user!.id, user2_id: contactId, limit_count: 100 })
    setMessages(data || [])
    setMessagesLoading(false)
    await supabase.rpc('mark_conversation_as_read', { current_user_id: user!.id, other_user_id: contactId })
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unread_count: 0 } : c))
    refreshUnreadCount()
  }

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'file' | 'call_invite' = 'text', fileUrl: string = '') => {
    if (!selectedContact || !user) return
    try {
      const newMsg = { sender_id: user.id, receiver_id: selectedContact.id, content, message_type: type, file_url: fileUrl || null }
      await supabase.from('chat_messages').insert(newMsg)
      fetchContacts()
    } catch (e) { console.error(e); showError('Erro ao enviar') }
  }

  useEffect(() => {
    if (!user) return
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    channelRef.current = supabase.channel('global_chat')
      .on('presence', { event: 'sync' }, () => {
        const state = channelRef.current.presenceState()
        const ids = new Set<string>()
        for (const key in state) { (state[key] as any[]).forEach(p => ids.add(p.user_id)) }
        setOnlineUsers(ids)
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages' }, // ESCUTAR TODOS OS EVENTOS (INSERT + UPDATE)
        (payload) => {
          // INSERT: Nova Mensagem
          if (payload.eventType === 'INSERT') {
            const msg = payload.new as ChatMessage
            if (msg.receiver_id === user.id || msg.sender_id === user.id) {
              if (selectedContact && (msg.sender_id === selectedContact.id || msg.receiver_id === selectedContact.id)) {
                setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
                if (msg.receiver_id === user.id) supabase.rpc('mark_conversation_as_read', { current_user_id: user.id, other_user_id: msg.sender_id })
              }
              fetchContacts()
            }
          }
          // UPDATE: Leitura de Mensagem (Double Check)
          if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as ChatMessage
            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
          }
        }
      )
      .subscribe(async (status: any) => { if (status === 'SUBSCRIBED') await channelRef.current.track({ user_id: user.id }) })
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [user, selectedContact])

  useEffect(() => { fetchContacts() }, [user])

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] bg-background overflow-hidden rounded-lg border border-border shadow-2xl">
      {isMobile ? (
        selectedContact ? (
          <ChatArea contact={selectedContact} messages={messages} loading={messagesLoading} onSend={handleSendMessage} onBack={() => setSelectedContact(null)} isMobile={true} online={onlineUsers.has(selectedContact.id)} user={user} />
        ) : (
          <ContactsList contacts={contacts} loading={loading} selectedContact={selectedContact} onSelect={(c) => { setSelectedContact(c); fetchMessages(c.id); }} searchTerm={searchTerm} onSearch={setSearchTerm} onlineUsers={onlineUsers} />
        )
      ) : (
        <>
          <ContactsList contacts={contacts} loading={loading} selectedContact={selectedContact} onSelect={(c) => { setSelectedContact(c); fetchMessages(c.id); }} searchTerm={searchTerm} onSearch={setSearchTerm} onlineUsers={onlineUsers} />
          <ChatArea contact={selectedContact} messages={messages} loading={messagesLoading} onSend={handleSendMessage} onBack={() => setSelectedContact(null)} isMobile={false} online={selectedContact ? onlineUsers.has(selectedContact.id) : false} user={user} />
        </>
      )}
    </div>
  )
}

export default Chat