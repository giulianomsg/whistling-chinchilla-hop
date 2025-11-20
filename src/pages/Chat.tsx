// ATENÇÃO: Este arquivo DEVE ser salvo como "Chat.tsx" (com C maiúsculo) para funcionar no Linux/Vercel

import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'
import { 
  Send, 
  Search, 
  Users, 
  MessageCircle, 
  Loader2,
  Check,
  CheckCheck,
  Clock,
  Circle
} from 'lucide-react'
import { supabase } from '../integrations/supabase/client'
import { showSuccess, showError } from '../utils/toast'
import { format } from 'date-fns'

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
  onSendMessage: () => void
  onNewMessageChange: (value: string) => void
  onlineUsers: Set<string>
}

// Componente ContactsList - FORA DO COMPONENTE PRINCIPAL
const ContactsList: React.FC<ContactsListProps> = ({ 
  contacts, 
  loading, 
  selectedContact, 
  onSelectContact, 
  searchTerm, 
  onSearchChange,
  onlineUsers
}) => {
  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        return 'Agora'
      } else if (diffInHours < 24) {
        return `Há ${Math.floor(diffInHours)}h`
      } else {
        return format(date, 'dd/MM HH:mm')
      }
    } catch (error) {
      return dateString
    }
  }

  // Filtrar contatos pelo termo de busca
  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    const fullName = contact.full_name?.toLowerCase() || ''
    const email = contact.email?.toLowerCase() || ''
    
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  return (
    <div className="w-full md:w-80 border-r bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversas
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar_url || ''} />
                      <AvatarFallback>
                        {contact.full_name?.[0]?.toUpperCase() || contact.email[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Indicador Online */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      onlineUsers.has(contact.id) 
                        ? 'bg-green-500' 
                        : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {contact.full_name || contact.email}
                      </p>
                      {contact.last_message_time && (
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(contact.last_message_time)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {contact.last_message || 'Iniciar conversação...'}
                      </p>
                      {contact.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {contact.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </div>
  )
}

// Componente ChatArea - FORA DO COMPONENTE PRINCIPAL
const ChatArea: React.FC<ChatAreaProps> = ({ 
  selectedContact, 
  messages, 
  messagesLoading, 
  newMessage, 
  sendingMessage, 
  onSendMessage, 
  onNewMessageChange,
  onlineUsers
}) => {
  const { user } = useAuth()

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        return 'Agora'
      } else if (diffInHours < 24) {
        return `Há ${Math.floor(diffInHours)}h`
      } else {
        return format(date, 'dd/MM HH:mm')
      }
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {selectedContact ? (
        <>
          {/* Header */}
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedContact.avatar_url || ''} />
                  <AvatarFallback>
                    {selectedContact.full_name?.[0]?.toUpperCase() || selectedContact.email[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Indicador Online */}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  onlineUsers.has(selectedContact.id) 
                    ? 'bg-green-500' 
                    : 'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {selectedContact.full_name || selectedContact.email}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {onlineUsers.has(selectedContact.id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-4">
            <ScrollArea className="h-[calc(100vh-280px)]">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {(!messages || !Array.isArray(messages)) ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Carregando mensagens...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhuma mensagem nesta conversa</p>
                      <p className="text-sm mt-2">Seja o primeiro a dizer oi!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.sender_id === user?.id
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${
                                isOwn ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                <span>{formatMessageTime(message.created_at)}</span>
                                {isOwn && (
                                  <span>
                                    {message.is_read ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma mensagem..."
                value={newMessage}
                onChange={(e) => onNewMessageChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
                disabled={sendingMessage}
              />
              <Button 
                onClick={onSendMessage} 
                disabled={!newMessage.trim() || sendingMessage}
                size="icon"
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Selecione uma conversa</p>
            <p className="text-sm">Escolha um contato para começar a conversar</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente Principal Chat
const Chat: React.FC = () => {
  console.log('🚀 Chat Component Mounted')
  
  const { user, profile } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  // Buscar contatos (conversas)
  const fetchContacts = async () => {
    if (!user) return

    try {
      console.log('🔍 [CHAT] Buscando contatos para usuário:', user.id, 'role:', profile?.role)
      setLoading(true)

      let contactsData: Contact[] = []

      if (profile?.role === 'client') {
        // ALUNO: Buscar profissionais vinculados
        console.log('👨‍🏫 [CHAT] Buscando profissionais para o aluno...')
        
        const { data: clientProfessionals, error: clientError } = await supabase
          .from('client_professionals')
          .select(`*, professional:profiles!professional_id(*)`)
          .eq('client_id', user.id)
          .eq('status', 'active')

        if (clientError) {
          console.error('❌ [CHAT] Erro ao buscar profissionais do aluno:', clientError)
          return
        }

        console.log('✅ [CHAT] Profissionais encontrados:', clientProfessionals?.length || 0)
        console.log('📋 [CHAT] Dados brutos dos profissionais:', clientProfessionals)

        // Mapear para o formato Contact
        contactsData = (clientProfessionals || []).map((cp) => {
          const professional = cp.professional
          if (!professional) {
            console.log('⚠️ [CHAT] Profissional nulo encontrado:', cp)
            return null
          }
          
          return {
            id: professional.id,
            email: professional.email,
            full_name: professional.full_name,
            avatar_url: professional.avatar_url,
            role: professional.role,
            last_message: undefined,
            last_message_time: undefined,
            unread_count: 0
          }
        }).filter(Boolean) // Remover nulos

        console.log('✅ [CHAT] Contatos de profissionais processados:', contactsData.length)

      } else {
        // PROFISSIONAL: Lógica original
        console.log('👨‍💼 [CHAT] Buscando conversas para o profissional...')

        // Buscar perfis com quem o usuário já conversou
        const { data: conversations, error: conversationsError } = await supabase
          .from('chat_messages')
          .select('sender_id, receiver_id')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

        if (conversationsError) {
          console.error('❌ [CHAT] Erro ao buscar conversas:', conversationsError)
          return
        }

        // Extrair IDs únicos dos contatos
        const contactIds = new Set<string>()
        conversations?.forEach(msg => {
          if (msg.sender_id !== user.id) contactIds.add(msg.sender_id)
          if (msg.receiver_id !== user.id) contactIds.add(msg.receiver_id)
        })

        console.log('📋 [CHAT] IDs de contatos encontrados:', Array.from(contactIds))

        if (contactIds.size === 0) {
          console.log('📭 [CHAT] Nenhuma conversa encontrada')
          setContacts([])
          return
        }

        // Buscar detalhes dos contatos
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', Array.from(contactIds))

        if (profilesError) {
          console.error('❌ [CHAT] Erro ao buscar perfis:', profilesError)
          return
        }

        console.log('👥 [CHAT] Perfis encontrados:', profiles?.length || 0)

        // Para cada contato, buscar última mensagem e contar não lidas
        contactsData = await Promise.all(
          (profiles || []).map(async (contactProfile) => {
            // Buscar última mensagem
            const { data: lastMsg } = await supabase
              .from('chat_messages')
              .select('content, created_at')
              .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactProfile.id}),and(sender_id.eq.${contactProfile.id},receiver_id.eq.${user.id})`)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()

            // Contar mensagens não lidas
            const { data: unreadData } = await supabase
              .from('chat_messages')
              .select('id')
              .eq('sender_id', contactProfile.id)
              .eq('receiver_id', user.id)
              .eq('is_read', false)

            return {
              id: contactProfile.id,
              email: contactProfile.email,
              full_name: contactProfile.full_name,
              avatar_url: contactProfile.avatar_url,
              role: contactProfile.role,
              last_message: lastMsg?.content,
              last_message_time: lastMsg?.created_at,
              unread_count: unreadData?.length || 0
            }
          })
        )

        console.log('✅ [CHAT] Contatos processados:', contactsData.length)
      }

      console.log('📊 [CHAT] Dados finais dos contatos:', contactsData)
      setContacts(contactsData.sort((a, b) => 
        new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime()
      ))
    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado ao buscar contatos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar histórico de mensagens - USANDO RPC
  const fetchMessages = async (contactId: string) => {
    if (!user || !contactId) return

    try {
      console.log('🔍 [CHAT] Buscando mensagens com:', contactId, 'via RPC')
      setMessagesLoading(true)

      // Usando RPC get_conversation em vez da query complexa
      const { data, error } = await supabase.rpc('get_conversation', {
        user1_id: user.id,
        user2_id: contactId,
        limit_count: 50
      })

      if (error) {
        console.error('❌ [CHAT] Erro ao buscar mensagens via RPC:', error)
        setMessages([])
        return
      }

      console.log('✅ [CHAT] Mensagens carregadas via RPC:', data?.length || 0)
      console.log('📋 [CHAT] Dados das mensagens:', data)
      
      // Proteção de dados
      if (!data || !Array.isArray(data)) {
        console.log('⚠️ [CHAT] Dados inválidos recebidos:', data)
        setMessages([])
        return
      }

      setMessages(data)

      // Marcar mensagens como lidas
      await markMessagesAsRead(contactId)

    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado ao buscar mensagens:', error)
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  // Marcar mensagens como lidas
  const markMessagesAsRead = async (contactId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('sender_id', contactId)
        .eq('receiver_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('❌ [CHAT] Erro ao marcar mensagens como lidas:', error)
      } else {
        console.log('✅ [CHAT] Mensagens marcadas como lidas')
      }
    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado ao marcar mensagens como lidas:', error)
    }
  }

  // Enviar mensagem
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!user || !selectedContact || !newMessage.trim()) return

    try {
      setSendingMessage(true)
      console.log('📤 [CHAT] Enviando mensagem...')

      const messageData = {
        sender_id: user.id,
        receiver_id: selectedContact.id,
        content: newMessage.trim(),
        message_type: 'text',
        is_read: false
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData)

      if (error) {
        console.error('❌ [CHAT] Erro ao enviar mensagem:', error)
        showError('Erro ao enviar mensagem')
        return
      }

      console.log('✅ [CHAT] Mensagem enviada com sucesso')
      setNewMessage('')
      
      // Recarregar mensagens
      await fetchMessages(selectedContact.id)
      
      // Recarregar contatos para atualizar última mensagem
      await fetchContacts()
      
    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado ao enviar mensagem:', error)
      showError('Erro inesperado ao enviar mensagem')
    } finally {
      setSendingMessage(false)
    }
  }

  // Selecionar contato
  const handleSelectContact = (contact: Contact) => {
    console.log('👤 [CHAT] Selecionado contato:', contact.full_name || contact.email)
    setSelectedContact(contact)
    fetchMessages(contact.id)
  }

  // Efeito UNIFICADO para Realtime (Presence + Mensagens)
  useEffect(() => {
    if (!user) return

    console.log('🔄 [CHAT] Configurando canal unificado Realtime para usuário:', user.id)

    // Canal unificado para tudo
    const channel = supabase.channel('capifit_chat_global')
    
    // Configurar Presence
    channel
      .on('presence', { event: 'sync' }, (payload) => {
        console.log('🔄 [PRESENCE] Sync recebido:', payload)
        const newOnlineUsers = new Set(payload.presences?.map((p: any) => p.user_id) || [])
        setOnlineUsers(newOnlineUsers)
      })
      .on('presence', { event: 'join' }, (payload) => {
        console.log('👋 [PRESENCE] User joined:', payload)
        setOnlineUsers(prev => new Set([...prev, payload.new_presences?.[0]?.user_id]))
      })
      .on('presence', { event: 'leave' }, (payload) => {
        console.log('👋 [PRESENCE] User left:', payload)
        setOnlineUsers(prev => {
          const newSet = new Set(prev)
          payload.left_presences?.forEach((p: any) => newSet.delete(p.user_id))
          return newSet
        })
      })

    // Configurar Mensagens - SEM FILTRO, escuta todos os INSERTs
    channel
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages'
          // Removido o filtro para escutar todos os inserts
        },
        (payload) => {
          console.log('📨 [REALTIME] Nova mensagem recebida (sem filtro):', payload)
          
          const newMessage = payload.new as ChatMessage
          
          // FILTRAGEM NO CLIENTE - Verificar se a mensagem é para o usuário atual
          if (newMessage.receiver_id === user.id || newMessage.sender_id === user.id) {
            console.log('📬 [REALTIME] Mensagem relevante para mim recebida!')
            
            // Som de notificação (opcional)
            try {
              const audio = new Audio('/notification.mp3')
              audio.play().catch(() => {
                console.log('🔇 [REALTIME] Não foi possível tocar som de notificação')
              })
            } catch (error) {
              console.log('🔇 [REALTIME] Erro ao tocar som:', error)
            }
            
            // Atualizar lista de contatos
            setContacts(prevContacts => {
              const updatedContacts = prevContacts.map(contact => {
                if (contact.id === newMessage.sender_id || contact.id === newMessage.receiver_id) {
                  return {
                    ...contact,
                    last_message: newMessage.content,
                    last_message_time: newMessage.created_at,
                    unread_count: contact.id === selectedContact?.id ? 0 : (contact.unread_count || 0) + 1
                  }
                }
                return contact
              })
              
              // Mover o contato que enviou mensagem para o topo
              const senderContact = updatedContacts.find(c => c.id === newMessage.sender_id || c.id === newMessage.receiver_id)
              if (senderContact) {
                const otherContacts = updatedContacts.filter(c => c.id !== newMessage.sender_id && c.id !== newMessage.receiver_id)
                return [senderContact, ...otherContacts]
              }
              
              return updatedContacts
            })
            
            // Se a mensagem for do contato selecionado, adicionar ao chat
            if (selectedContact && (newMessage.sender_id === selectedContact.id || newMessage.receiver_id === selectedContact.id)) {
              console.log('💬 [REALTIME] Adicionando mensagem ao chat atual')
              setMessages(prev => [...prev, newMessage])
            }
          } else {
            console.log('🚫 [REALTIME] Mensagem não é para mim, ignorando')
          }
        }
      )

    // Inscrever no canal e enviar status online
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ [REALTIME] Inscrito no canal unificado')
        
        // Enviar status online
        const presenceStatus = await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString()
        })
        
        console.log('📡 [REALTIME] Status online enviado:', presenceStatus)
      }
    })

    return () => {
      console.log('🔌 [REALTIME] Limpando canal unificado')
      channel.unsubscribe()
    }
  }, [user, selectedContact])

  useEffect(() => {
    if (user) {
      fetchContacts()
    }
  }, [user])

  return (
    <div className="flex h-screen bg-gray-50">
      <ContactsList
        contacts={contacts}
        loading={loading}
        selectedContact={selectedContact}
        onSelectContact={handleSelectContact}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onlineUsers={onlineUsers}
      />
      <ChatArea
        selectedContact={selectedContact}
        messages={messages}
        messagesLoading={messagesLoading}
        newMessage={newMessage}
        sendingMessage={sendingMessage}
        onSendMessage={sendMessage}
        onNewMessageChange={setNewMessage}
        onlineUsers={onlineUsers}
      />
    </div>
  )
}

export default Chat