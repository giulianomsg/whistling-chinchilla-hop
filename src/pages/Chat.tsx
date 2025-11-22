import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  ArrowLeft, 
  Loader2, 
  MessageCircle,
  Check,
  CheckCheck,
  Paperclip
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useIsMobile } from '@/hooks/use-mobile'

// Interfaces mantidas (sem alteração na tipagem)
interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: string
  file_url: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}

interface Contact {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
}

// --- Componente da Lista de Contatos (Com Visual Nexus) ---
interface ContactsListProps {
  contacts: Contact[]
  loading: boolean
  selectedContact: Contact | null
  onSelectContact: (contact: Contact) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  onlineUsers: Set<string>
}

const ContactsList: React.FC<ContactsListProps> = ({ 
  contacts, 
  loading, 
  selectedContact, 
  onSelectContact, 
  searchTerm, 
  onSearchChange,
  onlineUsers 
}) => {
  const getInitials = (fullName: string | null, email: string) => {
    if (fullName && fullName.trim()) {
      return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.[0]?.toUpperCase() || 'U'
  }

  const formatMessageDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isToday(date)) return format(date, 'HH:mm', { locale: ptBR })
      if (isYesterday(date)) return 'Ontem'
      return format(date, 'dd/MM', { locale: ptBR })
    } catch { return '' }
  }

  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm.trim()) return true
    const searchLower = searchTerm.toLowerCase()
    const fullName = contact.full_name?.toLowerCase() || ''
    const email = contact.email?.toLowerCase() || ''
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  return (
    // Glassmorphism Sidebar
    <div className="w-full md:w-80 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Mensagens</h2>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar conversa..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
               <MessageCircle className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-white/5 ${
                selectedContact?.id === contact.id
                  ? 'bg-primary/10 border-l-4 border-l-primary'
                  : 'hover:bg-white/5 border-l-4 border-l-transparent'
              }`}
            >
              <div className="relative">
                <Avatar className="border-2 border-white/10">
                  <AvatarImage src={contact.avatar_url || ''} />
                  <AvatarFallback className="bg-slate-800 text-primary font-bold">
                    {getInitials(contact.full_name, contact.email)}
                  </AvatarFallback>
                </Avatar>
                {/* Status Dot com brilho neon */}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  onlineUsers.has(contact.id) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-medium truncate ${selectedContact?.id === contact.id ? 'text-white' : 'text-gray-200'}`}>
                    {contact.full_name || contact.email}
                  </h3>
                  {contact.last_message_time && (
                    <span className="text-[10px] text-gray-500">{formatMessageDate(contact.last_message_time)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 truncate max-w-[140px]">
                    {contact.last_message || 'Iniciar conversa...'}
                  </p>
                  {contact.unread_count ? (
                    <Badge className="h-5 min-w-[20px] flex items-center justify-center px-1 text-[10px] bg-primary text-black font-bold border-none">
                      {contact.unread_count}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// --- Componente da Área de Chat (Com Visual Nexus) ---
interface ChatAreaProps {
  selectedContact: Contact | null
  messages: ChatMessage[]
  messagesLoading: boolean
  newMessage: string
  sendingMessage: boolean
  onSendMessage: (e?: React.FormEvent) => void
  onNewMessageChange: (value: string) => void
  onlineUsers: Set<string>
  user: any
  onBackToList: () => void
  isMobile: boolean
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedContact,
  messages,
  messagesLoading,
  newMessage,
  sendingMessage,
  onSendMessage,
  onNewMessageChange,
  onlineUsers,
  user,
  onBackToList,
  isMobile
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, selectedContact, messagesLoading])

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: ptBR })
    } catch { return '' }
  }

  const getInitials = (fullName: string | null, email: string) => {
    if (fullName && fullName.trim()) return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    return email?.[0]?.toUpperCase() || 'U'
  }

  if (!selectedContact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl shadow-primary/10">
            <MessageCircle className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Chat CapiFit</h3>
          <p className="text-gray-400 max-w-md">
            Selecione um aluno ou profissional ao lado para iniciar uma conversa em tempo real.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-900/50 to-black/50">
      {/* Header do Chat */}
      <div className="p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBackToList} className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="border border-white/20">
            <AvatarImage src={selectedContact.avatar_url || ''} />
            <AvatarFallback className="bg-slate-800 text-primary font-bold">
              {getInitials(selectedContact.full_name, selectedContact.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white">{selectedContact.full_name || selectedContact.email}</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${onlineUsers.has(selectedContact.id) ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-500'}`} />
              <p className="text-xs text-gray-400">
                {onlineUsers.has(selectedContact.id) ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary hover:bg-white/5"><Phone className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary hover:bg-white/5"><Video className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messagesLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 bg-white/5 inline-block px-4 py-2 rounded-full text-sm">
              Inicie a conversa com um "Olá" 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] md:max-w-[65%] rounded-2xl px-5 py-3 shadow-lg ${
                  isOwn 
                    ? 'bg-primary/20 border border-primary/30 text-white rounded-br-none backdrop-blur-sm' 
                    : 'bg-white/10 border border-white/10 text-gray-100 rounded-bl-none backdrop-blur-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1.5 ${isOwn ? 'text-primary/70' : 'text-gray-500'}`}>
                    <span className="text-[10px] font-medium">{formatTime(msg.created_at)}</span>
                    {isOwn && (msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de Input */}
      <div className="p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-lg">
        <form onSubmit={(e) => onSendMessage(e)} className="flex gap-3 items-end">
          <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            className="flex-1 bg-black/30 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary/50 min-h-[44px]"
            disabled={sendingMessage}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sendingMessage} 
            size="icon" 
            className="bg-primary hover:bg-primary/80 text-black rounded-xl w-11 h-11 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:scale-105"
          >
            {sendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}

const Chat: React.FC = () => {
  const { user, profile } = useAuth()
  const { refreshUnreadCount } = useChat()
  const isMobile = useIsMobile()
  
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  // Lógica de limpeza de contagem (mantida)
  const clearUnreadLocal = (contactId: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unread_count: 0 } : c))
    refreshUnreadCount()
  }

  // Busca de contatos (mantida)
  const fetchContacts = async () => {
    if (!user) return
    try {
      setLoading(true)
      let contactsData: Contact[] = []
      
      if (profile?.role === 'client') {
        const { data } = await supabase.from('client_professionals')
          .select(`*, professional:profiles!professional_id(*)`)
          .eq('client_id', user.id).eq('status', 'active')
        
        contactsData = (data || []).map((item: any) => ({
          id: item.professional.id,
          email: item.professional.email,
          full_name: item.professional.full_name,
          avatar_url: item.professional.avatar_url,
          role: item.professional.role,
          unread_count: 0
        }))
      } else {
        const { data: conversations } = await supabase.from('chat_messages')
          .select('sender_id, receiver_id').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        
        const ids = new Set<string>()
        conversations?.forEach(c => {
          if (c.sender_id !== user.id) ids.add(c.sender_id)
          if (c.receiver_id !== user.id) ids.add(c.receiver_id)
        })

        const { data: clientLinks } = await supabase.from('client_professionals')
          .select('client_id').eq('professional_id', user.id).eq('status', 'active')
        
        clientLinks?.forEach(l => ids.add(l.client_id))

        if (ids.size > 0) {
          const { data: profiles } = await supabase.from('profiles').select('*').in('id', Array.from(ids))
          contactsData = (profiles || []).map((p: any) => ({ ...p, unread_count: 0 }))
        }
      }

      const enriched = await Promise.all(contactsData.map(async (contact) => {
        const { count } = await supabase.from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', contact.id).eq('receiver_id', user.id).eq('is_read', false)
        
        const { data: realLast } = await supabase.from('chat_messages')
          .select('content, created_at').or(`and(sender_id.eq.${user.id},receiver_id.eq.${contact.id}),and(sender_id.eq.${contact.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: false }).limit(1).maybeSingle()

        return {
          ...contact,
          last_message: realLast?.content,
          last_message_time: realLast?.created_at,
          unread_count: count || 0
        }
      }))

      setContacts(enriched.sort((a, b) => new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime()))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (contactId: string, showLoader = true) => {
    if (!user) return
    if (showLoader) setMessagesLoading(true)
    try {
      const { data } = await supabase.rpc('get_conversation', {
        user1_id: user.id,
        user2_id: contactId,
        limit_count: 50
      })
      if (data) {
        setMessages(data)
        const { error } = await supabase.rpc('mark_conversation_as_read', {
          current_user_id: user.id,
          other_user_id: contactId
        })
        if (!error) clearUnreadLocal(contactId)
      }
    } catch (e) { console.error(e) }
    finally { if (showLoader) setMessagesLoading(false) }
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newMessage.trim() || !selectedContact) return
    setSendingMessage(true)
    try {
      await supabase.from('chat_messages').insert({
        sender_id: user!.id,
        receiver_id: selectedContact.id,
        content: newMessage.trim(),
        message_type: 'text'
      })
      setNewMessage('')
      await fetchMessages(selectedContact.id, false)
      fetchContacts()
    } catch (err) { console.error(err) }
    finally { setSendingMessage(false) }
  }

  // Realtime Effect (mantido)
  useEffect(() => {
    if (!user) return
    const channel = supabase.channel('global_chat')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const ids = new Set<string>()
        for (const key in state) {
          const p = state[key][0] as any
          if (p?.user_id) ids.add(p.user_id)
        }
        setOnlineUsers(ids)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const newMsg = payload.new as ChatMessage
        if (newMsg.receiver_id === user.id || newMsg.sender_id === user.id) {
          if (selectedContact && (newMsg.sender_id === selectedContact.id || newMsg.receiver_id === selectedContact.id)) {
            setMessages(prev => [...prev, newMsg])
            if (newMsg.receiver_id === user.id) {
               supabase.rpc('mark_conversation_as_read', { current_user_id: user.id, other_user_id: newMsg.sender_id })
            }
          }
          fetchContacts()
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await channel.track({ user_id: user.id })
      })
    return () => { channel.unsubscribe() }
  }, [user, selectedContact])

  useEffect(() => { fetchContacts() }, [user])

  // Layout Responsivo
  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] bg-background overflow-hidden rounded-lg border border-white/10 shadow-2xl">
      {isMobile ? (
        selectedContact ? (
          <ChatArea 
            selectedContact={selectedContact} messages={messages} messagesLoading={messagesLoading}
            newMessage={newMessage} sendingMessage={sendingMessage} onSendMessage={handleSendMessage}
            onNewMessageChange={setNewMessage} onlineUsers={onlineUsers} user={user}
            onBackToList={() => setSelectedContact(null)} isMobile={true}
          />
        ) : (
          <ContactsList 
            contacts={contacts} loading={loading} selectedContact={selectedContact}
            onSelectContact={(c) => { setSelectedContact(c); fetchMessages(c.id); }}
            searchTerm={searchTerm} onSearchChange={setSearchTerm} onlineUsers={onlineUsers}
          />
        )
      ) : (
        <>
          <ContactsList 
            contacts={contacts} loading={loading} selectedContact={selectedContact}
            onSelectContact={(c) => { setSelectedContact(c); fetchMessages(c.id); }}
            searchTerm={searchTerm} onSearchChange={setSearchTerm} onlineUsers={onlineUsers}
          />
          <ChatArea 
            selectedContact={selectedContact} messages={messages} messagesLoading={messagesLoading}
            newMessage={newMessage} sendingMessage={sendingMessage} onSendMessage={handleSendMessage}
            onNewMessageChange={setNewMessage} onlineUsers={onlineUsers} user={user}
            onBackToList={() => setSelectedContact(null)} isMobile={false}
          />
        </>
      )}
    </div>
  )
}

export default Chat