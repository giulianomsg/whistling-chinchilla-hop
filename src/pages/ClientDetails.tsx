import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { DatePickerWithRange } from '../components/ui/date-picker'
import { 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  ArrowLeft,
  Dumbbell,
  Utensils,
  Timer,
  Loader2,
  AlertCircle,
  CheckCircle,
  Target,
  Clock,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CalendarDays,
  Bell,
  XCircle,
  ArrowRight
} from 'lucide-react'
import { supabase } from '../integrations/supabase/client'
import { showSuccess, showError } from '../utils/toast'
import ClientWorkoutHistory from '../components/professional/ClientWorkoutHistory'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

interface ClientProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: string
  created_at: string
}

interface ClientDetails {
  goals: string | null
  anamnesis_data: any
  emergency_contact: any
  health_restrictions: string | null
}

interface ClientWorkout {
  id: string
  client_id: string
  workout_id: string
  professional_id: string
  start_date: string
  end_date: string | null
  status: string
  notes: string | null
  workout: {
    id: string
    name: string
    description: string | null
    objective: string | null
    duration_weeks: number
    days_per_week: number | null
  }
}

interface ClientMealPlan {
  id: string
  client_id: string
  meal_plan_id: string
  nutritionist_id: string
  start_date: string
  end_date: string | null
  status: string
  notes: string | null
  meal_plan: {
    id: string
    name: string
    description: string | null
    objective: string | null
    daily_calories_target: number | null
    daily_protein_target: number | null
    daily_carbs_target: number | null
    daily_fat_target: number | null
  }
}

interface WorkoutSession {
  id: string
  client_id: string
  professional_id: string
  workout_id: string
  client_workout_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  status: 'started' | 'paused' | 'completed' | 'abandoned'
  created_at: string
  updated_at: string
  workout?: {
    id: string
    name: string
    objective: string | null
  }
}

interface ProgressData {
  date: string
  completed: number
  abandoned: number
  totalDuration: number
}

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null)
  const [clientWorkouts, setClientWorkouts] = useState<ClientWorkout[]>([])
  const [clientMealPlans, setClientMealPlans] = useState<ClientMealPlan[]>([])
  
  // Estados para filtros e gráficos
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<WorkoutSession[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'abandoned'>('all')
  const [workoutFilter, setWorkoutFilter] = useState<string>('all')
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [comparisonMode, setComparisonMode] = useState(false)
  const [comparisonPeriod, setComparisonPeriod] = useState<'7days' | '30days' | '90days'>('30days')

  // Verificar se o profissional tem acesso a este cliente
  const checkClientAccess = async () => {
    if (!id || !user) return false

    try {
      const { data, error } = await supabase
        .from('client_professionals')
        .select('*')
        .eq('client_id', id)
        .eq('professional_id', user.id)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        console.error('Erro ao verificar acesso:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro inesperado:', error)
      return false
    }
  }

  // Buscar perfil do cliente
  const fetchClientProfile = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        return
      }

      setClientProfile(data)
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar detalhes do cliente
  const fetchClientDetails = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('client_details')
        .select('*')
        .eq('profile_id', id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar detalhes:', error)
        return
      }

      setClientDetails(data)
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar treinos do cliente
  const fetchClientWorkouts = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('client_workouts')
        .select(`
          *,
          workout:workouts(id, name, description, objective, duration_weeks, days_per_week)
        `)
        .eq('client_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar treinos:', error)
        return
      }

      setClientWorkouts(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar planos alimentares do cliente
  const fetchClientMealPlans = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('client_meal_plans')
        .select(`
          *,
          meal_plan:meal_plans(id, name, description, objective, daily_calories_target, daily_protein_target, daily_carbs_target, daily_fat_target)
        `)
        .eq('client_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar planos alimentares:', error)
        return
      }

      setClientMealPlans(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar sessões de treino
  const fetchWorkoutSessions = async () => {
    if (!id) return

    try {
      console.log('🔍 [CLIENT_DETAILS] Buscando sessões recentes...')

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout:workouts(name, objective)
        `)
        .eq('client_id', id)
        .in('status', ['completed', 'abandoned'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [CLIENT_DETAILS] Erro ao buscar sessões:', error)
        return
      }

      console.log('✅ [CLIENT_DETAILS] Sessões recentes carregadas:', data?.length || 0, 'sessões')
      setSessions(data || [])
      setFilteredSessions(data || [])
    } catch (error) {
      console.error('❌ [CLIENT_DETAILS] Erro inesperado:', error)
    }
  }

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...sessions]

    // Filtro de data
    filtered = filtered.filter(session => {
      const sessionDate = new Date(session.created_at)
      return sessionDate >= dateRange.from && sessionDate <= dateRange.to
    })

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter)
    }

    // Filtro de workout
    if (workoutFilter !== 'all') {
      filtered = filtered.filter(session => session.workout_id === workoutFilter)
    }

    setFilteredSessions(filtered)
  }

  // Gerar dados para gráficos
  const generateProgressData = () => {
    const data: ProgressData[] = []
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i <= days; i++) {
      const currentDate = new Date(dateRange.from)
      currentDate.setDate(currentDate.getDate() + i)
      
      const dayStart = startOfDay(currentDate)
      const dayEnd = endOfDay(currentDate)
      
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.created_at)
        return sessionDate >= dayStart && sessionDate <= dayEnd
      })
      
      const completed = daySessions.filter(s => s.status === 'completed').length
      const abandoned = daySessions.filter(s => s.status === 'abandoned').length
      const totalDuration = daySessions
        .filter(s => s.status === 'completed' && s.duration_seconds)
        .reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
      
      data.push({
        date: format(currentDate, 'dd/MM'),
        completed,
        abandoned,
        totalDuration
      })
    }
    
    setProgressData(data)
  }

  // Exportar dados
  const exportData = () => {
    const csvContent = [
      ['Data', 'Treino', 'Status', 'Duração (min)', 'Objetivo'],
      ...filteredSessions.map(session => [
        format(new Date(session.created_at), 'dd/MM/yyyy HH:mm'),
        session.workout?.name || 'Sem nome',
        session.status === 'completed' ? 'Concluído' : 'Abandonado',
        session.duration_seconds ? Math.round(session.duration_seconds / 60) : 'N/A',
        session.workout?.objective || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico_treinos_${clientProfile?.full_name || 'cliente'}_${format(new Date(), 'dd-MM-yyyy')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    showSuccess('Dados exportados com sucesso!')
  }

  // Enviar notificação para profissional
  const sendNotification = async (type: 'new_workout' | 'completed_workout' | 'abandoned_workout') => {
    if (!user || !clientProfile) return

    try {
      const notificationData = {
        professional_id: user.id,
        client_id: id,
        type,
        message: `Notificação sobre ${clientProfile.full_name}: ${type}`,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('professional_notifications')
        .insert(notificationData)

      if (error) {
        console.error('Erro ao enviar notificação:', error)
        showError('Erro ao enviar notificação')
        return
      }

      showSuccess('Notificação enviada com sucesso!')
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao enviar notificação')
    }
  }

  useEffect(() => {
    const initializePage = async () => {
      if (!id) return

      setLoading(true)
      
      // Verificar acesso
      const hasAccess = await checkClientAccess()
      if (!hasAccess) {
        showError('Você não tem permissão para acessar este cliente')
        navigate('/app/clients')
        return
      }

      // Buscar dados
      await Promise.all([
        fetchClientProfile(),
        fetchClientDetails(),
        fetchClientWorkouts(),
        fetchClientMealPlans(),
        fetchWorkoutSessions()
      ])

      setLoading(false)
    }

    initializePage()
  }, [id, user])

  useEffect(() => {
    applyFilters()
    generateProgressData()
  }, [sessions, dateRange, statusFilter, workoutFilter])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando detalhes do cliente...</p>
        </div>
      </div>
    )
  }

  if (!clientProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cliente não encontrado</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">O cliente que você está procurando não existe ou não está disponível.</p>
          <Button onClick={() => navigate('/app/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Clientes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/app/clients')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Detalhes do Cliente
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => sendNotification('completed_workout')}
              >
                <Bell className="h-4 w-4 mr-2" />
                Enviar Notificação
              </Button>
              <Button
                onClick={() => setComparisonMode(!comparisonMode)}
                variant={comparisonMode ? "default" : "outline"}
              >
                Comparar Períodos
              </Button>
            </div>
          </div>

          {/* Card de Informações Básicas */}
          <Card className="bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Nome</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {clientProfile.full_name || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{clientProfile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Telefone</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {clientProfile.phone || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Cliente desde</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(clientProfile.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Informações Detalhadas */}
        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Treinos Atuais
            </TabsTrigger>
            <TabsTrigger value="meal-plans" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Planos Alimentares
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progresso
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados Pessoais
            </TabsTrigger>
          </TabsList>

          {/* Treinos Atuais */}
          <TabsContent value="workouts">
            <Card className="bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-blue-600" />
                  Treinos Atribuídos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientWorkouts.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum treino atribuído</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Este cliente ainda não possui treinos atribuídos.
                    </p>
                    <Button onClick={() => navigate('/app/planner')}>
                      Atribuir Treino
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientWorkouts.map((clientWorkout) => (
                      <div key={clientWorkout.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {clientWorkout.workout.name}
                            </h3>
                            {clientWorkout.workout.description && (
                              <p className="text-gray-600 dark:text-gray-300 mb-3">
                                {clientWorkout.workout.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Início: {new Date(clientWorkout.start_date).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{clientWorkout.workout.duration_weeks} semanas</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>{clientWorkout.workout.days_per_week}x por semana</span>
                              </div>
                            </div>
                            {clientWorkout.workout.objective && (
                              <div className="mt-2">
                                <Badge variant="secondary">
                                  {clientWorkout.workout.objective}
                                </Badge>
                              </div>
                            )}
                            {clientWorkout.notes && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-800">
                                  <strong>Nota:</strong> {clientWorkout.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <Badge 
                              variant={clientWorkout.status === 'active' ? 'default' : 'secondary'}
                            >
                              {clientWorkout.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Planos Alimentares */}
          <TabsContent value="meal-plans">
            <Card className="bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-green-600" />
                  Planos Alimentares
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientMealPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum plano alimentar atribuído</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Este cliente ainda não possui planos alimentares atribuídos.
                    </p>
                    <Button onClick={() => navigate('/app/meal-planner')}>
                      Atribuir Plano Alimentar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientMealPlans.map((clientMealPlan) => (
                      <div key={clientMealPlan.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {clientMealPlan.meal_plan.name}
                            </h3>
                            {clientMealPlan.meal_plan.description && (
                              <p className="text-gray-600 dark:text-gray-300 mb-3">
                                {clientMealPlan.meal_plan.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Início: {new Date(clientMealPlan.start_date).toLocaleDateString('pt-BR')}</span>
                              </div>
                              {clientMealPlan.meal_plan.daily_calories_target && (
                                <div className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  <span>{clientMealPlan.meal_plan.daily_calories_target} cal/dia</span>
                                </div>
                              )}
                            </div>
                            {clientMealPlan.meal_plan.objective && (
                              <div className="mt-2">
                                <Badge variant="secondary">
                                  {clientMealPlan.meal_plan.objective}
                                </Badge>
                              </div>
                            )}
                            {clientMealPlan.notes && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-800">
                                  <strong>Nota:</strong> {clientMealPlan.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <Badge 
                              variant={clientMealPlan.status === 'active' ? 'default' : 'secondary'}
                            >
                              {clientMealPlan.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico de Execução */}
          <TabsContent value="history">
            <div className="space-y-6">
              {/* Filtros */}
              <Card className="bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-purple-600" />
                    Filtros do Histórico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Período</Label>
                      <DatePickerWithRange
                        value={dateRange}
                        onChange={setDateRange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="completed">Concluídos</SelectItem>
                          <SelectItem value="abandoned">Abandonados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Treino</Label>
                      <Select value={workoutFilter} onValueChange={setWorkoutFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os treinos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {clientWorkouts.map((workout) => (
                            <SelectItem key={workout.workout.id} value={workout.workout.id}>
                              {workout.workout.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ações</Label>
                      <div className="flex gap-2">
                        <Button onClick={exportData} variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Componente de Histórico com Filtros */}
              <ClientWorkoutHistory clientId={id} />
            </div>
          </TabsContent>

          {/* Gráficos de Progresso */}
          <TabsContent value="progress">
            <div className="space-y-6">
              {/* Comparação de Períodos */}
              {comparisonMode && (
                <Card className="bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Comparação de Períodos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Período de Comparação</Label>
                        <Select value={comparisonPeriod} onValueChange={(value: any) => setComparisonPeriod(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7days">Últimos 7 dias</SelectItem>
                            <SelectItem value="30days">Últimos 30 dias</SelectItem>
                            <SelectItem value="90days">Últimos 90 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Período Base</Label>
                        <Select defaultValue="current">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Período Atual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Métricas</Label>
                        <div className="flex gap-2">
                          <Badge variant="outline">Sessões</Badge>
                          <Badge variant="outline">Duração</Badge>
                          <Badge variant="outline">Taxa Conclusão</Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Gráfico de Comparação */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Sessões Concluídas</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-2xl font-bold text-green-600">12</span>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-xs text-gray-500">+20% vs período anterior</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Tempo Médio</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-2xl font-bold text-blue-600">45min</span>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-xs text-gray-500">+5min vs período anterior</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Taxa Conclusão</p>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-2xl font-bold text-purple-600">85%</span>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          </div>
                          <p className="text-xs text-gray-500">-5% vs período anterior</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gráfico de Progresso Visual */}
              <Card className="bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Progresso Visual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Gráfico de Barras Simples */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Sessões por Dia</h3>
                      <div className="space-y-2">
                        {progressData.slice(-7).map((data, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300 w-12">{data.date}</span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                              <div 
                                className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${Math.min((data.completed / 3) * 100, 100)}%` }}
                              >
                                <span className="text-xs text-white font-medium">
                                  {data.completed}
                                </span>
                              </div>
                            </div>
                            {data.abandoned > 0 && (
                              <div className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-500">{data.abandoned}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Estatísticas do Período */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{filteredSessions.length}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Total de Sessões</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {filteredSessions.filter(s => s.status === 'completed').length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Concluídas</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                          {filteredSessions.filter(s => s.status === 'abandoned').length}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Abandonadas</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {filteredSessions.length > 0 
                            ? Math.round((filteredSessions.filter(s => s.status === 'completed').length / filteredSessions.length) * 100)
                            : 0}%
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Taxa Conclusão</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dados Pessoais */}
          <TabsContent value="personal">
            <div className="space-y-6">
              {/* Objetivos */}
              <Card className="bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientDetails?.goals ? (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{clientDetails.goals}</p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">Nenhum objetivo informado</p>
                  )}
                </CardContent>
              </Card>

              {/* Restrições de Saúde */}
              <Card className="bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Restrições de Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientDetails?.health_restrictions ? (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{clientDetails.health_restrictions}</p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">Nenhuma restrição informada</p>
                  )}
                </CardContent>
              </Card>

              {/* Contato de Emergência */}
              {clientDetails?.emergency_contact && (
                <Card className="bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-orange-600" />
                      Contato de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clientDetails.emergency_contact.name && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Nome</p>
                          <p className="font-medium text-gray-900 dark:text-white">{clientDetails.emergency_contact.name}</p>
                        </div>
                      )}
                      {clientDetails.emergency_contact.phone && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Telefone</p>
                          <p className="font-medium text-gray-900 dark:text-white">{clientDetails.emergency_contact.phone}</p>
                        </div>
                      )}
                      {clientDetails.emergency_contact.relationship && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Relação</p>
                          <p className="font-medium text-gray-900 dark:text-white">{clientDetails.emergency_contact.relationship}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails