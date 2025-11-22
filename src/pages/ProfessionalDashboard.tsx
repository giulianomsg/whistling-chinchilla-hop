import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Dumbbell, 
  CheckCircle, 
  Calendar,
  Clock,
  Loader2,
  TrendingUp,
  Activity,
  Target,
  Utensils,
  ArrowRight,
  User,
  Timer,
  Play,
  Pause,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'

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
  updated_at: string
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
  activeSessions: number
}

const ProfessionalDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClients: 0,
    activeWorkouts: 0,
    completedSessions: 0,
    activeSessions: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Buscar métricas
  const fetchMetrics = async () => {
    if (!user) return
    try {
      const [clientsResult, workoutsResult, completedSessionsResult, activeSessionsResult] = await Promise.all([
        supabase.from('client_professionals').select('id').eq('professional_id', user.id).eq('status', 'active'),
        supabase.from('client_workouts').select('id').eq('professional_id', user.id).eq('status', 'active'),
        supabase.from('workout_sessions').select('id').eq('professional_id', user.id).eq('status', 'completed'),
        supabase.from('workout_sessions').select('id').eq('professional_id', user.id).in('status', ['started', 'paused'])
      ])

      setMetrics({
        totalClients: clientsResult.data?.length || 0,
        activeWorkouts: workoutsResult.data?.length || 0,
        completedSessions: completedSessionsResult.data?.length || 0,
        activeSessions: activeSessionsResult.data?.length || 0
      })
    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
    }
  }

  // Buscar atividades
  const fetchRecentActivities = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('workout_sessions')
        .select(`
          id, client_id, workout_id, client_workout_id, started_at, ended_at, duration_seconds, status, created_at,
          client:profiles!client_id(full_name),
          workout:workouts!workout_id(name)
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15)

      setRecentActivities(data || [])
    } catch (error) {
      console.error('Erro ao buscar atividades:', error)
    }
  }

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  const loadDashboardData = async () => {
    if (!user) return
    setPageLoading(true)
    await Promise.all([fetchMetrics(), fetchRecentActivities()])
    setPageLoading(false)
  }

  useEffect(() => {
    if (!loading && user) loadDashboardData()
  }, [user?.id, loading, refreshKey])

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return hours > 0 ? `${hours}h ${remainingMinutes}min` : `${minutes} min`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    if (diffInHours < 1) return 'Agora há pouco'
    if (diffInHours < 24) return `Há ${Math.floor(diffInHours)}h`
    return format(date, 'dd/MM/yyyy')
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'started':
        return { variant: 'default' as const, className: 'bg-green-500/20 text-green-400 border-green-500/50', icon: <Play className="h-3 w-3" />, text: 'Treinando Agora' }
      case 'paused':
        return { variant: 'secondary' as const, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: <Pause className="h-3 w-3" />, text: 'Pausado' }
      case 'completed':
        return { variant: 'default' as const, className: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: <CheckCircle className="h-3 w-3" />, text: 'Concluído' }
      case 'abandoned':
        return { variant: 'destructive' as const, className: 'bg-red-500/20 text-red-400 border-red-500/50', icon: <AlertCircle className="h-3 w-3" />, text: 'Abandonado' }
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-500/20 text-gray-400 border-gray-500/50', icon: <Clock className="h-3 w-3" />, text: status }
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Olá, {profile?.full_name || 'Profissional'}! 👋
              </h1>
              <p className="mt-2 text-gray-400">
                Painel de controle em tempo real.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/10 text-gray-200 hover:bg-white/20 border-none">
                {format(new Date(), 'EEEE, dd/MM/yyyy')}
              </Badge>
              {metrics.activeSessions > 0 && (
                <Badge className="bg-green-500 text-black hover:bg-green-400 border-none animate-pulse">
                  {metrics.activeSessions} treinando agora
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleRefresh} className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Métricas (Glassmorphism) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.totalClients}</div>
              <p className="text-xs text-gray-500 mt-1">Alunos ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Treinos Ativos</CardTitle>
              <Dumbbell className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.activeWorkouts}</div>
              <p className="text-xs text-gray-500 mt-1">Planos em andamento</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Sessões Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.completedSessions}</div>
              <p className="text-xs text-gray-500 mt-1">Treinos finalizados</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Treinando Agora</CardTitle>
              <Activity className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.activeSessions}</div>
              <p className="text-xs text-gray-500 mt-1">Em tempo real</p>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Atividade Recente */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5 text-orange-400" />
                  Atividade em Tempo Real
                </CardTitle>
                <p className="text-sm text-gray-400">Todas as sessões recentes dos seus alunos</p>
              </CardHeader>
              <CardContent>
                {recentActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <Timer className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Nenhuma atividade recente</h3>
                    <Button onClick={() => navigate('/app/planner')} variant="outline" className="border-white/10 text-gray-300">
                      Criar Primeiro Treino
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const statusInfo = getStatusInfo(activity.status)
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                          onClick={() => navigate(`/app/clients/${activity.client_id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-white">{activity.client?.full_name || 'Aluno'}</h4>
                                <Badge variant={statusInfo.variant} className={`text-xs ${statusInfo.className}`}>
                                  <span className="flex items-center gap-1">{statusInfo.icon}{statusInfo.text}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1"><Dumbbell className="h-3 w-3" /><span>{activity.workout?.name}</span></div>
                                <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{formatDuration(activity.duration_seconds)}</span></div>
                                <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /><span>{formatDate(activity.created_at)}</span></div>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5 text-primary" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => navigate('/app/clients')} className="w-full justify-start h-12 text-base bg-white/5 hover:bg-white/10 border border-white/10 text-white" variant="ghost">
                  <Users className="h-5 w-5 mr-3 text-blue-400" />
                  Novo Aluno
                </Button>
                <Button onClick={() => navigate('/app/planner')} className="w-full justify-start h-12 text-base bg-white/5 hover:bg-white/10 border border-white/10 text-white" variant="ghost">
                  <Dumbbell className="h-5 w-5 mr-3 text-green-400" />
                  Criar Treino
                </Button>
                <Button onClick={() => navigate('/app/meal-planner')} className="w-full justify-start h-12 text-base bg-white/5 hover:bg-white/10 border border-white/10 text-white" variant="ghost">
                  <Utensils className="h-5 w-5 mr-3 text-orange-400" />
                  Criar Dieta
                </Button>
                
                <div className="border-t border-white/10 pt-4 mt-4">
                  <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-blue-300 text-sm">
                        <TrendingUp className="h-4 w-4" /> Dica do Dia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-blue-200/80">
                        Check-ins regulares aumentam a adesão em até 40%. Envie uma mensagem hoje!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalDashboard