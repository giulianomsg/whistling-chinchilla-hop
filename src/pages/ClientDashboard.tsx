import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Dumbbell, 
  Utensils, 
  Calendar,
  Clock,
  Loader2,
  TrendingUp,
  Activity,
  Target,
  User,
  Timer,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { supabase } from '../integrations/supabase/client'
import { format, subDays } from 'date-fns'

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

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [clientWorkout, setClientWorkout] = useState<ClientWorkout | null>(null)
  const [clientMealPlan, setClientMealPlan] = useState<ClientMealPlan | null>(null)
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  // Buscar treino ativo do cliente
  const fetchClientWorkout = async () => {
    if (!user) return

    try {
      console.log('🔍 [CLIENT_DASHBOARD] Buscando treino do cliente:', user.id)
      
      const { data, error } = await supabase
        .from('client_workouts')
        .select(`
          *,
          workout:workouts(id, name, description, objective, duration_weeks, days_per_week)
        `)
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [CLIENT_DASHBOARD] Erro ao buscar treino:', error)
        return
      }

      console.log('✅ [CLIENT_DASHBOARD] Treino encontrado:', data)
      setClientWorkout(data)
    } catch (error) {
      console.error('❌ [CLIENT_DASHBOARD] Erro inesperado:', error)
    }
  }

  // Buscar plano alimentar ativo do cliente
  const fetchClientMealPlan = async () => {
    if (!user) return

    try {
      console.log('🔍 [CLIENT_DASHBOARD] Buscando plano alimentar do cliente:', user.id)
      
      const { data, error } = await supabase
        .from('client_meal_plans')
        .select(`
          *,
          meal_plan:meal_plans(id, name, description, objective, daily_calories_target, daily_protein_target, daily_carbs_target, daily_fat_target)
        `)
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [CLIENT_DASHBOARD] Erro ao buscar plano alimentar:', error)
        return
      }

      console.log('✅ [CLIENT_DASHBOARD] Plano alimentar encontrado:', data)
      setClientMealPlan(data)
    } catch (error) {
      console.error('❌ [CLIENT_DASHBOARD] Erro inesperado:', error)
    }
  }

  // Buscar sessões recentes do cliente
  const fetchRecentSessions = async () => {
    if (!user) return

    try {
      console.log('🔍 [CLIENT_DASHBOARD] Buscando sessões recentes...')

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout:workouts(name, objective)
        `)
        .eq('client_id', user.id)
        .in('status', ['completed', 'abandoned'])
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('❌ [CLIENT_DASHBOARD] Erro ao buscar sessões:', error)
        return
      }

      console.log('✅ [CLIENT_DASHBOARD] Sessões recentes carregadas:', data?.length || 0)
      setRecentSessions(data || [])
    } catch (error) {
      console.error('❌ [CLIENT_DASHBOARD] Erro inesperado:', error)
    }
  }

  // Carregar todos os dados do dashboard
  const loadDashboardData = async () => {
    if (!user) return

    setPageLoading(true)
    try {
      await Promise.all([
        fetchClientWorkout(),
        fetchClientMealPlan(),
        fetchRecentSessions()
      ])
    } catch (error) {
      console.error('❌ [CLIENT_DASHBOARD] Erro ao carregar dashboard:', error)
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      loadDashboardData()
    }
  }, [user?.id, loading])

  // Formatar duração para display
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A'
    
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`
    } else {
      return `${minutes} min`
    }
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
      return format(date, 'dd/MM/yyyy')
    }
  }

  // Obter nome de exibição do cliente
  const getDisplayName = () => {
    return profile?.full_name || 'Aluno'
  }

  // Calcular estatísticas
  const getStats = () => {
    const completedSessions = recentSessions.filter(s => s.status === 'completed').length
    const totalDuration = recentSessions
      .filter(s => s.status === 'completed' && s.duration_seconds)
      .reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
    
    return {
      totalSessions: recentSessions.length,
      completedSessions,
      averageDuration: completedSessions > 0 ? Math.round(totalDuration / completedSessions / 60) : 0,
      completionRate: recentSessions.length > 0 ? Math.round((completedSessions / recentSessions.length) * 100) : 0
    }
  }

  const stats = getStats()

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando seu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header com Boas-vindas */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {getDisplayName()}! 💪
              </h1>
              <p className="mt-2 text-gray-600">
                Bem-vindo ao seu painel. Aqui está o resumo dos seus treinos e progresso.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {format(new Date(), 'EEEE, dd/MM/yyyy')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Treino Ativo */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Treino Ativo
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {clientWorkout ? clientWorkout.workout.name : 'Nenhum'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {clientWorkout ? `${clientWorkout.workout.days_per_week}x por semana` : 'Aguardando plano'}
              </p>
            </CardContent>
          </Card>

          {/* Plano Alimentar */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Plano Alimentar
              </CardTitle>
              <Utensils className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {clientMealPlan ? clientMealPlan.meal_plan.name : 'Nenhum'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {clientMealPlan && clientMealPlan.meal_plan.daily_calories_target 
                  ? `${clientMealPlan.meal_plan.daily_calories_target} cal/dia` 
                  : 'Aguardando plano'}
              </p>
            </CardContent>
          </Card>

          {/* Sessões Concluídas */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taxa de Conclusão
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.completionRate}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.completedSessions} de {stats.totalSessions} sessões
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal: Ações Rápidas e Atividades */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ações Rápidas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Ações Rápidas
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Acesse rapidamente seus treinos e planos alimentares
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Meu Treino */}
                  <Button
                    onClick={() => navigate('/app/my-workout')}
                    className="h-20 text-base flex-col"
                    variant="outline"
                  >
                    <Dumbbell className="h-8 w-8 mb-2 text-green-600" />
                    <div className="text-center">
                      <div className="font-medium">Meu Treino</div>
                      <div className="text-xs text-gray-500">
                        {clientWorkout ? 'Ver plano' : 'Aguardando plano'}
                      </div>
                    </div>
                  </Button>

                  {/* Meu Plano Alimentar */}
                  <Button
                    onClick={() => navigate('/app/my-meal-plan')}
                    className="h-20 text-base flex-col"
                    variant="outline"
                  >
                    <Utensils className="h-8 w-8 mb-2 text-orange-600" />
                    <div className="text-center">
                      <div className="font-medium">Minha Dieta</div>
                      <div className="text-xs text-gray-500">
                        {clientMealPlan ? 'Ver plano' : 'Aguardando plano'}
                      </div>
                    </div>
                  </Button>
                </div>

                {/* Cards de Informação Adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Card de Progresso */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <TrendingUp className="h-5 w-5" />
                        Seu Progresso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Sessões esta semana:</span>
                          <span className="font-bold text-blue-800">{stats.completedSessions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">Tempo médio:</span>
                          <span className="font-bold text-blue-800">{stats.averageDuration} min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card de Motivação */}
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <Activity className="h-5 w-5" />
                        Mantenha o Foco!
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-700 text-sm">
                        Você está indo muito bem! Continue focado nos seus objetivos e 
                        os resultados virão. Cada treino conta!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Atividade Recente */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-orange-600" />
                  Atividade Recente
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Suas últimas sessões de treino
                </p>
              </CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Nenhuma atividade ainda
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Comece seu treino para ver seu progresso aqui!
                    </p>
                    {clientWorkout && (
                      <Button 
                        onClick={() => navigate('/app/my-workout')} 
                        size="sm"
                        variant="outline"
                      >
                        Iniciar Treino
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {session.workout?.name || 'Treino'}
                            </h4>
                            <Badge
                              variant={session.status === 'completed' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {session.status === 'completed' ? 'Concluído' : 'Abandonado'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(session.duration_seconds)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(session.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard