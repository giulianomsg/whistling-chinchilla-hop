import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog'
import {
  Timer, Play, Pause, Square, Loader2, BarChart3,
  Save, Trash2, Plus, Search, X, Calendar as CalendarIcon
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'
import { useAuth } from '@/contexts/AuthContext'
import { WorkoutSummaryModal } from '@/components/gamification/WorkoutSummaryModal'
import { WorkoutExerciseCard } from './WorkoutExerciseCard'
import { ActiveWorkoutSession } from './ActiveWorkoutSession'
import { calculateSessionXP } from '@/utils/xpCalculator'
import { calculateOneRM, getCanonicalExerciseId } from '@/utils/strength'
import { useSearchParams } from 'react-router-dom'

interface WorkoutDetailViewProps {
  clientWorkout: any
}

const WorkoutDetailView: React.FC<WorkoutDetailViewProps> = ({ clientWorkout }) => {
  const { refreshProfile } = useAuth()
  const [searchParams] = useSearchParams()

  // Day Persistence (Read Only here, navigation is handled by parent or headers hidden)
  const activeTab = searchParams.get('day') || 'day-1'
  const activeDayNumber = parseInt(activeTab.replace('day-', '')) || 1

  const [workoutExercises, setWorkoutExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Timer States
  const [exerciseTimers, setExerciseTimers] = useState<Record<string, number>>({})
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)

  // Session States
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'started' | 'paused' | 'completed' | 'abandoned'>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  // Logging States
  const [executionLogs, setExecutionLogs] = useState<any[]>([])
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<any>(null)
  const [logForm, setLogForm] = useState({ weight: '', reps: '', notes: '' })
  const [savingLog, setSavingLog] = useState(false)

  // Custom Exercise States
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  const [libraryExercises, setLibraryExercises] = useState<any[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [searchExTerm, setSearchExTerm] = useState('')

  // Gamification State
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [summaryData, setSummaryData] = useState({ xpEarned: 0, currentXP: 0, newLevel: 1, oldLevel: 1, workoutName: '', durationSeconds: 0, totalLoadKg: 0 })

  // Active Session Overlay State
  const [activeSessionOpen, setActiveSessionOpen] = useState(false)

  // Rest Timer State
  const [restTimerOpen, setRestTimerOpen] = useState(false)
  const [restTimerSeconds, setRestTimerSeconds] = useState(0)
  const [totalRestSeconds, setTotalRestSeconds] = useState(60)

  // History State
  const [historyLogs, setHistoryLogs] = useState<any[]>([])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const fetchLogs = async (currentSessionId: string) => {
    // UPDATED: Join with exercises_library to get names for ad-hoc exercises
    const { data } = await supabase
      .from('workout_execution_logs')
      .select('*, exercise:exercises_library(*)')
      .eq('workout_session_id', currentSessionId)
    setExecutionLogs(data || [])
  }

  const fetchLibrary = async () => {
    setLibraryLoading(true)
    const { data } = await supabase.from('exercises_library').select('*').eq('is_public', true).order('name')
    setLibraryExercises(data || [])
    setLibraryLoading(false)
  }

  const fetchHistory = async () => {
    // Determine all exercise IDs for the current workout
    if (workoutExercises.length === 0) return
    const exerciseIds = workoutExercises.map(e => e.exercise_id).filter(Boolean)

    if (exerciseIds.length > 0) {
      const { data } = await supabase
        .from('workout_execution_logs')
        .select('*')
        .in('exercise_id', exerciseIds)
        .order('created_at', { ascending: false })
        .limit(500) // Reasonable limit to get recent history

      setHistoryLogs(data || [])
    }
  }

  useEffect(() => {
    if (workoutExercises.length > 0) {
      fetchHistory()
    }
  }, [workoutExercises])

  useEffect(() => {
    if (isAddExerciseOpen && libraryExercises.length === 0) {
      fetchLibrary()
    }
  }, [isAddExerciseOpen])

  const updateHeartbeat = async (currentSessId: string) => {
    if (!currentSessId) return
    supabase.from('workout_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', currentSessId)
      .then(({ error }) => { if (error) console.error('Heartbeat fail', error) })
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
        .in('status', ['started', 'paused', 'abandoned']).order('created_at', { ascending: false }).limit(1).maybeSingle()

      if (session) {
        setSessionId(session.id)
        setSessionStatus(session.status as any)

        let loadedTimers = (session.exercise_timers_state as Record<string, number>) || {}

        if (session.status === 'started' && session.active_timer_id && session.active_timer_started_at) {
          const activeStart = new Date(session.active_timer_started_at).getTime()
          const now = Date.now()
          const additionalSeconds = Math.max(0, Math.floor((now - activeStart) / 1000))
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

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimerId && sessionStatus === 'started') {
      interval = setInterval(() => {
        setExerciseTimers(prev => ({ ...prev, [activeTimerId]: (prev[activeTimerId] || 0) + 1 }))
      }, 1000)
    }
    return () => clearInterval(interval)
    return () => clearInterval(interval)
  }, [activeTimerId, sessionStatus])

  // Rest Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (restTimerOpen && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev: number) => {
          if (prev <= 1) {
            setRestTimerOpen(false) // Auto close when done
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [restTimerOpen, restTimerSeconds])

  const handleToggleTimer = async (exerciseId: string) => {
    const isCompleted = executionLogs.some(log => log.workout_exercise_id === exerciseId)
    if (!isSessionActive || sessionStatus !== 'started' || !sessionId) {
      showError('Inicie o treino para cronometrar.')
      return
    }

    const now = new Date()
    let updatePayload: any = {}
    let newTimersVal = { ...exerciseTimers }

    if (activeTimerId) {
      const elapsedForActive = exerciseTimers[activeTimerId] || 0
      newTimersVal[activeTimerId] = elapsedForActive

      updatePayload.exercise_timers_state = newTimersVal
      updatePayload.active_timer_id = null
      updatePayload.active_timer_started_at = null

      if (activeTimerId === exerciseId) {
        setActiveTimerId(null)
      } else {
        if (isCompleted) {
          showError('Este exercício já foi concluído.')
          return
        }
        updatePayload.active_timer_id = exerciseId
        updatePayload.active_timer_started_at = now.toISOString()
        setActiveTimerId(exerciseId)
      }
    } else {
      if (isCompleted) {
        showError('Este exercício já foi concluído.')
        return
      }
      updatePayload.active_timer_id = exerciseId
      updatePayload.active_timer_started_at = now.toISOString()
      setActiveTimerId(exerciseId)
    }

    try {
      const { error } = await supabase.from('workout_sessions').update(updatePayload).eq('id', sessionId)
      if (error) throw error
    } catch (err) {
      console.error("Failed to persist timer", err)
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
        setSessionStartTime(Date.now())
        setExecutionLogs([])
        setActiveSessionOpen(true) // Open overlay on start
        showSuccess('Treino iniciado!')
      } else if (action === 'pause' && sessionId) {
        await supabase.from('workout_sessions').update({ status: 'paused', duration_seconds: elapsedTime, last_activity_at: new Date().toISOString() }).eq('id', sessionId)
        setSessionStatus('paused'); showSuccess('Pausado')
      } else if (action === 'resume' && sessionId) {
        const newStart = new Date(Date.now() - elapsedTime * 1000).toISOString()
        setSessionStartTime(Date.now() - elapsedTime * 1000)
        await supabase.from('workout_sessions').update({ status: 'started', started_at: newStart, last_activity_at: new Date().toISOString() }).eq('id', sessionId)
        await supabase.from('workout_sessions').update({ status: 'started', started_at: newStart, last_activity_at: new Date().toISOString() }).eq('id', sessionId)
        setSessionStatus('started'); showSuccess('Retomado')
        setActiveSessionOpen(true) // Open overlay on resume if desired
      } else if (action === 'finish' && sessionId) {
        if (elapsedTime < 60 || executionLogs.length === 0) {
          await supabase.from('workout_sessions')
            .update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: elapsedTime, last_activity_at: new Date().toISOString() })
            .eq('id', sessionId)

          setSessionStatus('completed'); setIsSessionActive(false)
          showSuccess('Treino finalizado! (Sem XP: muito curto ou sem registros)')
          setTimeout(() => { setSessionId(null); setElapsedTime(0); setSessionStatus('idle'); setExecutionLogs([]) }, 3000)
          return
        }

        const enrichedLogs = executionLogs.map(log => {
          const exerciseDef = workoutExercises.find(we => we.id === log.workout_exercise_id)
          // For AdHoc, exerciseDef is undefined, so we use log.exercise.name
          return {
            ...log,
            exercise: { name: exerciseDef?.exercise?.name || log.exercise?.name || '' },
            exercise_id: exerciseDef?.exercise_id || log.exercise_id
          }
        })

        const performedExLibraryIds = [...new Set(enrichedLogs.map(l => l.exercise_id).filter(Boolean))] as string[]

        let history1RMs: Record<string, number> = {}

        if (performedExLibraryIds.length > 0) {
          const { data: historyData } = await supabase
            .from('workout_execution_logs')
            .select(`weight, reps, exercise_id, workout_session!inner(client_id)`)
            .eq('workout_session.client_id', clientWorkout.client_id)
            .in('exercise_id', performedExLibraryIds)

          if (historyData) {
            historyData.forEach((h: any) => {
              const exName = enrichedLogs.find(el => el.exercise_id === h.exercise_id)?.exercise?.name || ''
              const cId = getCanonicalExerciseId(exName)
              if (cId) {
                const rm = calculateOneRM(h.weight, h.reps)
                if (rm > (history1RMs[cId] || 0)) history1RMs[cId] = rm
              }
            })
          }
        }

        const { data: freshProfile } = await supabase.from('profiles').select('current_xp, level').eq('id', clientWorkout.client_id).single()
        const { data: freshBody } = await supabase.from('biometric_data').select('weight').eq('client_id', clientWorkout.client_id).order('date', { ascending: false }).limit(1).maybeSingle()

        const userWeight = freshBody?.weight || 70
        const currentXP = freshProfile?.current_xp || 0
        const currentLevel = freshProfile?.level || 1

        const xpResult = calculateSessionXP(
          elapsedTime,
          exerciseTimers,
          enrichedLogs,
          workoutExercises,
          userWeight,
          history1RMs
        )

        const xpGained = xpResult.total

        await supabase.from('workout_sessions')
          .update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: elapsedTime })
          .eq('id', sessionId)

        const newTotalXP = currentXP + xpGained
        const newLevel = Math.floor(newTotalXP / 1000) + 1

        const { error: updateError } = await supabase.from('profiles').update({
          current_xp: newTotalXP,
          level: newLevel
        }).eq('id', clientWorkout.client_id)

        if (!updateError) {
          if (xpResult.details.length > 0) {
            xpResult.details.forEach(d => showSuccess(d))
          }

          const totalLoadKg = enrichedLogs.reduce((acc, log) => acc + (log.weight || 0) * (log.reps || 0), 0)

          setSummaryData({
            xpEarned: xpGained,
            currentXP: newTotalXP,
            newLevel: newLevel,
            oldLevel: currentLevel,
            workoutName: clientWorkout.workout.name,
            durationSeconds: elapsedTime,
            totalLoadKg: totalLoadKg
          })
          setShowSummaryModal(true)
          if (refreshProfile) refreshProfile()
        } else {
          console.error('Erro update XP:', updateError)
          setSessionStatus('completed'); setIsSessionActive(false); setActiveSessionOpen(false)
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

  const handleAdHocLogClick = (log: any) => {
    const mockExercise = {
      id: log.workout_exercise_id || 'ADHOC_' + log.id,
      exercise_id: log.exercise_id,
      exercise: log.exercise,
      name: log.exercise?.name,
    }

    setSelectedExercise(mockExercise)
    setLogForm({
      weight: log.weight?.toString() || '',
      reps: log.reps?.toString() || '',
      notes: log.notes || ''
    })
    setIsLogModalOpen(true)
  }

  const handleSaveLog = async () => {
    if (!sessionId || !selectedExercise) return
    setSavingLog(true)
    try {
      const isAdHoc = selectedExercise.id?.toString().startsWith('ADHOC_') || !selectedExercise.id

      const logData = {
        workout_session_id: sessionId,
        exercise_id: selectedExercise.exercise_id,
        workout_exercise_id: isAdHoc ? null : selectedExercise.id,
        weight: logForm.weight ? parseFloat(logForm.weight) : null,
        reps: logForm.reps ? parseInt(logForm.reps) : null,
        notes: logForm.notes,
        completed_at: new Date().toISOString()
      }

      let existingLog
      if (isAdHoc && selectedExercise.id?.startsWith('ADHOC_')) {
        const realLogId = selectedExercise.id.replace('ADHOC_', '')
        existingLog = executionLogs.find(l => l.id === realLogId)
      } else if (!isAdHoc) {
        existingLog = executionLogs.find(log => log.workout_exercise_id === selectedExercise.id)
      } else {
        existingLog = executionLogs.find(l => l.exercise_id === selectedExercise.exercise_id && l.workout_exercise_id === null)
      }

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
      await updateHeartbeat(sessionId)

      if (activeTimerId && activeTimerId === selectedExercise.id) {
        await handleToggleTimer(selectedExercise.id)
      }

      // If completing a set, trigger Rest Timer
      // We check if we just saved a log (so it's "done")
      // In this dialog context, we just saved. 
      // But the ActiveSession calls onSaveLog directly. We need to unify logic or just let ActiveSession handle its own "Done" check.
      // BUT, ActiveSession uses this same logic via props? No, it passes its own onSaveLog.
      // Wait, ActiveSession will likely call a wrapped version of this. 
      // For the DIALOG (manual log), we might want to trigger timer too if it's considered "done".
      // But let's leave the Dialog behavior as is for now to avoid confusion, 
      // and add specific logic for ActiveWorkoutSession callback below.

      setIsLogModalOpen(false)
      setIsAddExerciseOpen(false)
      showSuccess('Registro salvo!')
    } catch (error) {
      showError('Erro ao salvar registro')
      console.error(error)
    } finally {
      setSavingLog(false)
    }
  }

  const handleAddCustomExerciseConfirm = async (exLibrary: any) => {
    if (!isSessionActive) {
      showError('Inicie o treino primeiro.')
      return
    }
    setSelectedExercise({
      exercise_id: exLibrary.id,
      exercise: exLibrary,
      id: null,
      name: exLibrary.name
    })
    setLogForm({ weight: '', reps: '', notes: '' })
    setIsLogModalOpen(true)
    setIsAddExerciseOpen(false)
  }

  // Active Session Handler
  const handleActiveSessionSaveLog = async (exerciseId: string, setIndex: number, weight: number, reps: number, isCompleted: boolean) => {
    if (!sessionId) return

    // Check if there is already a log for this set
    // We assume the caller knows what it's doing.
    // Ideally we find the existing log by matching exerciseId and setIndex or something, 
    // but our schema doesn't have setIndex strictly. 
    // We will just Insert or Update based on... what?
    // Current logic in `handleSaveLog` tries to find by workout_exercise_id.
    // If we have multiple logs for one exercise, how do we differentiate them?
    // The current `handleSaveLog` finds *any* log for that exercise. That's a bug for multiple sets!
    // It seems the current app only supports ONE log ("series") per exercise visually in the card view?
    // Looking at `WorkoutExerciseCard`: `executionLogs` are passed. `WorkoutExerciseCard` renders sets?
    // `WorkoutExerciseCard` maps `Array.from({ length: sets })` but implementation details were hidden in step 16 view.
    // Let's assume we need to handle multiple sets properly now.

    // We will try to find a log that matches the "order" in the list of logs for that exercise.
    const exerciseLogs = executionLogs.filter(l => l.workout_exercise_id === exerciseId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const existingLog = exerciseLogs[setIndex - 1] // 1-based index

    const logData = {
      workout_session_id: sessionId,
      workout_exercise_id: exerciseId,
      exercise_id: workoutExercises.find(we => we.id === exerciseId)?.exercise_id,
      weight,
      reps,
      completed_at: new Date().toISOString()
    }

    try {
      if (existingLog) {
        if (!isCompleted) {
          // If unchecking, maybe delete? Or just update? The UI toggle implies "Done".
          // If user unchecks, we might want to keep data but mark valid? Schema doesn't have "is_completed". 
          // Existence of log implies completion usually.
          // If we want to "remove" the log:
          await supabase.from('workout_execution_logs').delete().eq('id', existingLog.id)
        } else {
          await supabase.from('workout_execution_logs').update(logData).eq('id', existingLog.id)
        }
      } else {
        if (isCompleted) {
          await supabase.from('workout_execution_logs').insert(logData)
        }
      }

      await fetchLogs(sessionId)

      // Trigger Timer if completed
      if (isCompleted) {
        setRestTimerSeconds(60) // Default 60s
        setTotalRestSeconds(60)
        setRestTimerOpen(true)
      }

    } catch (e) {
      console.error(e)
      showError('Erro ao salvar série')
    }
  }

  if (loading) return <div className="py-12 text-center"><Loader2 className="animate-spin text-primary mx-auto" /></div>


  // Filter exercises strictly for the active day
  const displayedExercises = workoutExercises.filter(we => we.day_number === activeDayNumber)
  const extraExercises = executionLogs.filter(l => l.workout_exercise_id === null)
  const filteredLibrary = libraryExercises.filter(e => e.name.toLowerCase().includes(searchExTerm.toLowerCase())).slice(0, 10)

  return (
    <div className="space-y-6 pb-24 max-w-[100vw] overflow-x-hidden">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
          <p className="text-2xl font-bold text-blue-500">{workoutExercises.length}</p>
          <p className="text-xs text-muted-foreground">Total Exercícios</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg text-center shadow-sm">
          <p className="text-2xl font-bold text-green-500">{workoutExercises.filter(e => e.day_number === activeDayNumber).reduce((s: any, i: any) => s + i.sets, 0)}</p>
          <p className="text-xs text-muted-foreground">Séries Hoje</p>
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

      {/* Main Content Area: Active Day */}
      <Card className="bg-card border-border backdrop-blur-md shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground text-xl">Dia {activeDayNumber}</CardTitle>
              <p className="text-xs text-muted-foreground">{displayedExercises.length} exercícios programados</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsAddExerciseOpen(true)} disabled={!isSessionActive} className="gap-2">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Adicionar Extra</span>
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {displayedExercises.length > 0 ? (
              displayedExercises.map((we: any) => (
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
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum exercício programado para este dia.</p>
              </div>
            )}
          </div>

          {/* Extra Exercises Section */}
          {extraExercises.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2"><Plus className="h-4 w-4" /> Exercícios Extras / Livres</h4>
              <div className="space-y-4">
                {extraExercises.map((log: any) => {
                  const fakeWe = {
                    id: 'ADHOC_' + log.id,
                    exercise: log.exercise,
                    sets: 1,
                    reps: log.reps || 0,
                    weight: log.weight,
                    exercise_id: log.exercise_id
                  }
                  return (
                    <WorkoutExerciseCard
                      key={log.id}
                      exercise={fakeWe}
                      executionLogs={executionLogs.map(l => l.id === log.id ? { ...l, workout_exercise_id: fakeWe.id } : l)}
                      isSessionActive={isSessionActive && sessionStatus === 'started'}
                      activeTime={0}
                      isTimerRunning={false}
                      onLogClick={() => handleAdHocLogClick(log)}
                      onToggleTimer={() => { }}
                    />
                  )
                })}
              </div>
            </div>
          )}

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
                {sessionLoading ? <Loader2 className="animate-spin" /> : <Play className="mr-2 h-5 w-5" />} Iniciar Treino
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

            {isSessionActive && (
              <Button size="default" variant="secondary" onClick={() => setActiveSessionOpen(true)} className="flex-1 md:flex-none">
                Expandir Treino
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
              {selectedExercise?.exercise?.name || selectedExercise?.name}
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
            {executionLogs.some(l => l.workout_exercise_id === selectedExercise?.id || (selectedExercise?.id?.startsWith('ADHOC_') && l.id === selectedExercise.id.replace('ADHOC_', ''))) && (
              <Button
                variant="destructive"
                onClick={async () => {
                  if (confirm('Tem certeza que deseja remover este registro?')) {
                    const isAdHoc = selectedExercise?.id?.startsWith('ADHOC_')
                    const logId = isAdHoc ? selectedExercise.id.replace('ADHOC_', '') : executionLogs.find(l => l.workout_exercise_id === selectedExercise?.id)?.id

                    if (logId) {
                      setSavingLog(true)
                      try {
                        const { error } = await supabase.from('workout_execution_logs')
                          .delete()
                          .eq('id', logId)

                        if (error) throw error

                        setExecutionLogs(prev => prev.filter(l => l.id !== logId))
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

      {/* Add Custom Exercise Dialog */}
      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Adicionar Exercício Extra</DialogTitle>
            <DialogDescription>Selecione um exercício para adicionar ao treino de hoje.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar exercícios..."
                value={searchExTerm}
                onChange={e => setSearchExTerm(e.target.value)}
                className="pl-9 bg-muted border-border"
              />
            </div>
            <div className="h-[200px] overflow-y-auto border border-border rounded-md p-2 space-y-1">
              {libraryLoading ? (
                <div className="text-center py-4"><Loader2 className="animate-spin mx-auto h-5 w-5" /></div>
              ) : (
                filteredLibrary.length > 0 ? (
                  filteredLibrary.map(ex => (
                    <Button
                      key={ex.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2 hover:bg-muted"
                      onClick={() => handleAddCustomExerciseConfirm(ex)}
                    >
                      <div>
                        <div className="font-semibold">{ex.name}</div>
                        <div className="text-[10px] text-muted-foreground flex gap-1">
                          {ex.muscle_groups?.map((m: any) => <span key={m}>{m}</span>)}
                        </div>
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-8">Nenhum exercício encontrado.</div>
                )
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <WorkoutSummaryModal
        isOpen={showSummaryModal}
        onClose={handleCloseSummary}
        xpEarned={summaryData.xpEarned}
        currentXP={summaryData.currentXP}
        newLevel={summaryData.newLevel}
        oldLevel={summaryData.oldLevel}
        workoutName={summaryData.workoutName}
        durationSeconds={summaryData.durationSeconds}
        totalLoadKg={summaryData.totalLoadKg}
      />

      <ActiveWorkoutSession
        isOpen={activeSessionOpen}
        onMinimize={() => setActiveSessionOpen(false)}
        exercises={displayedExercises}
        executionLogs={executionLogs}
        historyLogs={historyLogs}
        onSaveLog={handleActiveSessionSaveLog}
        onFinishWorkout={() => handleSessionAction('finish')}
        restTimerOpen={restTimerOpen}
        setRestTimerOpen={setRestTimerOpen}
        restTimerSeconds={restTimerSeconds}
        setRestTimerSeconds={setRestTimerSeconds}
        totalRestSeconds={totalRestSeconds}
      />
    </div>
  )
}

export default WorkoutDetailView