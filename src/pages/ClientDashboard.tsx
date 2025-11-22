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
  Trophy // Novo Ícone
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'

// Interfaces... (mantidas do original)
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

  const loadDashboardData = async () => {
    if (!user) return
    setPageLoading(true)
    await Promise.all([fetchClientWorkout(), fetchClientMealPlan(), fetchRecentSessions()])
    setPageLoading(false)
  }

  useEffect(() => {
    if (!loading && user) loadDashboardData()
  }, [user?.id, loading])

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    return minutes > 60 ? `${Math.floor(minutes/60)}h ${minutes%60}min` : `${minutes} min`
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

  // --- LÓGICA DE GAMIFICAÇÃO VISUAL ---
  const currentXP = profile?.current_xp || 0
  const xpPerLevel = 1000
  const currentLevel = profile?.level || Math.max(1, Math.floor(currentXP / xpPerLevel) + 1)
  // Cálculo: XP atual dentro do nível corrente
  const xpInThisLevel = currentXP - ((currentLevel - 1) * xpPerLevel)
  const xpProgress = Math.min(Math.max((xpInThisLevel / xpPerLevel) * 100, 0), 100)

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" /><p className="text-gray-400">Carregando dashboard...</p></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Olá, {profile?.full_name || 'Aluno'}! 💪</h1>
            <p className="mt-2 text-gray-400">Este é o seu resumo de hoje.</p>
          </div>
          <Badge variant="secondary" className="bg-white/10 text-gray-200 border-none">{format(new Date(), 'EEEE, dd/MM/yyyy')}</Badge>
        </div>

        {/* --- CARD DE GAMIFICAÇÃO (NOVO) --- */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="bg-gradient-to-r from-indigo-900/80 to-blue-900/80 border-white/10 border shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-black/40 border-2 border-primary flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <span className="text-3xl font-black text-white">{currentLevel}</span>
                  </div>
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-bold border-none uppercase text-[10px] px-2">Nível</Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-400"/> Progresso de XP</h3>
                    <span className="text-sm text-primary font-mono">{currentXP} Total XP</span>
                  </div>
                  <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out relative"
                      style={{ width: `${xpProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse-fast"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Nível {currentLevel}</span>
                    <span>Faltam {xpPerLevel - xpInThisLevel} XP para o Nível {currentLevel + 1}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 border-l-4 border-l-green-500 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Treino Ativo</CardTitle>
              <Dumbbell className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white truncate">{clientWorkout ? clientWorkout.workout.name : 'Nenhum'}</div>
              <p className="text-xs text-gray-500 mt-1">{clientWorkout ? `${clientWorkout.workout.days_per_week}x por semana` : 'Aguardando plano'}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 border-l-4 border-l-orange-500 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Plano Alimentar</CardTitle>
              <Utensils className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white truncate">{clientMealPlan ? clientMealPlan.meal_plan.name : 'Nenhum'}</div>
              <p className="text-xs text-gray-500 mt-1">{clientMealPlan ? `${clientMealPlan.meal_plan.daily_calories_target} cal/dia` : 'Aguardando plano'}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 border-l-4 border-l-purple-500 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Taxa de Conclusão</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.completionRate}%</div>
              <p className="text-xs text-gray-500 mt-1">{stats.completedSessions} de {stats.totalSessions} sessões recentes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Target className="h-5 w-5 text-primary" /> Ações Rápidas</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => navigate('/app/my-workout')} className="h-24 flex-col bg-white/5 hover:bg-white/10 border border-white/10" variant="ghost">
                    <Dumbbell className="h-8 w-8 mb-2 text-green-400" />
                    <div className="text-center"><div className="font-medium text-white">Meu Treino</div><div className="text-xs text-gray-500">{clientWorkout ? 'Ver plano' : 'Aguardando'}</div></div>
                  </Button>
                  <Button onClick={() => navigate('/app/my-meal-plan')} className="h-24 flex-col bg-white/5 hover:bg-white/10 border border-white/10" variant="ghost">
                    <Utensils className="h-8 w-8 mb-2 text-orange-400" />
                    <div className="text-center"><div className="font-medium text-white">Minha Dieta</div><div className="text-xs text-gray-500">{clientMealPlan ? 'Ver plano' : 'Aguardando'}</div></div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl h-full">
              <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Timer className="h-5 w-5 text-orange-400" /> Histórico Recente</CardTitle></CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-3">Nenhuma atividade ainda</p>
                    {clientWorkout && <Button onClick={() => navigate('/app/my-workout')} size="sm" className="bg-primary text-black hover:bg-primary/80">Iniciar Treino</Button>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="p-3 border border-white/5 rounded-lg bg-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-white truncate">{session.workout?.name}</h4>
                          <Badge variant={session.status === 'completed' ? 'default' : 'destructive'} className="text-[10px] h-5">{session.status === 'completed' ? 'Concluído' : 'Abandonado'}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{formatDuration(session.duration_seconds)}</span></div>
                          <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /><span>{formatDate(session.created_at)}</span></div>
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