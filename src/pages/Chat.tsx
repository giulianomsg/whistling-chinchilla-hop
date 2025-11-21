// ATENÇÃO: Salvar como Chat.tsx

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
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
  Paperclip
} from 'lucide-react'
import { supabase } from '../integrations/supabase/client'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
  sender: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface Chat {
  id: string
  client_id: string
  professional_id: string
  last_message_at: string | null
  created_at: string
  client: {
    id: string
    full_name: string | null
    avatar_url: string | null
    email: string
  }
  professional: {
    id: string
    full_name: string | null
    avatar_url: string | null
    email: string
  }
  _count: {
    messages: number
  }
}

// Componente da Lista de Contatos
const ContactsList: React.FC<{
  chats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chat: Chat) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  profile: any
  getInitials: (fullName: string | null, email: string) => string
  formatMessageDate: (date: string) => string
}> = ({ 
  chats, 
  selectedChat, 
  onSelectChat, 
  searchTerm, 
  setSearchTerm, 
  profile,
  getInitials,
  formatMessageDate
}) => {
  const filteredChats = chats.filter(chat => {
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    const otherUser = profile?.role === 'professional' ? chat.client : chat.professional
    const fullName = otherUser?.full_name?.toLowerCase() || ''
    const email = otherUser?.email?.toLowerCase() || ''
    
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  return (
    <div className="w-full md:w-80 bg-white/80 dark:bg-card/20 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 flex flex-col">
      {/* Header da Sidebar */}
      <div className="p-4 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conversas</h2>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Chats */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {searchTerm 
                ? 'Tente ajustar sua busca.'
                : 'Inicie uma nova conversa com um cliente.'
              }
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherUser = profile?.role === 'professional' ? chat.client : chat.professional
            
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id
                    ? 'bg-blue-50 dark:bg-primary/10 border-l-4 border-l-blue-600 dark:border-l-primary'
                    : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser?.avatar_url || ''} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(otherUser?.full_name, otherUser?.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {otherUser?.full_name || 'Usuário sem nome'}
                    </h3>
                    {chat.last_message_at && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatMessageDate(chat.last_message_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {chat.last_message_at 
                        ? `Última mensagem em ${formatMessageDate(chat.last_message_at)}`
                        : 'Nenhuma mensagem'
                      }
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {chat._count.messages}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Componente da Área de Chat
const ChatArea: React.FC<{
  selectedChat: Chat | null
  messages: Message[]
  newMessage: string
  setNewMessage: (message: string) => void
  sendingMessage: boolean
  handleSendMessage: (e: React.FormEvent) => void
  messagesEndRef: React.RefObject<HTMLDivElement>
  user: any
  getInitials: (fullName: string | null, email: string) => string
  formatMessageDate: (date: string) => string
}> = ({ 
  selectedChat,
  messages,
  newMessage,
  setNewMessage,
  sendingMessage,
  handleSendMessage,
  messagesEndRef,
  user,
  getInitials,
  formatMessageDate
}) => {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white/50 dark:bg-background/40 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Escolha uma conversa da lista para começar a trocar mensagens.
          </p>
        </div>
      </div>
    )
  }

  const otherUser = user?.role === 'professional' ? selectedChat.professional : selectedChat.client

  return (
    <div className="flex-1 flex flex-col bg-white/50 dark:bg-background/40 backdrop-blur-sm">
      {/* Header do Chat */}
      <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-card/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.avatar_url || ''} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(otherUser?.full_name, otherUser?.email)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {otherUser?.full_name || 'Usuário sem nome'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Online
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma mensagem
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Envie a primeira mensagem para começar a conversa.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.sender_id === user?.id
            
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isMyMessage
                        ? 'bg-blue-600 text-white dark:bg-primary dark:text-primary-foreground'
                        : 'bg-gray-100 text-gray-900 dark:bg-card/60 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                    isMyMessage ? 'text-right' : 'text-left'
                  }`}>
                    {formatMessageDate(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button type="button" variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 dark:bg-card/50 dark:border-white/10 dark:text-white"
            disabled={sendingMessage}
          />
          <Button type="button" variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
            {sendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

const Chat: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { refreshUnreadCount } = useChat()
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Buscar chats do usuário
  const fetchChats = async () => {
    if (!user) return

    try {
      console.log('🔍 [CHAT] Buscando chats do usuário:', user.id)
      
      let query = supabase
        .from('chats')
        .select(`
          *,
          client:profiles!client_id(id, full_name, avatar_url, email),
          professional:profiles!professional_id(id, full_name, avatar_url, email),
          _count: messages(count)
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      // Se for profissional, buscar apenas seus chats
      if (profile?.role === 'professional') {
        query = query.eq('professional_id', user.id)
      } else {
        // Se for cliente, buscar apenas seus chats
        query = query.eq('client_id', user.id)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [CHAT] Erro ao buscar chats:', error)
        return
      }

      console.log('✅ [CHAT] Chats carregados:', data?.length || 0)
      setChats(data || [])
    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado:', error)
    }
  }

  // Buscar mensagens do chat selecionado usando RPC
  const fetchMessages = async (chatId: string) => {
    if (!user) return

    try {
      console.log('🔍 [CHAT] Buscando mensagens do chat:', chatId)
      
      const { data, error } = await supabase.rpc('get_conversation', {
        user1_id: user.id,
        user2_id: selectedChat?.client_id === user.id ? selectedChat.professional_id : selectedChat?.client_id
      })

      if (error) {
        console.error('❌ [CHAT] Erro ao buscar mensagens:', error)
        return
      }

      console.log('✅ [CHAT] Mensagens carregadas:', data?.length || 0)
      setMessages(data || [])
    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado:', error)
    }
  }

  // Enviar nova mensagem
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedChat || !user) return

    setSendingMessage(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      console.log('📤 [CHAT] Enviando mensagem:', messageContent)

      // 1. Inserir mensagem
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          sender_id: user.id,
          content: messageContent
        })
        .select()
        .single()

      if (messageError) {
        console.error('❌ [CHAT] Erro ao enviar mensagem:', messageError)
        setNewMessage(messageContent) // Restaurar mensagem em caso de erro
        return
      }

      console.log('✅ [CHAT] Mensagem enviada com sucesso!')

      // 2. Atualizar last_message_at do chat
      const { error: chatError } = await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedChat.id)

      if (chatError) {
        console.error('❌ [CHAT] Erro ao atualizar chat:', chatError)
      }

      // 3. Buscar mensagem completa com dados do remetente
      const { data: fullMessage, error: fullMessageError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('id', messageData.id)
        .single()

      if (fullMessageError) {
        console.error('❌ [CHAT] Erro ao buscar mensagem completa:', fullMessageError)
        return
      }

      // 4. Adicionar mensagem à lista
      setMessages(prev => [...prev, fullMessage])

      // 5. Atualizar lista de chats para mover este chat para o topo
      await fetchChats()

    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado ao enviar mensagem:', error)
      setNewMessage(messageContent) // Restaurar mensagem em caso de erro
    } finally {
      setSendingMessage(false)
    }
  }

  // Selecionar chat
  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat)
    await fetchMessages(chat.id)
  }

  // Marcar mensagens como lidas
  const clearUnread = async () => {
    if (!selectedChat || !user) return

    try {
      const otherUserId = selectedChat.client_id === user.id ? selectedChat.professional_id : selectedChat.client_id
      
      const { error } = await supabase.rpc('mark_conversation_as_read', {
        current_user_id: user.id,
        other_user_id: otherUserId
      })

      if (error) {
        console.error('❌ [CHAT] Erro ao marcar mensagens como lidas:', error)
        return
      }

      console.log('✅ [CHAT] Mensagens marcadas como lidas')
      refreshUnreadCount()
    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado ao marcar mensagens:', error)
    }
  }

  // Formatar data da mensagem
  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date)
    
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm', { locale: ptBR })
    } else if (isYesterday(messageDate)) {
      return 'Ontem'
    } else {
      return format(messageDate, 'dd/MM/yyyy', { locale: ptBR })
    }
  }

  // Obter iniciais do nome para avatar
  const getInitials = (fullName: string | null, email: string) => {
    if (fullName && fullName.trim()) {
      return fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    // Fallback para email
    return email?.[0]?.toUpperCase() || 'U'
  }

  // Auto-scroll para a última mensagem
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [messages])

  // Buscar chats ao carregar
  useEffect(() => {
    if (!loading && user) {
      fetchChats()
    }
  }, [user, loading])

  // Configurar canal único para Presence e Postgres Changes
  useEffect(() => {
    if (!user) return

    console.log('🔔 [CHAT] Configurando canal único de notificações para:', user.id)

    const channel = supabase.channel('chat_notifications')
      .on('presence', { event: 'sync' }, (payload) => {
        console.log('🔔 [CHAT] Presence event:', payload)
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMessage = payload.new as any
          
          // Verificar se a mensagem é para o usuário atual
          if (newMessage.receiver_id === user.id || newMessage.sender_id === user.id) {
            console.log('🔔 [CHAT] Nova mensagem recebida:', newMessage)
            
            // Se estamos no chat correspondente, adicionar mensagem à lista
            if (selectedChat && (
              (selectedChat.id === newMessage.chat_id) ||
              (selectedChat.client_id === newMessage.sender_id || selectedChat.professional_id === newMessage.sender_id)
            )) {
              // Buscar mensagem completa
              const { data: fullMessage } = await supabase
                .from('messages')
                .select(`
                  *,
                  sender:profiles!sender_id(id, full_name, avatar_url)
                `)
                .eq('id', newMessage.id)
                .single()

              if (fullMessage) {
                setMessages(prev => [...prev, fullMessage])
              }
            }
            
            // Atualizar lista de chats
            await fetchChats()
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ [CHAT] Inscrito no canal de notificações')
        }
      })

    return () => {
      console.log('🔌 [CHAT] Limpando canal de notificações')
      channel.unsubscribe()
    }
  }, [user?.id, selectedChat?.id])

  // Marcar mensagens como lidas quando selecionar um chat
  useEffect(() => {
    if (selectedChat) {
      clearUnread()
    }
  }, [selectedChat?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Lista de Conversas */}
        <ContactsList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          profile={profile}
          getInitials={getInitials}
          formatMessageDate={formatMessageDate}
        />

        {/* Área de Chat */}
        <ChatArea
          selectedChat={selectedChat}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendingMessage={sendingMessage}
          handleSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
          user={user}
          getInitials={getInitials}
          formatMessageDate={formatMessageDate}
        />
      </div>
    </div>
  )
}

export default Chat