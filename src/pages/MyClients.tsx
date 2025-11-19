import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Calendar, 
  Clock,
  Loader2,
  User,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter
} from 'lucide-react'
import { supabase } from '../integrations/supabase/client'
import { showSuccess, showError } from '../utils/toast'
import { format, subDays } from 'date-fns'

interface ClientProfile {
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
  client: ClientProfile
}

const MyClients: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [clients, setClients] = useState<ClientProfessional[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para o diálogo de adicionar cliente
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientNotes, setNewClientNotes] = useState('')

  // Buscar clientes vinculados ao profissional
  const fetchClients = async () => {
    if (!user) {
      console.log('❌ [MY_CLIENTS] Usuário null, não buscando clientes')
      return
    }

    try {
      console.log('🔍 [MY_CLIENTS] Buscando clientes do profissional:', user.id)
      setPageLoading(true)
      
      const { data, error } = await supabase
        .from('client_professionals')
        .select(`
          *,
          client:profiles!client_id(id, email, full_name, avatar_url, phone, role, created_at)
        `)
        .eq('professional_id', user.id)
        .order('started_at', { ascending: false })

      if (error) {
        console.error('❌ [MY_CLIENTS] Erro ao buscar clientes:', error)
        showError('Erro ao carregar clientes')
        return
      }

      console.log('✅ [MY_CLIENTS] Clientes carregados:', data?.length || 0)
      setClients(data || [])
    } catch (error) {
      console.error('❌ [MY_CLIENTS] Erro inesperado:', error)
      showError('Erro inesperado ao carregar clientes')
    } finally {
      setPageLoading(false)
    }
  }

  // Buscar cliente por email usando a função RPC
  const findClientByEmail = async (email: string) => {
    if (!user) return null

    try {
      console.log('🔍 [MY_CLIENTS] Buscando cliente por email:', email)
      
      const { data, error } = await supabase.rpc('find_client_by_email', {
        client_email: email
      })

      if (error) {
        console.error('❌ [MY_CLIENTS] Erro ao buscar cliente por email:', error)
        return null
      }

      console.log('✅ [MY_CLIENTS] Cliente encontrado:', data)
      return data
    } catch (error) {
      console.error('❌ [MY_CLIENTS] Erro inesperado ao buscar cliente:', error)
      return null
    }
  }

  // Adicionar novo cliente
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !newClientEmail.trim()) {
      showError('Por favor, informe o email do cliente')
      return
    }

    setAddLoading(true)

    try {
      console.log('🚀 [MY_CLIENTS] Adicionando cliente:', newClientEmail)

      // 1. Buscar cliente pelo email
      const clientData = await findClientByEmail(newClientEmail.trim())

      if (!clientData || clientData.length === 0) {
        showError('Cliente não encontrado. Verifique se o email está correto.')
        return
      }

      const client = clientData[0]

      // 2. Verificar se já está vinculado
      if (client.existing_link_id && client.existing_link_status === 'active') {
        showError('Este cliente já está vinculado a você.')
        return
      }

      // 3. Criar vínculo
      const { error: linkError } = await supabase
        .from('client_professionals')
        .insert({
          client_id: client.id,
          professional_id: user.id,
          status: 'active',
          notes: newClientNotes || null
        })

      if (linkError) {
        console.error('❌ [MY_CLIENTS] Erro ao criar vínculo:', linkError)
        showError('Erro ao vincular cliente')
        return
      }

      showSuccess('Cliente adicionado com sucesso!')
      
      // 4. Limpar formulário e fechar diálogo
      setNewClientEmail('')
      setNewClientName('')
      setNewClientPhone('')
      setNewClientNotes('')
      setIsAddDialogOpen(false)
      
      // 5. Recarregar lista
      fetchClients()
      
    } catch (error) {
      console.error('❌ [MY_CLIENTS] Erro inesperado ao adicionar cliente:', error)
      showError('Erro inesperado ao adicionar cliente')
    } finally {
      setAddLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔍 [MY_CLIENTS] useEffect chamado', { 
      user: !!user, 
      profile: !!profile,
      userId: user?.id,
      loading: !loading
    })
    
    if (!loading && user) {
      fetchClients()
    }
  }, [user?.id, loading])

  // Filtrar clientes pelo nome
  const filteredClients = clients.filter(client => {
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    const fullName = client.client?.full_name?.toLowerCase() || ''
    const email = client.client?.email?.toLowerCase() || ''
    
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  // Navegar para detalhes do cliente
  const handleViewClientDetails = (clientId: string) => {
    console.log('🔗 [MY_CLIENTS] Navegando para detalhes do cliente:', clientId)
    navigate(`/app/clients/${clientId}`)
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

  // Formatar data para display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Obter status visual
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Ativo'
        }
      case 'inactive':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <XCircle className="h-3 w-3" />,
          text: 'Inativo'
        }
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="h-3 w-3" />,
          text: status
        }
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Meus Clientes
              </h1>
              <p className="mt-2 text-gray-600">
                Gerencie seus alunos e acompanhe o progresso de cada um.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Campo de Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Botão Novo Cliente - AGORA FUNCIONAL */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddClient} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email do Cliente *</Label>
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="cliente@exemplo.com"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        required
                        disabled={addLoading}
                      />
                      <p className="text-xs text-gray-500">
                        Digite o email do cliente que já está cadastrado no sistema
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-name">Nome (opcional)</Label>
                      <Input
                        id="client-name"
                        placeholder="Nome do cliente"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        disabled={addLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Telefone (opcional)</Label>
                      <Input
                        id="client-phone"
                        placeholder="(00) 00000-0000"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        disabled={addLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-notes">Notas (opcional)</Label>
                      <Textarea
                        id="client-notes"
                        placeholder="Observações sobre este cliente..."
                        value={newClientNotes}
                        onChange={(e) => setNewClientNotes(e.target.value)}
                        rows={3}
                        disabled={addLoading}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        disabled={addLoading}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={addLoading}>
                        {addLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adicionando...
                          </>
                        ) : (
                          'Adicionar Cliente'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Total:
              </span>
              <Badge variant="secondary" className="text-sm">
                {clients.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Ativos:
              </span>
              <Badge variant="default" className="text-sm bg-green-100 text-green-800">
                {clients.filter(c => c.status === 'active').length}
              </Badge>
            </div>
            {searchTerm && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Filtrados:
                </span>
                <Badge variant="outline" className="text-sm">
                  {filteredClients.length}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Clientes */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {searchTerm 
                ? 'Tente ajustar sua busca ou adicione novos clientes.'
                : 'Comece adicionando seu primeiro cliente para gerenciar os treinos e planos alimentares.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Cliente
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((clientProfessional) => {
              const statusInfo = getStatusInfo(clientProfessional.status)
              const client = clientProfessional.client
              
              return (
                <Card 
                  key={clientProfessional.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewClientDetails(client.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Avatar do Cliente */}
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={client.avatar_url || ''} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(client.full_name, client.email)}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Informações Básicas */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {client.full_name || 'Cliente sem nome'}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {client.email}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <Badge
                        variant={statusInfo.variant}
                        className={`text-xs ${statusInfo.className}`}
                      >
                        <span className="flex items-center gap-1">
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Informações Adicionais */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Vínculo:</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatDate(clientProfessional.started_at)}
                        </span>
                      </div>
                      
                      {client.phone && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>Telefone:</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {client.phone}
                          </span>
                        </div>
                      )}
                      
                      {/* Role */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>Tipo:</span>
                        </div>
                        <span className="font-medium text-gray-900 capitalize">
                          {client.role === 'client' ? 'Aluno' : client.role}
                        </span>
                      </div>
                    </div>
                    
                    {/* Botão de Ação */}
                    <div className="pt-3 border-t">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewClientDetails(client.id)
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyClients