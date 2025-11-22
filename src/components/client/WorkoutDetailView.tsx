import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Timer, Play, Pause, Square, PlayCircle, Loader2, BarChart3
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'

interface WorkoutDetailViewProps {
  clientWorkout: any
}

const WorkoutDetailView: React.FC<WorkoutDetailViewProps> = ({ clientWorkout }) => {
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)
  
  // Session States
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'started' | 'paused' | 'completed'>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionLoading, setSessionLoading] = useState(false)

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes('youtube.com')) return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`
      if (urlObj.hostname === 'youtu.be') return `https://www.youtube.com/embed/${urlObj.pathname.substring(1)}`
      return url
    } catch { return null }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Carregar exercícios
      const { data } = await supabase.from('workout_exercises')
        .select(`*, exercise:exercises_library(*)`).eq('workout_id', clientWorkout.workout_id)
        .order('day_number').order('order_index')
      setWorkoutExercises((data || []).filter(i => i.exercise !== null))

      // Verificar sessão existente
      const { data: session } = await supabase.from('workout_sessions')
        .select('*').eq('client_workout_id', clientWorkout.id)
        .in('status', ['started', 'paused']).order('created_at', { ascending: false }).limit(1).maybeSingle()
      
      if (session) {
        setSessionId(session.id); setSessionStatus(session.status); setIsSessionActive(true)
        if (session.status === 'started') {
          const elapsed = Math.floor((new Date().getTime() - new Date(session.started_at).getTime()) / 1000)
          setElapsedTime(elapsed)
        } else if (session.status === 'paused') {
          setElapsedTime(session.duration_seconds || 0)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [clientWorkout])

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sessionStatus === 'started') {
      interval = setInterval(() => setElapsedTime(p => p + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [sessionStatus])

  const handleSessionAction = async (action: 'start' | 'pause' | 'resume' | 'finish') => {
    setSessionLoading(true)
    try {
      if (action === 'start') {
        const { data, error } = await supabase.from('workout_sessions').insert({
          client_id: clientWorkout.client_id, professional_id: clientWorkout.professional_id,
          workout_id: clientWorkout.workout_id, client_workout_id: clientWorkout.id, status: 'started'
        }).select().single()
        if (error) throw error
        setSessionId(data.id); setSessionStatus('started'); setIsSessionActive(true); setElapsedTime(0)
        showSuccess('Treino iniciado!')
      } else if (action === 'pause' && sessionId) {
        await supabase.from('workout_sessions').update({ status: 'paused', duration_seconds: elapsedTime }).eq('id', sessionId)
        setSessionStatus('paused'); showSuccess('Pausado')
      } else if (action === 'resume' && sessionId) {
        const newStart = new Date(Date.now() - elapsedTime * 1000).toISOString()
        await supabase.from('workout_sessions').update({ status: 'started', started_at: newStart }).eq('id', sessionId)
        setSessionStatus('started'); showSuccess('Retomado')
      } else if (action === 'finish' && sessionId) {
        // --- UPDATE GAMIFICATION ---
        const xpBase = 100
        const xpDurationBonus = Math.floor(elapsedTime / 60) // 1 XP por minuto
        const totalXpGained = xpBase + xpDurationBonus

        const { error: sessionError } = await supabase.from('workout_sessions')
          .update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: elapsedTime }).eq('id', sessionId)
        
        if (sessionError) throw sessionError

        // Fetch profile stats
        const { data: profileData } = await supabase.from('profiles').select('current_xp, level').eq('id', clientWorkout.client_id).single()
        
        if (profileData) {
          const currentXP = profileData.current_xp || 0
          const newXP = currentXP + totalXpGained
          const xpPerLevel = 1000
          const newLevel = Math.max(1, Math.floor(newXP / xpPerLevel) + 1)
          
          // Atualizar Profile
          await supabase.from('profiles').update({
            current_xp: newXP,
            level: newLevel
          }).eq('id', clientWorkout.client_id)

          if (newLevel > (profileData.level || 1)) {
            showSuccess(`LEVEL UP! Parabéns pelo Nível ${newLevel}! 🏆`)
          } else {
            showSuccess(`Treino finalizado! +${totalXpGained} XP!`)
          }
        }

        setSessionStatus('completed'); setIsSessionActive(false)
        setTimeout(() => { setSessionId(null); setElapsedTime(0); setSessionStatus('idle') }, 3000)
      }
    } catch (error) { showError('Erro na sessão'); console.error(error) }
    finally { setSessionLoading(false) }
  }

  if (loading) return <div className="py-12 text-center"><Loader2 className="animate-spin text-primary mx-auto"/></div>

  // Group by day
  const exercisesByDay = workoutExercises.reduce((acc: any, curr) => {
    if (!acc[curr.day_number]) acc[curr.day_number] = []
    acc[curr.day_number].push(curr)
    return acc
  }, {})

  return (
    <div className="space-y-6 pb-24">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">{workoutExercises.length}</p>
          <p className="text-xs text-gray-400">Exercícios</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{workoutExercises.reduce((s, i) => s + i.sets, 0)}</p>
          <p className="text-xs text-gray-400">Séries</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">{clientWorkout.workout.days_per_week}</p>
          <p className="text-xs text-gray-400">Dias/Semana</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-orange-400"><BarChart3 className="h-6 w-6 mx-auto"/></p>
          <p className="text-xs text-gray-400">Estatísticas</p>
        </div>
      </div>

      {/* Tabs dos Dias */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader><CardTitle className="text-white">Exercícios</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="day-1">
            <TabsList className="bg-black/20 w-full justify-start overflow-x-auto">
              {Object.keys(exercisesByDay).map(day => (
                <TabsTrigger key={day} value={`day-${day}`} className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">
                  Dia {day}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.keys(exercisesByDay).map(day => (
              <TabsContent key={day} value={`day-${day}`} className="space-y-4 mt-4">
                {exercisesByDay[day].map((we: any, idx: number) => (
                  <div key={we.id} className="bg-black/20 border border-white/5 rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center justify-center min-w-[3rem]">
                        <span className="bg-blue-500/20 text-blue-400 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-2">{we.exercise.name}</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="bg-white/10 text-white">{we.sets} séries</Badge>
                          <Badge variant="outline" className="border-white/20 text-gray-300">{we.reps} reps</Badge>
                          {we.weight && <Badge variant="outline" className="border-white/20 text-gray-300">{we.weight} kg</Badge>}
                          {we.rest_time_seconds && <Badge variant="outline" className="border-white/20 text-gray-300">{we.rest_time_seconds}s descanso</Badge>}
                        </div>
                        {we.notes && <p className="text-sm text-yellow-200/80 bg-yellow-900/20 p-2 rounded mb-2">⚠️ {we.notes}</p>}
                        
                        {we.exercise.video_url && (
                          <Button size="sm" variant="ghost" onClick={() => setOpenVideoId(openVideoId === we.id ? null : we.id)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                            <PlayCircle className="h-4 w-4 mr-2"/> Ver Vídeo
                          </Button>
                        )}
                        {openVideoId === we.id && we.exercise.video_url && (
                          <div className="mt-3 aspect-video rounded overflow-hidden bg-black">
                            <iframe width="100%" height="100%" src={getEmbedUrl(we.exercise.video_url) || ''} allowFullScreen frameBorder="0"/>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Player Fixo no Rodapé */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-white/10 backdrop-blur-xl p-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-black/40 p-2 rounded-lg"><Timer className="h-6 w-6 text-primary animate-pulse"/></div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Tempo de Treino</p>
              <p className="text-2xl font-mono font-bold text-white tracking-widest">{formatTime(elapsedTime)}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {!isSessionActive ? (
              <Button size="lg" onClick={() => handleSessionAction('start')} className="bg-green-500 hover:bg-green-600 text-black font-bold px-8">
                {sessionLoading ? <Loader2 className="animate-spin"/> : <Play className="mr-2 h-5 w-5"/>} Iniciar
              </Button>
            ) : (
              <>
                {sessionStatus === 'started' ? (
                  <Button size="lg" variant="outline" onClick={() => handleSessionAction('pause')} className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
                    <Pause className="mr-2 h-5 w-5"/> Pausar
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => handleSessionAction('resume')} className="bg-blue-500 text-white hover:bg-blue-600">
                    <Play className="mr-2 h-5 w-5"/> Retomar
                  </Button>
                )}
                <Button size="lg" variant="destructive" onClick={() => handleSessionAction('finish')} className="bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white">
                  <Square className="mr-2 h-5 w-5 fill-current"/> Finalizar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkoutDetailView