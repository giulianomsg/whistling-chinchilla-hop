import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Users, 
  Dumbbell, 
  CheckCircle, 
  Plus, 
  Calendar,
  Clock,
  Loader2,
  TrendingUp,
  Activity,
  Target,
  Utensils,
  ArrowRight,
  User,
  Timer
} from 'lucide-react'
import { supabase } from '../integrations/supabase/client'
import { format, subDays } from 'date-fns'

interface RecentActivity {
  id: string
  client_id: string
  workout_id: string
  client_workout_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  status: 'started' | 'paused' | 'completed' | 'abandoned'
  created_at: string
  client: {
    full_name: string | null
  }
  workout: {
    name: string
  }
}

interface DashboardMetrics {
  totalClients: number
  activeWorkouts: number
  completedSessions: number
}

const ProfessionalDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClients: 0,
    activeWorkouts: 0,
    completedSessions: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  // Buscar métricas do dashboard
  const fetchMetrics = async () => {
    if (!user) return

    try {
      console.log('🔍 [DASHBOARD] Buscando métricas do profissional:', user.id)

      // Buscar todas as métricas simultaneamente com Promise.all
      const [
        clientsResult,
        workoutsResult,
        sessionsResult
      ] = await Promise.all([
        // Total de alunos ativos
        supabase
          .from('client_professionals')
          .select('id')
          .eq('professional_id', user.id)
          .eq('status', 'active'),
        
        // Treinos ativos
        supabase
          .from('client_workouts')
          .select('id')
          .eq('professional_id', user.id)
          .eq('status', 'active'),
        
        // Sessões concluídas
        supabase
          .from('workout_sessions')
          .select('id')
          .eq('professional_id', user.id)
          .eq('status', 'completed')
      ])

      const newMetrics: DashboardMetrics = {
        totalClients: clientsResult.data?.length || 0,
        activeWorkouts: workoutsResult.data?.length || 0,
        completedSessions: sessionsResult.data?.length || 0
      }

      console.log('✅ [DASHBOARD] Métricas carregadas:', newMetrics)
      setMetrics(newMetrics)
    } catch (error) {
      console.error('❌ [DASHBOARD] Erro ao buscar métricas:', error)
    }
  }

  // Buscar atividades recentes
  const fetchRecentActivities = async () => {
    if (!user) return

    try {
      console.log('🔍 [DASHBOARD] Buscando atividades recentes...')

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          client:profiles(full_name),
          workout:workouts(name)
        `)
        .eq('professional_id', user.id)
        .in('status', ['completed', 'abandoned'])
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('❌ [DASHBOARD] Erro ao buscar atividades:', error)
        return
      }

      console.log('✅ [DASHBOARD] Atividades recentes carregadas:', data?.length || 0)
      setRecentActivities(data || [])
    } catch (error) {
      console.error('❌ [DASHBOARD] Erro inesperado:', error)
    }
  }

  // Carregar todos os dados do dashboard
  const loadDashboardData = async () => {
    if (!user) return

    setPageLoading(true)
    try {
      await Promise.all([
        fetchMetrics(),
        fetchRecentActivities()
      ])
    } catch (error) {
      console.error('❌ [DASHBOARD] Erro ao carregar dashboard:', error)
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

  // Navegar para detalhes do cliente
  const handleViewClientDetails = (clientId: string) => {
    console.log('🔗 [DASHBOARD] Navegando para detalhes do cliente:', clientId)
    navigate(`/app/clients/${clientId}`)
  }

  // Obter nome de exibição do profissional
  const getDisplayName = () => {
    return profile?.full_name || 'Profissional'
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando dashboard...</p>
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
                Olá, {getDisplayName()}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                Bem-vindo ao seu painel de controle. Aqui está o resumo das suas atividades.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {format(new Date(), 'EEEE, dd/MM/yyyy')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total de Alunos */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Alunos
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.totalClients}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Alunos ativos
              </p>
            </CardContent>
          </Card>

          {/* Treinos Ativos */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Treinos Ativos
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.activeWorkouts}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Planos em andamento
              </p>
            </CardContent>
          </Card>

          {/* Sessões Concluídas */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sessões Concluídas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.completedSessions}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Treinos finalizados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal: Atividades Recentes e Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Atividade Recente */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Atividade Recente
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Últimas sessões de treino dos seus alunos
                </p>
              </CardHeader>
              <CardContent>
                {recentActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma atividade recente
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Seus alunos ainda não realizaram nenhuma sessão de treino.
                    </p>
                    <Button onClick={() => navigate('/app/planner')} variant="outline">
                      <Dumbbell className="h-4 w-4 mr-2" />
                      Criar Primeiro Treino
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewClientDetails(activity.client_id)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar do Cliente */}
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          
                          {/* Informações da Atividade */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">
                                {activity.client?.full_name || 'Aluno sem nome'}
                              </h4>
                              <Badge
                                variant={activity.status === 'completed' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {activity.status === 'completed' ? 'Concluído' : 'Abandonado'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Dumbbell className="h-3 w-3" />
                                <span>{activity.workout?.name || 'Treino sem nome'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(activity.duration_seconds)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(activity.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Botão de Ação */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewClientDetails(activity.client_id)
                          }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Botão Ver Todas */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/app/clients')}
                      >
                        Ver Todos os Alunos
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Ações Rápidas
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Ações mais comuns do dia a dia
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Novo Aluno */}
                <Button
                  onClick={() => navigate('/app/clients')}
                  className="w-full justify-start h-12 text-base"
                  variant="outline"
                >
                  <Users className="h-5 w-5 mr-3 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Novo Aluno</div>
                    <div className="text-xs text-gray-500">Adicionar novo cliente</div>
                  </div>
                </Button>

                {/* Criar Treino */}
                <Button
                  onClick={() => navigate('/app/planner')}
                  className="w-full justify-start h-12 text-base"
                  variant="outline"
                >
                  <Dumbbell className="h-5 w-5 mr-3 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Criar Treino</div>
                    <div className="text-xs text-gray-500">Novo plano de treino</div>
                  </div>
                </Button>

                {/* Criar Dieta */}
                <Button
                  onClick={() => navigate('/app/meal-planner')}
                  className="w-full justify-start h-12 text-base"
                  variant="outline"
                >
                  <Utensils className="h-5 w-5 mr-3 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium">Criar Dieta</div>
                    <div className="text-xs text-gray-500">Novo plano alimentar</div>
                  </div>
                </Button>

                {/* Biblioteca de Exercícios */}
                <Button
                  onClick={() => navigate('/app/library')}
                  className="w-full justify-start h-12 text-base"
                  variant="outline"
                >
                  <Dumbbell className="h-5 w-5 mr-3 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Biblioteca</div>
                    <div className="text-xs text-gray-500">Exercícios e alimentos</div>
                  </div>
                </Button>

                {/* Separador */}
                <div className="border-t pt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Precisa de ajuda?
                    </p>
                    <Button variant="ghost" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Ver Tutoriais
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cards de Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Card de Dicas */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <TrendingUp className="h-5 w-5" />
                Dica do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">
                Mantenha-se consistente com o acompanhamento dos seus alunos. 
                Check-ins regulares aumentam a adesão em até 40%!
              </p>
            </CardContent>
          </Card>

          {/* Card de Estatísticas Rápidas */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Activity className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.totalClients > 0 ? Math.round((metrics.completedSessions / metrics.totalClients) * 10) / 10 : 0}
                  </p>
                  <p className="text-xs text-green-700">Sessões/Aluno</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.totalClients > 0 ? Math.round((metrics.activeWorkouts / metrics.totalClients) * 100) : 0}%
                  </p>
                  <p className="text-xs text-green-700">Com Treino</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalDashboard