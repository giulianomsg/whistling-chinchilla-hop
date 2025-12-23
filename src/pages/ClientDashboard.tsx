import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dumbbell,
  Utensils,
  Calendar,
  Clock,
  Loader2,
  TrendingUp,
  Activity,
  Target,
  Timer,
  CheckCircle,
  AlertCircle,
  Trophy
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'
import { getRankTitle, getLevelProgress } from '@/utils/gamification'
import { useStrengthProfile } from '@/hooks/useStrengthProfile'
import StrengthRadar from '@/components/analytics/StrengthRadar'

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
  const { user, loading } = useAuth()

  const [clientWorkout, setClientWorkout] = useState<ClientWorkout | null>(null)
  const [clientMealPlan, setClientMealPlan] = useState<ClientMealPlan | null>(null)
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([])
  const [latestWeight, setLatestWeight] = useState<number>(70)
  const { stats: strengthStats, dotsScore } = useStrengthProfile(user?.id, latestWeight)

  // Estado local para XP (Dados frescos do banco)
  const [xpStats, setXpStats] = useState({ current_xp: 0, level: 1 })

  const [pageLoading, setPageLoading] = useState(true)

  // 1. Buscar XP Atualizado (Correção do Bug)
  const fetchFreshXP = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('profiles')
        .select('current_xp, level')
        .eq('id', user.id)
        .single()

      if (data) {
        setXpStats({
          current_xp: data.current_xp || 0,
          level: data.level || 1
        })
      }
    } catch (e) { console.error('Erro ao buscar XP', e) }
  }

  const fetchClientWorkout = async () => {
    if (!user) return
    try {
      const { data } = await supabase.from('client_workouts')
        .select(`*, workout:workouts(id, name, description, objective, duration_weeks, days_per_week)`)
        .eq('client_id', user.id).eq('status', 'active').maybeSingle()
      setClientWorkout(data)
    } catch (error) { console.error(error) }
  }

  const fetchClientMealPlan = async () => {
    if (!user) return
    try {
      const { data } = await supabase.from('client_meal_plans')
        .select(`*, meal_plan:meal_plans(id, name, description, objective, daily_calories_target, daily_protein_target, daily_carbs_target, daily_fat_target)`)
        .eq('client_id', user.id).eq('status', 'active').maybeSingle()
      setClientMealPlan(data)
    } catch (error) { console.error(error) }
  }

  const fetchRecentSessions = async () => {
    if (!user) return
    try {
      const { data } = await supabase.from('workout_sessions')
        .select(`*, workout:workouts(name, objective)`)
        .eq('client_id', user.id).in('status', ['completed', 'abandoned'])
        .order('created_at', { ascending: false }).limit(5)
      setRecentSessions(data || [])
    } catch (error) { console.error(error) }
  }

  const fetchLatestWeight = async () => {
    if (!user) return
    try {
      const { data } = await supabase.from('biometric_data')
        .select('weight')
        .eq('client_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data?.weight) setLatestWeight(data.weight)
    } catch (error) { console.error(error) }
  }

  const loadDashboardData = async () => {
    if (!user) return
    setPageLoading(true)
    await Promise.all([
      fetchFreshXP(), // Carrega XP atualizado
      fetchClientWorkout(),
      fetchClientMealPlan(),
      fetchClientWorkout(),
      fetchClientMealPlan(),
      fetchRecentSessions(),
      fetchLatestWeight()
    ])
    setPageLoading(false)
  }

  useEffect(() => {
    if (!loading && user) loadDashboardData()
  }, [user?.id, loading])

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    return minutes > 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}min` : `${minutes} min`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    if (diffInHours < 24) return `Há ${Math.floor(diffInHours)}h`
    return format(date, 'dd/MM/yyyy')
  }

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

  // --- CÁLCULO DE GAMIFICAÇÃO CORRIGIDO ---
  const currentXP = xpStats.current_xp
  // Garante que o nível calculado bata com o do banco, ou recalcula se necessário
  const currentLevel = xpStats.level || Math.max(1, Math.floor(Math.sqrt(currentXP / 100)))

  const levelStats = getLevelProgress(currentXP, currentLevel)

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Olá, {user?.user_metadata?.full_name || 'Aluno'}! 💪</h1>
            <p className="mt-2 text-muted-foreground">Este é o seu resumo de hoje.</p>
          </div>
          <Badge variant="secondary" className="bg-card text-foreground border-border">{format(new Date(), 'EEEE, dd/MM/yyyy')}</Badge>
        </div>

        {/* Seção de Gamificação */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-900/80 dark:to-blue-900/80 border-border border shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-black/40 border-2 border-primary flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <span className="text-3xl font-black text-white">{currentLevel}</span>
                  </div>
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-bold border-none uppercase text-[10px] px-2">
                    Nível
                  </Badge>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        {getRankTitle(currentLevel)}
                      </h3>
                      <p className="text-xs text-blue-200">Progresso para o Nível {currentLevel + 1}</p>
                    </div>
                    <span className="text-sm text-primary font-mono">{currentXP} Total XP</span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out relative"
                      style={{ width: `${levelStats.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse-fast"></div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>XP Nível: {levelStats.xpInLevel}</span>
                    <span>Próximo: {levelStats.xpRequiredForNext} XP</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Treino Ativo */}
          <Card className="bg-card/50 backdrop-blur-md border-border border-l-4 border-l-green-500 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Treino Ativo</CardTitle>
              <Dumbbell className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground truncate">{clientWorkout ? clientWorkout.workout.name : 'Nenhum'}</div>
              <p className="text-xs text-muted-foreground mt-1">{clientWorkout ? `${clientWorkout.workout.days_per_week}x por semana` : 'Aguardando plano'}</p>
            </CardContent>
          </Card>

          {/* Plano Alimentar */}
          <Card className="bg-card/50 backdrop-blur-md border-border border-l-4 border-l-orange-500 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plano Alimentar</CardTitle>
              <Utensils className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground truncate">{clientMealPlan ? clientMealPlan.meal_plan.name : 'Nenhum'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {clientMealPlan && clientMealPlan.meal_plan.daily_calories_target
                  ? `${clientMealPlan.meal_plan.daily_calories_target} cal/dia`
                  : 'Aguardando plano'}
              </p>
            </CardContent>
          </Card>

          {/* Taxa de Conclusão */}
          <Card className="bg-card/50 backdrop-blur-md border-border border-l-4 border-l-purple-500 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.completedSessions} de {stats.totalSessions} sessões recentes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ações Rápidas */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-md border-border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="h-5 w-5 text-primary" /> Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => navigate('/app/my-workout')} className="h-24 flex-col bg-card hover:bg-accent border border-border" variant="ghost">
                    <Dumbbell className="h-8 w-8 mb-2 text-green-600 dark:text-green-400" />
                    <div className="text-center">
                      <div className="font-medium text-foreground">Meu Treino</div>
                      <div className="text-xs text-muted-foreground">{clientWorkout ? 'Ver plano' : 'Aguardando'}</div>
                    </div>
                  </Button>

                  <Button onClick={() => navigate('/app/my-meal-plan')} className="h-24 flex-col bg-card hover:bg-accent border border-border" variant="ghost">
                    <Utensils className="h-8 w-8 mb-2 text-orange-600 dark:text-orange-400" />
                    <div className="text-center">
                      <div className="font-medium text-foreground">Minha Dieta</div>
                      <div className="text-xs text-muted-foreground">{clientMealPlan ? 'Ver plano' : 'Aguardando'}</div>
                    </div>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Card className="dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-base">
                        <TrendingUp className="h-5 w-5" /> Seu Progresso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-blue-600/70 dark:text-blue-200/70">Sessões recentes:</span>
                        <span className="font-bold text-blue-800 dark:text-blue-100">{stats.completedSessions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600/70 dark:text-blue-200/70">Tempo médio:</span>
                        <span className="font-bold text-blue-800 dark:text-blue-100">{stats.averageDuration} min</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dark:bg-gradient-to-r dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300 text-base">
                        <Activity className="h-5 w-5" /> Motivação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-700/70 dark:text-green-200/70 text-sm">
                        Você está indo muito bem! Mantenha o foco e os resultados virão.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Atividade Recente */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 backdrop-blur-md border-border shadow-xl h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Timer className="h-5 w-5 text-orange-600 dark:text-orange-400" /> Histórico Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Nenhuma atividade ainda</p>
                    {clientWorkout && (
                      <Button onClick={() => navigate('/app/my-workout')} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/80">
                        Iniciar Treino
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {recentSessions.map((session) => (
                        <div key={session.id} className="p-3 border border-border rounded-lg bg-card hover:bg-accent transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-foreground truncate">{session.workout?.name}</h4>
                            <Badge variant={session.status === 'completed' ? 'default' : 'destructive'} className="text-[10px] h-5">
                              {session.status === 'completed' ? 'Concluído' : 'Abandonado'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{formatDuration(session.duration_seconds)}</span></div>
                            <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /><span>{formatDate(session.created_at)}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full mt-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                      onClick={() => navigate('/app/my-history')}
                    >
                      Ver Histórico Completo
                    </Button>
                  </>
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