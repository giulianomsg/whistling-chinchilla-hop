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
  CheckCircle, Circle, Save, List, Eye
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'
import { useAuth } from '@/contexts/AuthContext'
import { WorkoutSummaryModal } from '@/components/gamification/WorkoutSummaryModal'
import { WorkoutExerciseCard } from './WorkoutExerciseCard'

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
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'started' | 'paused' | 'completed'>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionLoading, setSessionLoading] = useState(false)

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const { data } = await supabase.from('workout_exercises')
        .select(`*, exercise:exercises_library(*)`).eq('workout_id', clientWorkout.workout_id)
        .order('day_number').order('order_index')
      setWorkoutExercises((data || []).filter(i => i.exercise !== null))

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
        fetchLogs(session.id)
      }
      setLoading(false)
    }
    loadData()
  }, [clientWorkout])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sessionStatus === 'started') {
      interval = setInterval(() => setElapsedTime(p => p + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [sessionStatus])

  // Active Exercise Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimerId && sessionStatus === 'started') {
      interval = setInterval(() => {
        setExerciseTimers(prev => ({
          ...prev,
          [activeTimerId]: (prev[activeTimerId] || 0) + 1
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTimerId, sessionStatus])

  const handleToggleTimer = (exerciseId: string) => {
    if (!isSessionActive || sessionStatus !== 'started') {
      showError('Inicie o treino para cronometrar.')
      return
    }

    if (activeTimerId === exerciseId) {
      // Stop current
      setActiveTimerId(null)
    } else {
      // Start new (switch)
      setActiveTimerId(exerciseId)
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
        setExecutionLogs([]) // Reset logs for new session
        showSuccess('Treino iniciado!')
      } else if (action === 'pause' && sessionId) {
        await supabase.from('workout_sessions').update({ status: 'paused', duration_seconds: elapsedTime }).eq('id', sessionId)
        setSessionStatus('paused'); showSuccess('Pausado')
      } else if (action === 'resume' && sessionId) {
        const newStart = new Date(Date.now() - elapsedTime * 1000).toISOString()
        await supabase.from('workout_sessions').update({ status: 'started', started_at: newStart }).eq('id', sessionId)
        setSessionStatus('started'); showSuccess('Retomado')
      } else if (action === 'finish' && sessionId) {
        // --- LÓGICA DE XP CORRIGIDA (v2) ---

        // 1. Validação de Tempo e Atividade
        // Regra: Treino < 1 min ou sem logs = 0 XP
        if (elapsedTime < 60 || executionLogs.length === 0) {
          await supabase.from('workout_sessions')
            .update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: elapsedTime })
            .eq('id', sessionId)

          setSessionStatus('completed'); setIsSessionActive(false)
          showSuccess('Treino finalizado! (Sem XP: muito curto ou sem registros)')
          setTimeout(() => { setSessionId(null); setElapsedTime(0); setSessionStatus('idle'); setExecutionLogs([]) }, 3000)
          return
        }

        // 2. Finalizar Sessão
        await supabase.from('workout_sessions')
          .update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: elapsedTime })
          .eq('id', sessionId)

        // 3. Buscar dados FRESH do banco
        const { data: freshProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('current_xp, level')
          .eq('id', clientWorkout.client_id)
          .single()

        if (!fetchError && freshProfile) {
          // Fórmula:
          // Tempo: 2 XP por minuto de TEMPO ATIVO (stopwatches) OU Tempo total se não houver stopwatches usados?
          // User requested: "Utilizar o 'Tempo Total do Treino' calculado (agregado) como variável input"

          const totalActiveWorkTime = Object.values(exerciseTimers).reduce((a, b) => a + b, 0)

          // Se o usuário usou os timers, usa a soma. Se não usou (zero), usa o tempo decorrido da sessão como fallback (ou 0?)
          // "O timer deve contabilizar o tempo de execução... Calcular o Tempo Total... através da somatória"
          // Let's use the sum of timers. If 0, maybe they didn't use the feature. But let's act strict or generous?
          // Generous fallback: if aggregate is very low (< 1 min) but session was long, maybe use session time * 0.5 factor?
          // Let's stick to the request: "Calculated 'Total Workout Time' by summing the individual times"

          const effectiveTimeToCheck = totalActiveWorkTime > 60 ? totalActiveWorkTime : elapsedTime

          const timeXP = Math.min(Math.floor(effectiveTimeToCheck / 60) * 2, 180)
          const workXP = executionLogs.length * 15
          const totalExercises = workoutExercises.length
          const bonusXP = (executionLogs.length >= totalExercises && totalExercises > 0) ? 50 : 0

          const xpGained = timeXP + workXP + bonusXP

          const currentXP = freshProfile.current_xp || 0
          const newTotalXP = currentXP + xpGained
          const newLevel = Math.floor(newTotalXP / 1000) + 1

          // 4. Atualizar Banco
          const { error: updateError } = await supabase.from('profiles').update({
            current_xp: newTotalXP,
            level: newLevel
          }).eq('id', clientWorkout.client_id)

          if (!updateError) {
            // 5. Feedback via Modal
            setSummaryData({
              xpEarned: xpGained,
              currentXP: newTotalXP,
              newLevel: newLevel,
              oldLevel: freshProfile.level || 1
            })
            setShowSummaryModal(true)

            if (refreshProfile) refreshProfile()
          } else {
            console.error('Erro update XP:', updateError)
            setSessionStatus('completed'); setIsSessionActive(false)
            setTimeout(() => { setSessionId(null); setElapsedTime(0); setSessionStatus('idle'); setExecutionLogs([]); setExerciseTimers({}); setActiveTimerId(null) }, 3000)
          }
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogModalOpen(false)} className="border-border text-muted-foreground hover:bg-muted hover:text-foreground">Cancelar</Button>
            <Button onClick={handleSaveLog} disabled={savingLog} className="bg-green-600 hover:bg-green-700 text-white">
              {savingLog ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Registro
            </Button>
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