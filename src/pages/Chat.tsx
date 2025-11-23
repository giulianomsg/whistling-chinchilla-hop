import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Send, Search, MoreVertical, Phone, Video, ArrowLeft, Loader2, MessageCircle, 
  Check, CheckCheck, Paperclip, FileText, Download
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useIsMobile } from '@/hooks/use-mobile'
import { showSuccess, showError } from '@/utils/toast'

// --- Interfaces ---
interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'call_invite'
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

// --- Utils ---
const formatSidebarDate = (dateString?: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isToday(date)) return format(date, 'HH:mm', { locale: ptBR })
    if (isYesterday(date)) return 'Ontem'
    return format(date, 'dd/MM', { locale: ptBR })
  } catch { return '' }
}

const formatChatTimestamp = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isToday(date)) return format(date, 'HH:mm', { locale: ptBR })
    return format(date, 'dd/MM HH:mm', { locale: ptBR })
  } catch { return '' }
}

const getInitials = (fullName: string | null, email: string) => {
  if (fullName && fullName.trim()) return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return email?.[0]?.toUpperCase() || 'U'
}

// --- Lista de Contatos ---
const ContactsList: React.FC<{
  contacts: Contact[], loading: boolean, selectedContact: Contact | null, 
  onSelect: (c: Contact) => void, searchTerm: string, onSearch: (v: string) => void, onlineUsers: Set<string>
}> = ({ contacts, loading, selectedContact, onSelect, searchTerm, onSearch, onlineUsers }) => {
  const filtered = contacts.filter(c => 
    (c.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full md:w-80 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Mensagens</h2>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white"><MoreVertical className="h-4 w-4" /></Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={e => onSearch(e.target.value)} className="pl-10 bg-black/20 border-white/10 text-white"/>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : 
         filtered.length === 0 ? <div className="text-center py-8 text-gray-500">Nenhum contato.</div> : 
         filtered.map(contact => (
            <div key={contact.id} onClick={() => onSelect(contact)} className={`flex items-center gap-3 p-4 cursor-pointer border-b border-white/5 transition-colors ${selectedContact?.id === contact.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-white/5'}`}>
              <div className="relative">
                <Avatar className="border border-white/10"><AvatarImage src={contact.avatar_url || ''} /><AvatarFallback className="bg-slate-800 text-primary font-bold">{getInitials(contact.full_name, contact.email)}</AvatarFallback></Avatar>
                {onlineUsers.has(contact.id) && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900 shadow-[0_0_8px_#22c55e]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1"><h3 className={`font-medium truncate ${selectedContact?.id === contact.id ? 'text-white' : 'text-gray-200'}`}>{contact.full_name || contact.email}</h3><span className="text-[10px] text-gray-500">{formatSidebarDate(contact.last_message_time)}</span></div>
                <div className="flex justify-between"><p className="text-xs text-gray-400 truncate max-w-[140px]">{contact.last_message || 'Iniciar conversa...'}</p>{contact.unread_count ? <Badge className="h-5 px-1.5 bg-primary text-black font-bold border-none">{contact.unread_count}</Badge> : null}</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// --- Área de Chat ---
const ChatArea: React.FC<{
  contact: Contact | null, messages: ChatMessage[], loading: boolean,
  onSend: (content: string, type?: 'text'|'image'|'file'|'call_invite', fileUrl?: string) => Promise<void>,
  onBack: () => void, isMobile: boolean, online: boolean, user: any
}> = ({ contact, messages, loading, onSend, onBack, isMobile, online, user }) => {
  
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função de Scroll Inteligente
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior })
    }
  }

  // Scroll ao carregar mensagens ou enviar
  useEffect(() => { 
    // Pequeno timeout para garantir renderização do DOM
    const timer = setTimeout(() => scrollToBottom(loading ? 'auto' : 'smooth'), 100)
    return () => clearTimeout(timer)
  }, [messages, loading])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() && !sending) return
    setSending(true)
    await onSend(inputText, 'text')
    setInputText('')
    setSending(false)
    // Scroll forçado após envio
    setTimeout(() => scrollToBottom(), 100)
  }

  const handleCall = async (video: boolean) => {
    if (!contact || !user) return
    const roomName = `capifit-${[user.id, contact.id].sort().join('-')}`
    const callUrl = `https://meet.jit.si/${roomName}`
    await onSend(video ? 'Iniciou uma chamada de vídeo.' : 'Iniciou uma chamada de voz.', 'call_invite', callUrl)
    window.open(callUrl, '_blank')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from('chat-attachments').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(filePath)

      const isImage = file.type.startsWith('image/')
      const type = isImage ? 'image' : 'file'
      const finalUrl = isImage ? `${publicUrl}?t=${Date.now()}` : publicUrl
      const content = isImage ? 'Imagem' : file.name

      await onSend(content, type, finalUrl)
      showSuccess('Enviado!')

    } catch (error: any) { showError('Erro no envio: ' + error.message) } 
    finally { 
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = '' 
    }
  }

  const renderMessageContent = (msg: ChatMessage, isOwn: boolean) => {
    if (msg.message_type === 'image' && msg.file_url) {
      return (
        <div className="space-y-2">
          <img 
            src={msg.file_url} 
            alt="Anexo" 
            className="max-w-full rounded-lg border border-white/10 max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(msg.file_url!, '_blank')}
            // IMPORTANTE: Força scroll quando a imagem termina de carregar
            onLoad={() => scrollToBottom()}
            loading="lazy"
          />
        </div>
      )
    }
    if (msg.message_type === 'file' && msg.file_url) {
      return (
        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isOwn ? 'bg-black/20 border-white/10 hover:bg-black/30' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}>
          <div className="p-2 bg-white/10 rounded-full"><FileText className="h-5 w-5" /></div>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate max-w-[150px]">{msg.content}</p><p className="text-[10px] opacity-70">Clique para baixar</p></div>
          <Download className="h-4 w-4 opacity-70" />
        </a>
      )
    }
    if (msg.message_type === 'call_invite' && msg.file_url) {
      return (
        <div className="flex flex-col gap-2">
          <p className="font-medium">{msg.content}</p>
          <Button size="sm" className={`${isOwn ? 'bg-white text-primary hover:bg-white/90' : 'bg-green-500 text-white hover:bg-green-600'} w-full`} onClick={() => window.open(msg.file_url!, '_blank')}>
            <Video className="mr-2 h-4 w-4" /> Entrar na Sala
          </Button>
        </div>
      )
    }
    return <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
  }

  if (!contact) return <div className="flex-1 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm"><div className="text-center p-8"><div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl shadow-primary/10"><MessageCircle className="h-12 w-12 text-primary" /></div><h3 className="text-2xl font-bold text-white mb-2">Chat CapiFit</h3><p className="text-gray-400">Selecione uma conversa para começar.</p></div></div>

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-900/50 to-black/50 relative">
      <div className="p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          {isMobile && <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5 text-gray-400" /></Button>}
          <Avatar className="border border-white/20"><AvatarImage src={contact.avatar_url || ''} /><AvatarFallback className="bg-slate-800 text-primary font-bold">{getInitials(contact.full_name, contact.email)}</AvatarFallback></Avatar>
          <div><h3 className="font-semibold text-white">{contact.full_name || contact.email}</h3><div className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-500'}`} /><p className="text-xs text-gray-400">{online ? 'Online' : 'Offline'}</p></div></div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleCall(false)} className="text-gray-400 hover:text-primary hover:bg-white/5"><Phone className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleCall(true)} className="text-gray-400 hover:text-primary hover:bg-white/5"><Video className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : messages.length === 0 ? <div className="text-center py-12"><p className="text-gray-500 bg-white/5 inline-block px-4 py-2 rounded-full text-sm">Inicie a conversa 👋</p></div> : messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-3 shadow-lg ${isOwn ? 'bg-primary/20 border border-primary/30 text-white rounded-br-none' : 'bg-white/10 border border-white/10 text-gray-100 rounded-bl-none'}`}>
                {renderMessageContent(msg, isOwn)}
                <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary/70' : 'text-gray-500'}`}>
                  <span className="text-[10px]">{formatChatTimestamp(msg.created_at)}</span>
                  {/* Ícone de Visualizado - Atualizado em Tempo Real */}
                  {isOwn && (msg.is_read ? <CheckCheck className="h-3 w-3 text-blue-400" /> : <Check className="h-3 w-3" />)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-lg">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </Button>
          <Input placeholder="Digite sua mensagem..." value={inputText} onChange={e => setInputText(e.target.value)} className="flex-1 bg-black/30 border-white/10 text-white focus-visible:ring-primary/50" disabled={sending || uploading} />
          <Button type="submit" disabled={!inputText.trim() || sending} size="icon" className="bg-primary hover:bg-primary/80 text-black rounded-xl w-11 h-11 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:scale-105">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}

// --- COMPONENTE PRINCIPAL ---
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
        otherProfiles?.forEach(p => { if(!uniqueMap.has(p.id)) uniqueMap.set(p.id, { ...p, unread_count: 0 }) })
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

  const handleSendMessage = async (content: string, type: 'text'|'image'|'file'|'call_invite' = 'text', fileUrl: string = '') => {
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
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] bg-background overflow-hidden rounded-lg border border-white/10 shadow-2xl">
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