import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users, Dumbbell, CheckCircle, Calendar, Clock, Loader2,
  TrendingUp, Activity, Target, Utensils, ArrowRight, User,
  Play, Pause, AlertCircle, RefreshCw, Trophy, Medal
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ExpandableImage } from '@/components/ui/expandable-image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanManager } from "@/components/marketplace/PlanManager";
import { FinancialSummary } from "@/components/analytics/FinancialSummary";

interface RecentActivity {
  id: string
  client_id: string
  workout_id: string
  duration_seconds: number | null
  status: string
  created_at: string
  client: { full_name: string | null }
  workout: { name: string }
}

interface RankedClient {
  id: string
  full_name: string
  avatar_url: string
  current_xp: number
  level: number
}

const getSpecialtyLabel = (key: string) => {
  const map: Record<string, string> = {
    'personal_trainer': 'Personal Trainer',
    'nutritionist': 'Nutricionista',
    'sports_doctor': 'Médico do Esporte',
    'physiotherapist': 'Fisioterapeuta',
    'consultant': 'Consultor',
    'coach': 'Treinador',
    'clinic': 'Clínica',
    'performance_coach': 'Coach de Performance'
  }
  return map[key] || key.replace(/_/g, ' ')
}

const ProfessionalDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [metrics, setMetrics] = useState({ totalClients: 0, activeWorkouts: 0, completedSessions: 0, activeSessions: 0 })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [rankedClients, setRankedClients] = useState<RankedClient[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [proDetails, setProDetails] = useState({ full_name: '', avatar_url: '', cover_url: '', specialty: 'Profissional', city: '', state: '' })

  const loadDashboardData = async (silent = false) => {
    if (!user) return
    if (!silent) setPageLoading(true)
    try {
      // 1. Métricas
      const [clientsRes, workoutsRes, completedRes, activeRes] = await Promise.all([
        supabase.from('client_professionals').select('id', { count: 'exact' }).eq('professional_id', user.id).eq('status', 'active'),
        supabase.from('client_workouts').select('id', { count: 'exact' }).eq('professional_id', user.id).eq('status', 'active'),
        supabase.from('workout_sessions').select('id', { count: 'exact' }).eq('professional_id', user.id).eq('status', 'completed'),
        supabase.from('workout_sessions').select('id', { count: 'exact' }).eq('professional_id', user.id).in('status', ['started', 'paused'])
      ])

      setMetrics({
        totalClients: clientsRes.count || 0,
        activeWorkouts: workoutsRes.count || 0,
        completedSessions: completedRes.count || 0,
        activeSessions: activeRes.count || 0
      })

      // 2. Atividades Recentes
      const { data: activities } = await supabase
        .from('workout_sessions')
        .select(`
          id, client_id, workout_id, duration_seconds, status, created_at,
          client:profiles!client_id(full_name),
          workout:workouts!workout_id(name)
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentActivities((activities || []).map((a: any) => ({
        ...a,
        client: Array.isArray(a.client) ? a.client[0] : a.client,
        workout: Array.isArray(a.workout) ? a.workout[0] : a.workout
      })))

      // 3. Ranking de Alunos (NOVO)
      const { data: rankingData } = await supabase
        .from('client_professionals')
        .select(`
          client:profiles!client_id (
            id, full_name, avatar_url, current_xp, level
          )
        `)
        .eq('professional_id', user.id)
        .eq('status', 'active')

      // Processa e ordena
      const processedRanking = (rankingData || [])
        .map((item: any) => item.client)
        .sort((a: any, b: any) => (b.current_xp || 0) - (a.current_xp || 0))
        .slice(0, 5)

      setRankedClients(processedRanking)

      setRankedClients(processedRanking)

      // 4. Fetch Prof Details specifically (profile + details)
      const { data: profData } = await supabase
        .from('profiles')
        .select(`
            full_name, 
            city,
            state,
            avatar_url,
            professional_details(cover_url, specialty)
        `)
        .eq('id', user.id)
        .single()

      if (profData) {
        const details = Array.isArray(profData.professional_details) ? profData.professional_details[0] : profData.professional_details
        setProDetails({
          full_name: profData.full_name || '',
          avatar_url: profData.avatar_url || '',
          cover_url: details?.cover_url || '',
          specialty: details?.specialty || 'Profissional',
          city: profData.city || '',
          state: profData.state || ''
        })
      }

    } catch (error) { console.error(error) }
    finally { if (!silent) setPageLoading(false) }
  }

  useEffect(() => {
    loadDashboardData()

    if (!user?.id) return

    // 1. Real-time Subscription
    const channelName = `dashboard-updates-${user.id}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_sessions',
          filter: `professional_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Realtime update received:', payload)
          loadDashboardData(true)
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status for ${channelName}:`, status)
      })

    // 2. Polling Fallback (every 5s)
    const intervalId = setInterval(() => {
      console.log('🔄 Polling dashboard data...')
      loadDashboardData(true)
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(intervalId)
    }
  }, [user, refreshKey])

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const m = Math.floor(seconds / 60)
    return m > 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m} min`
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'started': return { className: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/50', icon: <Play className="h-3 w-3" />, text: 'Treinando' }
      case 'paused': return { className: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/50', icon: <Pause className="h-3 w-3" />, text: 'Pausado' }
      case 'completed': return { className: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/50', icon: <CheckCircle className="h-3 w-3" />, text: 'Concluído' }
      case 'abandoned': return { className: 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/50', icon: <AlertCircle className="h-3 w-3" />, text: 'Abandonado' }
      default: return { className: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/50', icon: <AlertCircle className="h-3 w-3" />, text: 'Cancelado/Erro' }
    }
  }

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* Header with Cover */}
        <div className="mb-8 relative rounded-xl overflow-hidden shadow-2xl border border-border">
          {/* Cover Image */}
          <div className="h-48 w-full bg-muted relative">
            <ExpandableImage
              type="cover"
              src={proDetails.cover_url}
              alt="Capa do Perfil"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="relative px-6 pb-6 -mt-12 flex flex-col md:flex-row items-end md:items-center gap-6">
            <div className="relative z-10">
              <ExpandableImage
                type="avatar"
                src={proDetails.avatar_url}
                alt={proDetails.full_name}
                className="h-24 w-24 rounded-full border-4 border-background bg-background shadow-lg"
                fallback={proDetails.full_name?.[0]}
              />
            </div>

            <div className="flex-1 mb-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight drop-shadow-md">Olá, {proDetails.full_name || 'Profissional'}! 👋</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {proDetails.specialty && proDetails.specialty !== 'Profissional' ? (
                  Array.isArray(proDetails.specialty)
                    ? proDetails.specialty.map((s: string) => (
                      <Badge key={s} className="bg-[#6e24dd] hover:bg-[#5b1db5] text-white border-0 px-3 py-1 text-xs font-medium">
                        {getSpecialtyLabel(s)}
                      </Badge>
                    ))
                    : (
                      <Badge className="bg-[#6e24dd] hover:bg-[#5b1db5] text-white border-0 px-3 py-1 text-xs font-medium">
                        {getSpecialtyLabel(proDetails.specialty)}
                      </Badge>
                    )
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-border bg-background/50">Painel de Controle</Badge>
                )}
              </div>
            </div>

            <div className="mb-2 flex gap-2">
              <Badge variant="secondary" className="bg-card/50 backdrop-blur-md text-foreground border-border px-3 py-1 text-sm shadow-sm hidden md:inline-flex">
                {proDetails.city ? `${proDetails.city}${proDetails.state ? ` - ${proDetails.state}` : ''}, ` : ''}{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </Badge>
              <Badge variant="secondary" className="bg-card/50 backdrop-blur-md text-foreground border-border px-3 py-1 text-sm shadow-sm md:hidden">
                {format(new Date(), 'dd/MM/yyyy')}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setRefreshKey(p => p + 1)} className="bg-card/50 backdrop-blur-md border-border text-foreground hover:bg-accent/80"><RefreshCw className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>



        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="finance">Financeiro</TabsTrigger>
            <TabsTrigger value="plans">Planos e Preços</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* ... (Metrics Cards content) ... */}
              <Card className="bg-card/50 backdrop-blur-md border-border shadow-md border-l-4 border-l-primary"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total de Alunos</CardTitle><Users className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{metrics.totalClients}</div></CardContent></Card>
              <Card className="bg-card/50 backdrop-blur-md border-border shadow-md border-l-4 border-l-green-500"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Treinos Ativos</CardTitle><Dumbbell className="h-4 w-4 text-green-600 dark:text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{metrics.activeWorkouts}</div></CardContent></Card>
              <Card className="bg-card/50 backdrop-blur-md border-border shadow-md border-l-4 border-l-purple-500"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Sessões Concluídas</CardTitle><CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{metrics.completedSessions}</div></CardContent></Card>
              <Card className="bg-card/50 backdrop-blur-md border-border shadow-md border-l-4 border-l-orange-500"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Treinando Agora</CardTitle><Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-foreground">{metrics.activeSessions}</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de Atividades Recentes */}
              <div className="lg:col-span-2">
                <Card className="bg-card/50 backdrop-blur-md border-border shadow-xl border-l-4 border-l-orange-500">
                  <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" /> Atividade Recente</CardTitle></CardHeader>
                  <CardContent>
                    {recentActivities.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">Nenhuma atividade recente.</div>
                    ) : (
                      <div className="space-y-3">
                        {recentActivities.map((activity) => {
                          const info = getStatusInfo(activity.status)
                          return (
                            <div key={activity.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-accent cursor-pointer transition-colors" onClick={() => navigate(`/app/clients/${activity.client_id}`)}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User className="h-4 w-4" /></div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">{activity.client?.full_name || 'Aluno'}</span>
                                    <Badge className={`text-[10px] h-5 px-1 ${info.className}`}>{info.icon} <span className="ml-1">{info.text}</span></Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground flex gap-3 mt-0.5">
                                    <span><Dumbbell className="h-3 w-3 inline mr-1" />{activity.workout?.name}</span>
                                    <span><Clock className="h-3 w-3 inline mr-1" />{formatDuration(activity.duration_seconds)}</span>
                                  </div>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* RANKING DE ALUNOS */}
              <div className="lg:col-span-1">
                <Card className="bg-card border-border shadow-xl border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500 dark:text-yellow-400 animate-pulse" /> Ranking de XP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {rankedClients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">Sem dados de ranking.</div>
                    ) : (
                      <div className="space-y-4">
                        {rankedClients.map((client, index) => (
                          <div key={client.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                            <div className="flex-shrink-0 w-8 text-center font-bold text-xl text-muted-foreground">
                              {index === 0 ? <Medal className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mx-auto" /> :
                                index === 1 ? <Medal className="h-6 w-6 text-slate-400 dark:text-gray-300 mx-auto" /> :
                                  index === 2 ? <Medal className="h-6 w-6 text-amber-600 mx-auto" /> :
                                    `#${index + 1}`}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-foreground truncate">{client.full_name}</span>
                                <span className="text-xs font-bold text-primary">{client.current_xp || 0} XP</span>
                              </div>
                              <div className="w-full bg-muted h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full" style={{ width: `${Math.min(100, ((client.current_xp % 1000) / 1000) * 100)}%` }}></div>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">Nível {client.level || 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ações Rápidas */}
                <Card className="bg-card/50 backdrop-blur-md border-border mt-6 shadow-xl border-l-4 border-l-blue-500">
                  <CardHeader><CardTitle className="text-foreground text-sm">Acesso Rápido</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => navigate('/app/clients')}><Users className="mr-2 h-4 w-4" /> Novo Aluno</Button>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => navigate('/app/planner')}><Dumbbell className="mr-2 h-4 w-4" /> Criar Treino</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="finance">
            <FinancialSummary />
          </TabsContent>

          <TabsContent value="plans">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0">
                <CardTitle>Gerenciar Planos e Preços</CardTitle>
                <p className="text-muted-foreground">Configure os planos de assinatura disponíveis para seus alunos no marketplace.</p>
              </CardHeader>
              <CardContent className="px-0">
                <PlanManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProfessionalDashboard