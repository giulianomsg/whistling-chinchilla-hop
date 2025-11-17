import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Users, 
  Plus, 
  Mail, 
  Calendar, 
  Dumbbell, 
  User, 
  Clock,
  Loader2,
  UserPlus,
  Link2,
  CheckCircle
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'

interface ClientProfile {
  id: string
  email: string
  full_name: string | null
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

interface Workout {
  id: string
  name: string
  description: string | null
  objective: string | null
  duration_weeks: number
  days_per_week: number | null
  professional_id: string
  is_template: boolean
  created_at: string
}

const MyClients: React.FC = () => {
  const { user, profile, loading } = useAuth()
  const [clients, setClients] = useState<ClientProfessional[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  // Dialog states
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false)
  const [isAssignWorkoutDialogOpen, setIsAssignWorkoutDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientProfessional | null>(null)

  // Form states
  const [addClientEmail, setAddClientEmail] = useState('')
  const [assignWorkoutData, setAssignWorkoutData] = useState({
    workout_id: '',
    start_date: '',
    notes: ''
  })

  // Buscar clientes vinculados
  const fetchClients = async () => {
    if (!user) return

    try {
      setPageLoading(true)
      const { data, error } = await supabase
        .from('client_professionals')
        .select(`
          *,
          client:profiles!client_id(*)
        `)
        .eq('professional_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        showError('Erro ao carregar clientes')
        return
      }

      setClients(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao carregar clientes')
    } finally {
      setPageLoading(false)
    }
  }

  // Buscar workouts do profissional
  const fetchWorkouts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar workouts:', error)
        return
      }

      setWorkouts(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  useEffect(() => {
    // Só executa se o auth NÃO estiver carregando E o user existir
    if (!loading && user) {
      fetchClients()
      fetchWorkouts()
    }
  }, [user, loading]) // <-- Muda as dependências

  // Adicionar cliente
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !addClientEmail.trim()) return

    try {
      // Primeiro, encontrar o usuário cliente
      const { data: clientData, error: clientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', addClientEmail.trim())
        .eq('role', 'client')
        .single()

      if (clientError || !clientData) {
        showError('Cliente não encontrado. Verifique o email e se o usuário tem role "client".')
        return
      }

      // Verificar se já existe vínculo ativo
      const { data: existingLink, error: linkError } = await supabase
        .from('client_professionals')
        .select('*')
        .eq('client_id', clientData.id)
        .eq('professional_id', user.id)
        .eq('status', 'active')
        .single()

      if (existingLink) {
        showError('Este cliente já está vinculado a você.')
        return
      }

      // Criar o vínculo
      const { error: insertError } = await supabase
        .from('client_professionals')
        .insert({
          client_id: clientData.id,
          professional_id: user.id,
          status: 'active'
        })

      if (insertError) {
        console.error('Erro ao criar vínculo:', insertError)
        showError('Erro ao vincular cliente')
        return
      }

      showSuccess('Cliente adicionado com sucesso!')
      setIsAddClientDialogOpen(false)
      setAddClientEmail('')
      fetchClients()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao adicionar cliente')
    }
  }

  // Atribuir plano ao cliente
  const handleAssignWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedClient || !assignWorkoutData.workout_id || !assignWorkoutData.start_date) return

    try {
      const workoutAssignment = {
        client_id: selectedClient.client_id,
        workout_id: assignWorkoutData.workout_id,
        professional_id: user.id,
        start_date: assignWorkoutData.start_date,
        status: 'active',
        notes: assignWorkoutData.notes || null
      }

      const { error } = await supabase
        .from('client_workouts')
        .insert(workoutAssignment)

      if (error) {
        console.error('Erro ao atribuir plano:', error)
        showError('Erro ao atribuir plano ao cliente')
        return
      }

      showSuccess('Plano atribuído com sucesso!')
      setIsAssignWorkoutDialogOpen(false)
      setSelectedClient(null)
      setAssignWorkoutData({
        workout_id: '',
        start_date: '',
        notes: ''
      })
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao atribuir plano')
    }
  }

  // Remover vínculo com cliente
  const handleRemoveClient = async (clientProfessionalId: string) => {
    try {
      const { error } = await supabase
        .from('client_professionals')
        .update({ status: 'inactive', ended_at: new Date().toISOString() })
        .eq('id', clientProfessionalId)

      if (error) {
        console.error('Erro ao remover cliente:', error)
        showError('Erro ao remover cliente')
        return
      }

      showSuccess('Cliente removido com sucesso!')
      fetchClients()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao remover cliente')
    }
  }

  // Abrir dialog de atribuir plano
  const handleOpenAssignWorkoutDialog = (client: ClientProfessional) => {
    setSelectedClient(client)
    setAssignWorkoutData({
      workout_id: '',
      start_date: '',
      notes: ''
    })
    setIsAssignWorkoutDialogOpen(true)
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
                Gerencie seus clientes e atribua planos de treino personalizados
              </p>
            </div>
            
            <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email do Cliente *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="cliente@exemplo.com"
                        value={addClientEmail}
                        onChange={(e) => setAddClientEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      O cliente já deve ter uma conta com role "client" no sistema.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddClientDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={!addClientEmail.trim()}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Vincular Cliente
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de Clientes */}
        {pageLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((clientProfessional) => (
              <Card key={clientProfessional.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      {clientProfessional.client.full_name || 'Sem nome'}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Ativo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{clientProfessional.client.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Vinculado em {new Date(clientProfessional.started_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {clientProfessional.notes && (
                      <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <strong>Notas:</strong> {clientProfessional.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleOpenAssignWorkoutDialog(clientProfessional)}
                    >
                      <Dumbbell className="mr-2 h-4 w-4" />
                      Atribuir Plano
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full" variant="ghost" size="sm">
                          Remover Vínculo
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o vínculo com "{clientProfessional.client.full_name || clientProfessional.client.email}"? 
                            O cliente perderá acesso aos seus planos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveClient(clientProfessional.id)}>
                            Remover Vínculo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {clients.length === 0 && !pageLoading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
            <p className="text-gray-600 mb-4">Comece adicionando seu primeiro cliente para gerenciar seus planos de treino.</p>
            <Button onClick={() => setIsAddClientDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Cliente
            </Button>
          </div>
        )}

        {/* Dialog de Atribuir Plano */}
        <Dialog open={isAssignWorkoutDialogOpen} onOpenChange={setIsAssignWorkoutDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Atribuir Plano de Treino</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignWorkout} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedClient?.client.full_name || selectedClient?.client.email}</p>
                  <p className="text-sm text-gray-600">{selectedClient?.client.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workout-select">Plano de Treino *</Label>
                <Select 
                  value={assignWorkoutData.workout_id} 
                  onValueChange={(value) => setAssignWorkoutData({ ...assignWorkoutData, workout_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano de treino" />
                  </SelectTrigger>
                  <SelectContent>
                    {workouts.map((workout) => (
                      <SelectItem key={workout.id} value={workout.id}>
                        <div>
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-sm text-gray-500">
                            {workout.duration_weeks} semanas • {workout.days_per_week}x por semana
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {workouts.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Você ainda não criou nenhum plano. 
                    <a href="/app/planner" className="text-blue-600 hover:underline ml-1">
                      Criar plano agora
                    </a>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Data de Início *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={assignWorkoutData.start_date}
                  onChange={(e) => setAssignWorkoutData({ ...assignWorkoutData, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-notes">Notas (opcional)</Label>
                <textarea
                  id="assignment-notes"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Instruções especiais para este cliente..."
                  value={assignWorkoutData.notes}
                  onChange={(e) => setAssignWorkoutData({ ...assignWorkoutData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAssignWorkoutDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!assignWorkoutData.workout_id || !assignWorkoutData.start_date}>
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Atribuir Plano
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default MyClients