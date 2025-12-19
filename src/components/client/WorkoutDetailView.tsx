import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog'
import {
  Timer, Play, Pause, Square, PlayCircle, Loader2, BarChart3,
  CheckCircle, Circle, Save, List, Eye, Trash2
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'
import { useAuth } from '@/contexts/AuthContext'
import { WorkoutSummaryModal } from '@/components/gamification/WorkoutSummaryModal'
import { WorkoutExerciseCard } from './WorkoutExerciseCard'
import { calculateSessionXP } from '@/utils/xpCalculator'
import { calculateOneRM, getCanonicalExerciseId } from '@/utils/strength'

interface WorkoutDetailViewProps {
  clientWorkout: any
}

const WorkoutDetailView: React.FC<WorkoutDetailViewProps> = ({ clientWorkout }) => {
  const { refreshProfile } = useAuth()
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)

  // Timer States
  const [exerciseTimers, setExerciseTimers] = useState<Record<string, number>>({})
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)

  // Session States
  const [isSessionActive, setIsSessionActive] = useState(false)
  // Session States
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'started' | 'paused' | 'completed' | 'abandoned'>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionLoading, setSessionLoading] = useState(false)

  // Persistence: Store start time reference for accurate diffs
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  // Logging States
  const [executionLogs, setExecutionLogs] = useState<any[]>([])
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<any>(null)
  const [logForm, setLogForm] = useState({ weight: '', reps: '', notes: '' })
  const [savingLog, setSavingLog] = useState(false)

  // Gamification State
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [summaryData, setSummaryData] = useState({ xpEarned: 0, currentXP: 0, newLevel: 1, oldLevel: 1 })

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const getVideoId = (url: string) => {
    if (!url) return null
    try {
      // 1. Try URL object first for standard valid URLs
      const urlObj = new URL(url)
      if (urlObj.hostname === 'youtu.be') return urlObj.pathname.substring(1)
      if (urlObj.searchParams.get('v')) return urlObj.searchParams.get('v')
      if (urlObj.pathname.startsWith('/embed/')) return urlObj.pathname.split('/')[2]
      if (urlObj.pathname.startsWith('/shorts/')) return urlObj.pathname.split('/')[2]
    } catch (e) {
      // ignore invalid URL constructor errors
    }

    // 2. Fallback Regex for partials or weird formats
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?\/]+)/)
    if (match && match[1]) return match[1]

    return null
  }

  const fetchLogs = async (currentSessionId: string) => {
    const { data } = await supabase
      .from('workout_execution_logs')
      .select('*')
      .eq('workout_session_id', currentSessionId)
    setExecutionLogs(data || [])
  }

  // Heartbeat Function
  const updateHeartbeat = async (currentSessId: string) => {
    if (!currentSessId) return
    // Fire and forget update
    supabase.from('workout_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', currentSessId)
      .then(({ error }) => { if (error) console.error('Heartbeat fail', error) })
  }

  // ... (getVideoId etc)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // ... (fetch workoutExercises)
      const { data } = await supabase.from('workout_exercises')
        .select(`*, exercise:exercises_library(*)`).eq('workout_id', clientWorkout.workout_id)
        .order('day_number').order('order_index')
      setWorkoutExercises((data || []).filter(i => i.exercise !== null))

      const { data: session } = await supabase.from('workout_sessions')
        .select('*').eq('client_workout_id', clientWorkout.id)
        .in('status', ['started', 'paused', 'abandoned']).order('created_at', { ascending: false }).limit(1).maybeSingle()

      if (session) {
        setSessionId(session.id)
        setSessionStatus(session.status as any)

        // Restore Exercise Timers
        let loadedTimers = (session.exercise_timers_state as Record<string, number>) || {}

        // Restore Active Timer logic
        if (session.status === 'started' && session.active_timer_id && session.active_timer_started_at) {
          const activeStart = new Date(session.active_timer_started_at).getTime()
          const now = Date.now()
          const additionalSeconds = Math.max(0, Math.floor((now - activeStart) / 1000))

          // Add to existing accumulated time
          const currentTotal = (loadedTimers[session.active_timer_id] || 0) + additionalSeconds
          loadedTimers[session.active_timer_id] = currentTotal

          setActiveTimerId(session.active_timer_id)
        }
        setExerciseTimers(loadedTimers)

        if (session.status === 'abandoned') {
          setIsSessionActive(false)
          setElapsedTime(session.duration_seconds || 0)
        } else {
          setIsSessionActive(true)
          if (session.status === 'started') {
            const startDetails = new Date(session.started_at).getTime()
            setSessionStartTime(startDetails)
            const elapsed = Math.floor((Date.now() - startDetails) / 1000)
            setElapsedTime(elapsed)
          } else if (session.status === 'paused') {
            setElapsedTime(session.duration_seconds || 0)
          }
        }
        fetchLogs(session.id)
      }
      setLoading(false)
    }
    loadData()
  }, [clientWorkout])

  // Robust Timer: Uses timestamps diff instead of +1
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sessionStatus === 'started' && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now()
        setElapsedTime(Math.floor((now - sessionStartTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sessionStatus, sessionStartTime])

  // Active Exercise Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimerId && sessionStatus === 'started') {
      interval = setInterval(() => {
        setExerciseTimers(prev => ({ ...prev, [activeTimerId]: (prev[activeTimerId] || 0) + 1 }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTimerId, sessionStatus])

  const handleToggleTimer = async (exerciseId: string) => {
    const isCompleted = executionLogs.some(log => log.workout_exercise_id === exerciseId)
    if (!isSessionActive || sessionStatus !== 'started' || !sessionId) {
      showError('Inicie o treino para cronometrar.')
      return
    }


    const now = new Date()
    let updatePayload: any = {}
    let newTimersVal = { ...exerciseTimers }

    // If there is currently an active timer, stop it (save state)
    if (activeTimerId) {
      // Stop the active timer
      const elapsedForActive = exerciseTimers[activeTimerId] || 0
      // Update local map (it should be up to date via interval, but good to ensure)
      newTimersVal[activeTimerId] = elapsedForActive

      updatePayload.exercise_timers_state = newTimersVal // Save all states
      updatePayload.active_timer_id = null
      updatePayload.active_timer_started_at = null

      if (activeTimerId === exerciseId) {
        // Just stopping current
        setActiveTimerId(null)
      } else {
        // Switching to new - CHECK GUARD HERE
        if (isCompleted) {
          showError('Este exercício já foi concluído.')
          return
        }
        updatePayload.active_timer_id = exerciseId
        updatePayload.active_timer_started_at = now.toISOString()
        setActiveTimerId(exerciseId)
      }
    } else {
      // No active timer, just starting new one - CHECK GUARD HERE
      if (isCompleted) {
        showError('Este exercício já foi concluído.')
        return
      }
      updatePayload.active_timer_id = exerciseId
      updatePayload.active_timer_started_at = now.toISOString()
      setActiveTimerId(exerciseId)
    }

    // Optimistic Update is already done via setState above (partially), but let's fire DB update
    try {
      const { error } = await supabase.from('workout_sessions').update(updatePayload).eq('id', sessionId)
      if (error) throw error
    } catch (err) {
      console.error("Failed to persist timer", err)
      // Revert if critical? For stopwatch, maybe just log is enough.
    }
  }

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
        setSessionStartTime(Date.now()) // Set local start ref
        setExecutionLogs([]) // Reset logs for new session
        showSuccess('Treino iniciado!')
      } else if (action === 'pause' && sessionId) {
        await supabase.from('workout_sessions').update({ status: 'paused', duration_seconds: elapsedTime, last_activity_at: new Date().toISOString() }).eq('id', sessionId)
        setSessionStatus('paused'); showSuccess('Pausado')
      } else if (action === 'resume' && sessionId) {
        // Correctly calculate new started_at based on current time - elapsed (to maintain continuity)
        const newStart = new Date(Date.now() - elapsedTime * 1000).toISOString()
        setSessionStartTime(Date.now() - elapsedTime * 1000) // Restore local ref
        await supabase.from('workout_sessions').update({ status: 'started', started_at: newStart, last_activity_at: new Date().toISOString() }).eq('id', sessionId)
        setSessionStatus('started'); showSuccess('Retomado')
      } else if (action === 'finish' && sessionId) {
        // --- LÓGICA DE XP V2.0 (Com Strength Module) ---

        // 1. Validação Básica (Anti-Spam)
        if (elapsedTime < 60 || executionLogs.length === 0) {
          await supabase.from('workout_sessions')
            .update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: elapsedTime, last_activity_at: new Date().toISOString() })
            .eq('id', sessionId)

          setSessionStatus('completed'); setIsSessionActive(false)
          showSuccess('Treino finalizado! (Sem XP: muito curto ou sem registros)')
          setTimeout(() => { setSessionId(null); setElapsedTime(0); setSessionStatus('idle'); setExecutionLogs([]) }, 3000)
          return
        }

        // 2. Preparar Dados para Calculadora de XP
        // Necessário enriquecer logs com nomes para identificar PRs
        const enrichedLogs = executionLogs.map(log => {
          // Encontrar o exercício original para pegar o nome e ID real do exercício (não o ID do treino)
          const exerciseDef = workoutExercises.find(we => we.id === log.workout_exercise_id)
          return {
            ...log,
            exercise: { name: exerciseDef?.exercise?.name || '' },
            exercise_id: exerciseDef?.exercise_id // Ensure we have the library ID
          }
        })

        // 3. Buscar Histórico para PRs (Async)
        // Pegar todos os IDs de exercícios feitos hoje
        const performedExLibraryIds = [...new Set(enrichedLogs.map(l => l.exercise_id).filter(Boolean))] as string[]

        let history1RMs: Record<string, number> = {}

        if (performedExLibraryIds.length > 0) {
          // Buscar logs passados desses exercícios para este cliente
          const { data: historyData } = await supabase
            .from('workout_execution_logs')
            .select(`weight, reps, exercise_id, workout_session!inner(client_id)`)
            .eq('workout_session.client_id', clientWorkout.client_id)
            .in('exercise_id', performedExLibraryIds)

          if (historyData) {
            // Calcular Max 1RM por Canonical ID
            historyData.forEach((h: any) => {
              // Precisamos do nome para Canonical ID. 
              // Como não fizemos join com library (caro), vamos tentar mapear pelo ID se tivermos no front.
              // Ou melhor: Vamos pegar o nome do current workoutExercises que corresponde a esse ID.
              // Se o exercício mudou de nome na library, falha. Mas assumindo consistência:
              const exName = workoutExercises.find(we => we.exercise_id === h.exercise_id)?.exercise?.name || ''
              const cId = getCanonicalExerciseId(exName)
              if (cId) {
                const rm = calculateOneRM(h.weight, h.reps)
                if (rm > (history1RMs[cId] || 0)) history1RMs[cId] = rm
              }
            })
          }
        }

        // 4. Buscar Peso do Usuário (Para Tiers)
        const { data: freshProfile } = await supabase.from('profiles').select('current_xp, level').eq('id', clientWorkout.client_id).single()
        const { data: freshBody } = await supabase.from('biometric_data').select('weight').eq('client_id', clientWorkout.client_id).order('date', { ascending: false }).limit(1).maybeSingle()

        const userWeight = freshBody?.weight || 70
        const currentXP = freshProfile?.current_xp || 0
        const currentLevel = freshProfile?.level || 1

        // 5. Calcular XP
        const xpResult = calculateSessionXP(
          elapsedTime,
          exerciseTimers,
          enrichedLogs,
          workoutExercises,
          userWeight,
          history1RMs
        )

        const xpGained = xpResult.total

        // 6. Atualizar Sessão
        await supabase.from('workout_sessions')
          .update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: elapsedTime })
          .eq('id', sessionId)

        // 7. Atualizar Perfil (Level Up)
        const newTotalXP = currentXP + xpGained
        const newLevel = Math.floor(newTotalXP / 1000) + 1

        const { error: updateError } = await supabase.from('profiles').update({
          current_xp: newTotalXP,
          level: newLevel
        }).eq('id', clientWorkout.client_id)

        if (!updateError) {
          // Logs de Detalhes (Toasts sequenciais ou console)
          if (xpResult.details.length > 0) {
            console.log("XP Details:", xpResult.details)
            // Show top detail if exists
            xpResult.details.forEach(d => showSuccess(d))
          }

          setSummaryData({
            xpEarned: xpGained,
            currentXP: newTotalXP,
            newLevel: newLevel,
            oldLevel: currentLevel
          })
          setShowSummaryModal(true)
          if (refreshProfile) refreshProfile()
        } else {
          console.error('Erro update XP:', updateError)
          setSessionStatus('completed'); setIsSessionActive(false)
          setTimeout(() => { setSessionId(null); setElapsedTime(0); setSessionStatus('idle'); setExecutionLogs([]); setExerciseTimers({}); setActiveTimerId(null) }, 3000)
        }
      }
    } catch (error) { showError('Erro na sessão'); console.error(error) }
    finally { setSessionLoading(false) }
  }

  const handleCloseSummary = () => {
    setShowSummaryModal(false)
    setSessionStatus('completed')
    setIsSessionActive(false)
    setSessionId(null)
    setElapsedTime(0)
    setSessionStatus('idle')
    setExecutionLogs([])
  }

  const handleExerciseClick = (exercise: any) => {
    if (!isSessionActive || sessionStatus !== 'started') {
      showError('Por favor, inicie o treino para registrar exercícios.')
      return
    }

    const existingLog = executionLogs.find(log => log.workout_exercise_id === exercise.id)

    setSelectedExercise(exercise)
    setLogForm({
      weight: existingLog?.weight?.toString() || exercise.weight?.toString() || '',
      reps: existingLog?.reps?.toString() || exercise.reps?.toString() || '',
      notes: existingLog?.notes || ''
    })
    setIsLogModalOpen(true)
  }

  const handleSaveLog = async () => {
    if (!sessionId || !selectedExercise) return
    setSavingLog(true)
    try {
      const logData = {
        workout_session_id: sessionId,
        exercise_id: selectedExercise.exercise_id,
        workout_exercise_id: selectedExercise.id,
        weight: logForm.weight ? parseFloat(logForm.weight) : null,
        reps: logForm.reps ? parseInt(logForm.reps) : null,
        notes: logForm.notes,
        completed_at: new Date().toISOString()
      }

      // Check if already exists to update or insert
      const existingLog = executionLogs.find(log => log.workout_exercise_id === selectedExercise.id)

      let error
      if (existingLog) {
        const { error: upError } = await supabase
          .from('workout_execution_logs')
          .update(logData)
          .eq('id', existingLog.id)
        error = upError
      } else {
        const { error: inError } = await supabase
          .from('workout_execution_logs')
          .insert(logData)
        error = inError
      }

      if (error) throw error

      await fetchLogs(sessionId)
      await updateHeartbeat(sessionId) // Heartbeat on log

      // Auto-stop timer if it's running for this exercise
      if (activeTimerId && activeTimerId === selectedExercise.id) {
        await handleToggleTimer(selectedExercise.id)
      }

      setIsLogModalOpen(false)
      showSuccess('Registro salvo!')
    } catch (error) {
      showError('Erro ao salvar registro')
      console.error(error)
    } finally {
      setSavingLog(false)
    }
  }

  if (loading) return <div className="py-12 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div>

  const exercisesByDay = workoutExercises.reduce((acc: any, curr) => {
    if (!acc[curr.day_number]) acc[curr.day_number] = []
    acc[curr.day_number].push(curr)
    return acc
  }, {})

  return (
    <div className="space-y-6 pb-24">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
          <p className="text-2xl font-bold text-blue-500">{workoutExercises.length}</p>
          <p className="text-xs text-muted-foreground">Exercícios</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
          <p className="text-2xl font-bold text-green-500">{workoutExercises.reduce((s, i) => s + i.sets, 0)}</p>
          <p className="text-xs text-muted-foreground">Séries</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
          <p className="text-2xl font-bold text-purple-500">{clientWorkout.workout.days_per_week}</p>
          <p className="text-xs text-muted-foreground">Dias/Semana</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
          <p className="text-2xl font-bold text-orange-500"><BarChart3 className="h-6 w-6 mx-auto" /></p>
          <p className="text-xs text-muted-foreground">Estatísticas</p>
        </div>
      </div>

      {/* Tabs */}
      {/* Tabs */}
      <Card className="bg-card border-border backdrop-blur-md shadow-sm">
        <CardHeader><CardTitle className="text-foreground">Exercícios</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="day-1">
            <TabsList className="bg-muted w-full justify-start overflow-x-auto">
              {Object.keys(exercisesByDay).map(day => (
                <TabsTrigger key={day} value={`day-${day}`} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">
                  Dia {day}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.keys(exercisesByDay).map(day => (
              <TabsContent key={day} value={`day-${day}`} className="space-y-4 mt-4">
                {exercisesByDay[day].map((we: any) => {
                  return (
                    <WorkoutExerciseCard
                      key={we.id}
                      exercise={we}
                      executionLogs={executionLogs}
                      isSessionActive={isSessionActive && sessionStatus === 'started'}
                      activeTime={exerciseTimers[we.id] || 0}
                      isTimerRunning={activeTimerId === we.id}
                      onLogClick={handleExerciseClick}
                      onToggleTimer={handleToggleTimer}
                    />
                  )
                })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Player Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 border-t border-border backdrop-blur-xl p-4 pb-6 md:pb-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
            <div className="bg-muted p-2 rounded-lg"><Timer className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse" /></div>
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Tempo de Treino</p>
              <p className="text-xl md:text-2xl font-mono font-bold text-foreground tracking-widest">{formatTime(elapsedTime)}</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {!isSessionActive ? (
              <Button size="default" onClick={() => handleSessionAction('start')} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-8 h-12 md:h-11">
                {sessionLoading ? <Loader2 className="animate-spin" /> : <Play className="mr-2 h-5 w-5" />} Iniciar
              </Button>
            ) : (
              <>
                {sessionStatus === 'started' ? (
                  <Button size="default" variant="outline" onClick={() => handleSessionAction('pause')} className="flex-1 md:flex-none border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 h-12 md:h-11">
                    <Pause className="mr-2 h-5 w-5" /> Pausar
                  </Button>
                ) : (
                  <Button size="default" onClick={() => handleSessionAction('resume')} className="flex-1 md:flex-none bg-blue-500 text-white hover:bg-blue-600 h-12 md:h-11">
                    <Play className="mr-2 h-5 w-5" /> Retomar
                  </Button>
                )}
                <Button size="default" variant="destructive" onClick={() => handleSessionAction('finish')} className="flex-1 md:flex-none bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white h-12 md:h-11">
                  <Square className="mr-2 h-5 w-5 fill-current" /> Finalizar
                </Button>
              </>
            )}

            {sessionStatus === 'abandoned' && (
              <Button size="default" disabled className="w-full md:w-auto bg-gray-500/20 text-gray-500 border border-gray-500/50 h-12 md:h-11">
                <Square className="mr-2 h-5 w-5 fill-current" /> Treino Abandonado
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Log Modal */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Registrar Execução</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedExercise?.exercise?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-muted-foreground">Carga (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="0"
                  value={logForm.weight}
                  onChange={e => setLogForm({ ...logForm, weight: e.target.value })}
                  className="bg-muted border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps" className="text-muted-foreground">Repetições</Label>
                <Input
                  id="reps"
                  type="number"
                  placeholder="0"
                  value={logForm.reps}
                  onChange={e => setLogForm({ ...logForm, reps: e.target.value })}
                  className="bg-muted border-border text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-muted-foreground">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Como foi a série? (Opcional)"
                value={logForm.notes}
                onChange={e => setLogForm({ ...logForm, notes: e.target.value })}
                className="bg-muted border-border text-foreground"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end sm:justify-between">
            {executionLogs.some(l => l.workout_exercise_id === selectedExercise?.id) && (
              <Button
                variant="destructive"
                onClick={async () => {
                  if (confirm('Tem certeza que deseja remover este registro?')) {
                    const logId = executionLogs.find(l => l.workout_exercise_id === selectedExercise?.id)?.id
                    if (logId) {
                      setSavingLog(true)
                      try {
                        const { error } = await supabase.from('workout_execution_logs')
                          .delete()
                          .match({ workout_session_id: sessionId, workout_exercise_id: selectedExercise.id }) // Delete ALL for this exercise/session

                        if (error) throw error

                        // Update local state immediately by REMOVING ALL that match
                        setExecutionLogs(prev => prev.filter(l => l.workout_exercise_id !== selectedExercise.id))

                        // Also fetch to be safe (optional, but good for consistency)
                        fetchLogs(sessionId!)

                        setIsLogModalOpen(false)
                        showSuccess('Registro removido.')
                      } catch (e) { showError('Erro ao remover'); console.error(e) }
                      finally { setSavingLog(false) }
                    }
                  }
                }}
                disabled={savingLog}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsLogModalOpen(false)} className="border-border text-muted-foreground hover:bg-muted hover:text-foreground">Cancelar</Button>
              <Button onClick={handleSaveLog} disabled={savingLog} className="bg-green-600 hover:bg-green-700 text-white">
                {savingLog ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WorkoutSummaryModal
        isOpen={showSummaryModal}
        onClose={handleCloseSummary}
        xpEarned={summaryData.xpEarned}
        currentXP={summaryData.currentXP}
        newLevel={summaryData.newLevel}
        oldLevel={summaryData.oldLevel}
      />
    </div>
  )
}

export default WorkoutDetailView