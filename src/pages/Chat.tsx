import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Card, CardContent } from '../components/ui/card'
import { 
  MessageSquare, 
  Search, 
  ArrowLeft, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Loader2,
  User,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'
import { supabase } from '../integrations/supabase/client'
import { useIsMobile } from '../hooks/use-mobile'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: string
  created_at: string
}

interface ClientProfessional {
  id: string
  client_id: string
  professional_id: string
  status: string
  started_at: string
  ended_at: string | null
  notes: string | null
  client?: Profile
  professional?: Profile
}

interface UnreadCount {
  [userId: string]: number
}

const Chat: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const isMobile = useIsMobile()
  
  // Estados
  const [contacts, setContacts] = useState<ClientProfessional[]>([])
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [unreadCounts, setUnreadCounts] = useState<UnreadCount>({})

  // Buscar contatos baseado no role do usuário
  const fetchContacts = async () => {
    if (!user || !profile) return

    try {
      console.log('🔍 [CHAT] Buscando contatos para:', profile.role, user.id)
      setPageLoading(true)

      let query

      if (profile.role === 'professional') {
        // Profissional busca seus clientes
        query = supabase
          .from('client_professionals')
          .select(`
            *,
            client:profiles!client_id(id, email, full_name, avatar_url, phone, role, created_at)
          `)
          .eq('professional_id', user.id)
          .eq('status', 'active')
          .order('started_at', { ascending: false })
      } else if (profile.role === 'client') {
        // Cliente busca seus profissionais
        query = supabase
          .from('client_professionals')
          .select(`
            *,
            professional:profiles!professional_id(id, email, full_name, avatar_url, phone, role, created_at)
          `)
          .eq('client_id', user.id)
          .eq('status', 'active')
          .order('started_at', { ascending: false })
      } else {
        console.log('❌ [CHAT] Role não suportado para chat:', profile.role)
        setContacts([])
        setPageLoading(false)
        return
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ [CHAT] Erro ao buscar contatos:', error)
        setContacts([])
        return
      }

      console.log('✅ [CHAT] Contatos carregados:', data?.length || 0)
      setContacts(data || [])

      // Buscar contagens de mensagens não lidas
      await fetchUnreadCounts(data || [])

    } catch (error) {
      console.error('❌ [CHAT] Erro inesperado:', error)
      setContacts([])
    } finally {
      setPageLoading(false)
    }
  }

  // Buscar contagem de mensagens não lidas para cada contato
  const fetchUnreadCounts = async (contactsList: ClientProfessional[]) => {
    if (!user) return

    try {
      const counts: UnreadCount = {}

      for (const contact of contactsList) {
        const contactId = profile?.role === 'professional' 
          ? contact.client_id 
          : contact.professional_id

        if (contactId) {
          const { data, error } = await supabase
            .rpc('count_unread_messages', {
              user_id: contactId
            })

          if (!error && data !== null) {
            counts[contactId] = data
          }
        }
      }

      setUnreadCounts(counts)
      console.log('✅ [CHAT] Contagens não lidas:', counts)

    } catch (error) {
      console.error('❌ [CHAT] Erro ao buscar contagens não lidas:', error)
    }
  }

  // Filtrar contatos pelo termo de busca
  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm.trim()) return true

    const searchLower = searchTerm.toLowerCase()
    const contactProfile = profile?.role === 'professional' ? contact.client : contact.professional
    
    if (!contactProfile) return false

    const fullName = contactProfile.full_name?.toLowerCase() || ''
    const email = contactProfile.email?.toLowerCase() || ''

    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  // Obter informações do contato selecionado
  const getContactInfo = (contact: ClientProfessional): Profile | null => {
    return profile?.role === 'professional' ? contact.client : contact.professional
  }

  // Obter ID do contato para contagem de não lidas
  const getContactId = (contact: ClientProfessional): string | null => {
    return profile?.role === 'professional' ? contact.client_id : contact.professional_id
  }

  // Obter iniciais para avatar
  const getInitials = (fullName: string | null, email: string): string => {
    if (fullName && fullName.trim()) {
      return fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email?.[0]?.toUpperCase() || 'U'
  }

  // Formatar data para display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Agora há pouco'
    } else if (diffInHours < 24) {
      return `Há ${Math.floor(diffInHours)}h`
    } else if (diffInHours < 48) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }

  // Selecionar usuário para conversa
  const handleSelectUser = (contact: ClientProfessional) => {
    const contactInfo = getContactInfo(contact)
    if (contactInfo) {
      setSelectedUser(contactInfo)
      console.log('🔗 [CHAT] Usuário selecionado:', contactInfo.full_name)
    }
  }

  // Voltar para lista de contatos (mobile)
  const handleBackToList = () => {
    setSelectedUser(null)
  }

  useEffect(() => {
    if (!loading && user && profile) {
      fetchContacts()
    }
  }, [user?.id, profile?.role, loading])

  // Se estiver carregando, mostrar loader
  if (loading || pageLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  // Se não houver contatos, mostrar estado vazio
  if (contacts.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhuma conversa encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            {profile?.role === 'professional' 
              ? 'Você ainda não tem clientes vinculados. Adicione seus primeiros clientes para começar a conversar.'
              : 'Você ainda não está vinculado a nenhum profissional. Entre em contato para começar.'
            }
          </p>
          <Button onClick={() => navigate(profile?.role === 'professional' ? '/app/clients' : '/app/dashboard')}>
            {profile?.role === 'professional' ? 'Gerenciar Clientes' : 'Voltar ao Dashboard'}
          </Button>
        </div>
      </div>
    )
  }

  // Renderizar lista de contatos (sidebar)
  const ContactsList = () => (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header da lista */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {profile?.role === 'professional' ? 'Meusos Clientes' : 'Meusos Profissionais'}
        </h2>
        
        {/* Campo de busca */}
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

      {/* Lista de contatos */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa disponível'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredContacts.map((contact) => {
              const contactInfo = getContactInfo(contact)
              const contactId = getContactId(contact)
              const unreadCount = contactId ? unreadCounts[contactId] : 0
              const isSelected = selectedUser?.id === contactInfo?.id

              if (!contactInfo) return null

              return (
                <div
                  key={contact.id}
                  onClick={() => handleSelectUser(contact)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={contactInfo.avatar_url || ''} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(contactInfo.full_name, contactInfo.email)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Indicador de online (placeholder) */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {contactInfo.full_name || 'Usuário sem nome'}
                        </h3>
                        
                        {/* Badge de não lidas */}
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500 truncate">
                        {contactInfo.email}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatDate(contact.started_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  // Renderizar área do chat
  const ChatArea = () => {
    if (!selectedUser) {
      // Estado vazio - landing page
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo ao Chat
            </h2>
            <p className="text-gray-600 max-w-md">
              Selecione uma conversa da lista à esquerda para começar a conversar com seus {profile?.role === 'professional' ? 'clientes' : 'profissionais'}.
            </p>
          </div>
        </div>
      )
    }

    // Chat com usuário selecionado
    return (
      <div className="flex-1 flex flex-col bg-white">
        {/* Header do chat */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botão voltar (mobile) */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {/* Avatar e nome */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(selectedUser.full_name, selectedUser.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedUser.full_name || 'Usuário sem nome'}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedUser.role === 'professional' ? 'Profissional' : 'Cliente'}
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Área de mensagens (placeholder) */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Send className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Conversa com {selectedUser.full_name || 'este usuário'}
            </h3>
            <p className="text-gray-600 max-w-md">
              O sistema de mensagens está sendo implementado. Em breve você poderá enviar e receber mensagens em tempo real.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> Interface criada ✅ | Envio de mensagens 🔄 Em desenvolvimento
              </p>
            </div>
          </div>
        </div>

        {/* Input de mensagem (placeholder) */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled
            />
            <Button disabled>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Layout principal
  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-100">
      {/* Mobile: mostrar apenas lista ou chat */}
      {isMobile ? (
        selectedUser ? <ChatArea /> : <ContactsList />
      ) : (
        <>
          {/* Desktop: sidebar + área do chat */}
          <ContactsList />
          <ChatArea />
        </>
      )}
    </div>
  )
}

export default Chat