// ATENÇÃO: Salvar como Chat.tsx (com C maiúsculo)

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  ArrowLeft, 
  Loader2, 
  User, 
  Smile, 
  Paperclip,
  MessageCircle,
  Check,
  CheckCheck
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useIsMobile } from '@/hooks/use-mobile'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

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

interface ContactsListProps {
  contacts: Contact[]
  loading: boolean
  selectedContact: Contact | null
  onSelectContact: (contact: Contact) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  onlineUsers: Set<string>
}

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
    <div className="w-full md:w-80 bg-white/80 dark:bg-card/20 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conversas</h2>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-white/5 ${
                selectedContact?.id === contact.id
                  ? 'bg-blue-50 dark:bg-primary/10 border-l-4 border-l-blue-600 dark:border-l-primary'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={contact.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                    {getInitials(contact.full_name, contact.email)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                  onlineUsers.has(contact.id) ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{contact.full_name || contact.email}</h3>
                  {contact.last_message_time && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatMessageDate(contact.last_message_time)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                    {contact.last_message || 'Iniciar conversa...'}
                  </p>
                  {contact.unread_count ? (
                    <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center px-1 text-[10px]">
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
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-background/40 backdrop-blur-sm">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-10 w-10 text-blue-600 dark:text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bem-vindo ao Chat</h3>
          <p className="text-gray-600 dark:text-gray-300">Selecione um contato para começar a conversar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white/50 dark:bg-background/40 backdrop-blur-sm h-full">
      <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-card/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBackToList}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar>
            <AvatarImage src={selectedContact.avatar_url || ''} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
              {getInitials(selectedContact.full_name, selectedContact.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{selectedContact.full_name || selectedContact.email}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${onlineUsers.has(selectedContact.id) ? 'bg-green-500' : 'bg-gray-400'}`} />
              {onlineUsers.has(selectedContact.id) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon"><Phone className="h-5 w-5 text-gray-500" /></Button>
          <Button variant="ghost" size="icon"><Video className="h-5 w-5 text-gray-500" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Nenhuma mensagem ainda. Diga olá! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                  isOwn 
                    ? 'bg-blue-600 text-white dark:bg-primary dark:text-primary-foreground rounded-br-none' 
                    : 'bg-white dark:bg-card border border-gray-100 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-bl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                    <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                    {isOwn && (msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-white/80 dark:bg-card/20">
        <form onSubmit={(e) => onSendMessage(e)} className="flex gap-2 items-end">
          <Button type="button" variant="ghost" size="icon" className="text-gray-500"><Paperclip className="h-5 w-5" /></Button>
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus-visible:ring-blue-500"
            disabled={sendingMessage}
          />
          <Button type="submit" disabled={!newMessage.trim() || sendingMessage} size="icon" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10">
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

  const clearUnreadLocal = (contactId: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unread_count: 0 } : c))
    refreshUnreadCount()
  }

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

        // Busca clientes vinculados também, caso não tenham conversado ainda
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

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-background">
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