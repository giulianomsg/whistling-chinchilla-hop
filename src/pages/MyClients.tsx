import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'

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
  const { user, loading } = useAuth()
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
    if (!user) return

    try {
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
        console.error('Erro ao buscar clientes:', error)
        showError('Erro ao carregar clientes')
        return
      }

      // Cast seguro sabendo que o join foi feito
      setClients((data as any) || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao carregar clientes')
    } finally {
      setPageLoading(false)
    }
  }

  // Buscar cliente por email usando a função RPC
  const findClientByEmail = async (email: string) => {
    if (!user) return null

    try {
      const { data, error } = await supabase.rpc('find_client_by_email', {
        client_email: email
      })

      if (error) {
        console.error('Erro ao buscar cliente por email:', error)
        return null
      }

      return data?.[0] // Retorna o primeiro (e único) resultado ou undefined
    } catch (error) {
      console.error('Erro inesperado ao buscar cliente:', error)
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
      // 1. Buscar cliente pelo email
      const client = await findClientByEmail(newClientEmail.trim())

      if (!client) {
        showError('Cliente não encontrado. Verifique se o email está correto.')
        return
      }

      // 2. Verificar se já está vinculado
      if (client.existing_link_id && client.existing_link_status === 'active') {
        showError('Este cliente já está vinculado a você.')
        return
      }

      // 3. Criar vínculo E atualizar perfil via RPC
      const { error: linkError } = await supabase.rpc('link_client_and_update_profile', {
        p_client_id: client.id,
        p_notes: newClientNotes || null,
        p_full_name: newClientName || null,
        p_phone: newClientPhone || null
      })

      if (linkError) {
        throw linkError
      }

      showSuccess('Cliente adicionado com sucesso!')
      
      // Limpar formulário
      setNewClientEmail('')
      setNewClientName('')
      setNewClientPhone('')
      setNewClientNotes('')
      setIsAddDialogOpen(false)
      
      fetchClients()
      
    } catch (error: any) {
      console.error('Erro ao adicionar cliente:', error)
      const msg = error?.message || 'Erro inesperado ao adicionar cliente'
      
      if (msg.includes('já está vinculado')) {
        showError('Este cliente já está vinculado a este profissional.')
      } else {
        showError(msg)
      }
    } finally {
      setAddLoading(false)
    }
  }

  useEffect(() => {
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

  const handleViewClientDetails = (clientId: string) => {
    navigate(`/app/clients/${clientId}`)
  }

  const getInitials = (fullName: string | null, email: string) => {
    if (fullName && fullName.trim()) {
      return fullName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.[0]?.toUpperCase() || 'U'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Ativo'
        }
      case 'inactive':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
          icon: <XCircle className="h-3 w-3" />,
          text: 'Inativo'
        }
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
          icon: <Clock className="h-3 w-3" />,
          text: status
        }
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-300">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Meus Clientes
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Gerencie seus alunos e acompanhe o progresso de cada um.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white"
                />
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-primary dark:text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white dark:bg-card border-gray-200 dark:border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Adicionar Novo Cliente</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddClient} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-email" className="dark:text-gray-200">Email do Cliente *</Label>
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="cliente@exemplo.com"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        required
                        disabled={addLoading}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Digite o email do cliente que já está cadastrado no sistema
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-name" className="dark:text-gray-200">Nome Completo</Label>
                      <Input
                        id="client-name"
                        placeholder="João Silva"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        disabled={addLoading}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-phone" className="dark:text-gray-200">Telefone</Label>
                      <Input
                        id="client-phone"
                        placeholder="(00) 00000-0000"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        disabled={addLoading}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-notes" className="dark:text-gray-200">Notas</Label>
                      <Textarea
                        id="client-notes"
                        placeholder="Observações sobre este cliente..."
                        value={newClientNotes}
                        onChange={(e) => setNewClientNotes(e.target.value)}
                        rows={3}
                        disabled={addLoading}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        disabled={addLoading}
                        className="dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={addLoading} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-primary">
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
              <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
              <Badge variant="secondary" className="dark:bg-white/10 dark:text-white">{clients.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ativos:</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                {clients.filter(c => c.status === 'active').length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Lista de Clientes */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
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
                  className="hover:shadow-lg transition-shadow cursor-pointer bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm"
                  onClick={() => handleViewClientDetails(client.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white dark:border-white/10 shadow-sm">
                          <AvatarImage src={client.avatar_url || ''} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-200">
                            {getInitials(client.full_name, client.email)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {client.full_name || 'Cliente sem nome'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {client.email}
                          </p>
                        </div>
                      </div>
                      
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
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>Vínculo:</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(clientProfessional.started_at)}
                        </span>
                      </div>
                      
                      {client.phone && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Mail className="h-4 w-4" />
                            <span>Telefone:</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {client.phone}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <User className="h-4 w-4" />
                          <span>Tipo:</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {client.role === 'client' ? 'Aluno' : client.role}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 mt-3">
                      <Button 
                        className="w-full dark:bg-white/10 dark:text-white dark:hover:bg-white/20" 
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