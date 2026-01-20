
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { ActiveWorkoutSession } from '@/components/client/ActiveWorkoutSession'
import { WorkoutSummaryModal } from '@/components/gamification/WorkoutSummaryModal'
import { Loader2 } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { calculateSessionXP } from '@/utils/xpCalculator'
import { calculateOneRM, getCanonicalExerciseId } from '@/utils/strength'
import { useAuth } from '@/contexts/AuthContext'

const ActiveSessionPage = () => {
    const { sessionId } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { refreshProfile } = useAuth()

    // Logic for Day filter
    const activeDayNumber = parseInt(searchParams.get('day') || '1')

    const [loading, setLoading] = useState(true)
    const [exercises, setExercises] = useState<any[]>([])
    const [executionLogs, setExecutionLogs] = useState<any[]>([])
    const [historyLogs, setHistoryLogs] = useState<any[]>([])

    // Session State
    const [sessionData, setSessionData] = useState<any>(null)
    const [clientWorkout, setClientWorkout] = useState<any>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

    // Timers
    const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
    const [exerciseTimers, setExerciseTimers] = useState<any>({})

    // Rest Timer
    const [restTimerOpen, setRestTimerOpen] = useState(false)
    const [restTimerSeconds, setRestTimerSeconds] = useState(0)
    const [totalRestSeconds, setTotalRestSeconds] = useState(60)
    const [restTargetTime, setRestTargetTime] = useState<number | null>(null)
    const [lastRestExId, setLastRestExId] = useState<string | null>(null)

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    // Rest Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (restTargetTime) {
            interval = setInterval(() => {
                const now = Date.now()
                const remaining = Math.ceil((restTargetTime - now) / 1000)

                if (remaining <= 0) {
                    setRestTimerSeconds(0)
                    setRestTargetTime(null)
                    setRestTimerOpen(false)

                    // Notify
                    try {
                        // ... notification logic ...
                        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
                        audio.play().catch((e) => console.log("Audio Permission/Autoplay Blocked", e))
                        if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300])

                        if (Notification.permission === 'granted') {
                            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                                navigator.serviceWorker.ready.then(registration => {
                                    registration.showNotification("CapiFit", { body: "Descanso finalizado!", icon: '/favicon.ico', vibrate: [300, 100, 300] })
                                })
                            } else {
                                new Notification("CapiFit", { body: "Descanso finalizado!", vibrate: [300, 100, 300] })
                            }
                        }
                    } catch (e) { console.error(e) }

                    // Auto-Resume
                    if (lastRestExId) {
                        handleToggleTimer(lastRestExId)
                        setLastRestExId(null)
                        // Note: We don't actively clear _rt from DB here to avoid extra calls/race conditions.
                        // Expired _rt is ignored by init logic.
                    }
                } else {
                    setRestTimerSeconds(remaining)
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [restTargetTime, lastRestExId])


    // Gamification
    const [showSummaryModal, setShowSummaryModal] = useState(false)
    const [summaryData, setSummaryData] = useState({ xpEarned: 0, currentXP: 0, newLevel: 1, oldLevel: 1, workoutName: '', durationSeconds: 0, totalLoadKg: 0 })

    // Fetch All Data
    useEffect(() => {
        if (!sessionId) return

        const init = async () => {
            setLoading(true)
            try {
                // 1. Get Session
                const { data: session, error: sessError } = await supabase
                    .from('workout_sessions')
                    .select('*, client_workout:client_workouts(*, workout:workouts(*))')
                    .eq('id', sessionId)
                    .single()

                if (sessError || !session) throw new Error("Sessão não encontrada")

                setSessionData(session)
                setClientWorkout(session.client_workout)

                // 2. Load Exercises
                const { data: exs } = await supabase.from('workout_exercises')
                    .select(`*, exercise:exercises_library(*)`)
                    .eq('workout_id', session.workout_id)
                    .order('day_number').order('order_index')

                const allExercises = (exs || []).filter(i => i.exercise !== null)
                // Filter for current day!
                // If day is not passed, maybe infer from something? For now rely on URL.
                setExercises(allExercises.filter(e => e.day_number === activeDayNumber))

                // 3. Load Logs
                const { data: logs } = await supabase
                    .from('workout_execution_logs')
                    .select('*, exercise:exercises_library(*)')
                    .eq('workout_session_id', sessionId)
                setExecutionLogs(logs || [])

                // 4. Load History (Optimization: only for displayed exercises)
                const dayExIds = [...new Set(allExercises.filter(e => e.day_number === activeDayNumber).map(e => e.exercise_id))]
                if (dayExIds.length > 0) {
                    const { data: hist } = await supabase
                        .from('workout_execution_logs')
                        .select('*')
                        .in('exercise_id', dayExIds)
                        .order('created_at', { ascending: false })
                        .limit(200)
                    setHistoryLogs(hist || [])
                }

                // 5. Restore Timer State
                // 5. Restore Timer State
                let loadedTimers = (session.exercise_timers_state as any) || {}

                // Restore Persistent Rest Timer
                const savedRt = loadedTimers['_rt']
                const savedRre = loadedTimers['_rre']
                if (savedRt && savedRt > Date.now()) {
                    setRestTargetTime(savedRt)
                    setLastRestExId(savedRre || null)
                    setRestTimerOpen(true)
                    setTotalRestSeconds(60) // Default fallback or derive? The UI adapts.
                }

                if (session.status === 'started' && session.active_timer_id && session.active_timer_started_at) {
                    const activeStart = new Date(session.active_timer_started_at).getTime()
                    const now = Date.now()
                    const additionalSeconds = Math.max(0, Math.floor((now - activeStart) / 1000))
                    const currentTotal = (loadedTimers[session.active_timer_id] || 0) + additionalSeconds
                    loadedTimers[session.active_timer_id] = currentTotal
                    setActiveTimerId(session.active_timer_id)
                }
                setExerciseTimers(loadedTimers)

                // Session Main Timer
                if (session.status === 'started') {
                    const startDetails = new Date(session.started_at).getTime()
                    setSessionStartTime(startDetails)
                    setElapsedTime(Math.max(0, Math.floor((Date.now() - startDetails) / 1000)))
                } else {
                    setElapsedTime(session.duration_seconds || 0)
                }

            } catch (err) {
                console.error(err)
                showError("Erro ao carregar sessão")
                navigate(-1)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [sessionId])


    // Global Session Timer
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (sessionData?.status === 'started' && sessionStartTime) {
            interval = setInterval(() => {
                const now = Date.now()
                setElapsedTime(Math.max(0, Math.floor((now - sessionStartTime) / 1000)))
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [sessionData, sessionStartTime])

    // Update DB Heartbeat occasionally or on unload? (Skipping for robust simplicity, relies on actions)

    // Rest Timer Effect moved to bottom to access handlers

    // Exercise Timer Ticker
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (activeTimerId && sessionData?.status === 'started') {
            interval = setInterval(() => {
                setExerciseTimers(prev => ({ ...prev, [activeTimerId]: (prev[activeTimerId] || 0) + 1 }))
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [activeTimerId, sessionData])

    // Actions
    const handleToggleTimer = async (exerciseId: string) => {
        if (!sessionId || sessionData?.status !== 'started') {
            showError("Inicie o treino para cronometrar.")
            return
        }
        const now = new Date()
        let updatePayload: any = {}
        let newTimersVal = { ...exerciseTimers }

        if (activeTimerId) {
            const elapsed = exerciseTimers[activeTimerId] || 0
            newTimersVal[activeTimerId] = elapsed
            updatePayload.exercise_timers_state = newTimersVal
            updatePayload.active_timer_id = null
            updatePayload.active_timer_started_at = null

            if (activeTimerId === exerciseId) {
                setActiveTimerId(null)
            } else {
                updatePayload.active_timer_id = exerciseId
                updatePayload.active_timer_started_at = now.toISOString()
                setActiveTimerId(exerciseId)
            }
        } else {
            updatePayload.active_timer_id = exerciseId
            updatePayload.active_timer_started_at = now.toISOString()
            setActiveTimerId(exerciseId)
        }

        await supabase.from('workout_sessions').update(updatePayload).eq('id', sessionId)
        setExerciseTimers(newTimersVal) // Optimistic update
    }

    const handleSaveLog = async (exerciseId: string, setIndex: number, weight: number, reps: number, isCompleted: boolean) => {
        // Audio/Notification Permission Warmup (Triggered by user click)
        if (Notification.permission === 'default') {
            Notification.requestPermission()
        }
        try {
            // Play silent buffer to unlock audio context on mobile for later
            new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAgZGF0YQAAAAA=').play().catch(() => { })
        } catch (e) { }

        // Find existing log at this index
        const relevantLogs = executionLogs.filter(l => l.workout_exercise_id === exerciseId)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        const existingLog = relevantLogs[setIndex - 1]

        const workoutExercise = exercises.find(e => e.id === exerciseId)

        const logData = {
            workout_session_id: sessionId,
            workout_exercise_id: exerciseId,
            exercise_id: workoutExercise?.exercise_id,
            weight,
            reps,
            completed_at: new Date().toISOString()
        }

        try {
            if (existingLog) {
                if (!isCompleted) {
                    await supabase.from('workout_execution_logs').delete().eq('id', existingLog.id)
                    setExecutionLogs(p => p.filter(l => l.id !== existingLog.id))
                } else {
                    const { data } = await supabase.from('workout_execution_logs').update(logData).eq('id', existingLog.id).select().single()
                    if (data) setExecutionLogs(p => p.map(l => l.id === data.id ? { ...l, ...data, exercise: workoutExercise?.exercise } : l))
                }
            } else if (isCompleted) {
                const { data } = await supabase.from('workout_execution_logs').insert(logData).select().single()
                if (data) setExecutionLogs(p => [...p, { ...data, exercise: workoutExercise?.exercise }])
            }

            // Rest Timer Logic
            if (isCompleted) {
                const restTime = workoutExercise?.rest_time_seconds || 60
                const targetTime = Date.now() + restTime * 1000
                const resumeId = activeTimerId === exerciseId ? exerciseId : null // Resume if running

                let updatePayload: any = {}
                let newTimers = { ...exerciseTimers }

                // 1. Pause Active Timer (Atomic Manual Update)
                if (activeTimerId === exerciseId) {
                    const activeStartStr = sessionData?.active_timer_started_at
                    if (activeStartStr) {
                        const activeStart = new Date(activeStartStr).getTime()
                        const additional = Math.max(0, Math.floor((Date.now() - activeStart) / 1000))
                        newTimers[exerciseId] = (newTimers[exerciseId] || 0) + additional
                    }
                    updatePayload.active_timer_id = null
                    updatePayload.active_timer_started_at = null
                    setActiveTimerId(null) // Optimistic
                }

                // 2. Persist Rest State in JSONB
                newTimers['_rt'] = targetTime
                newTimers['_rre'] = resumeId

                updatePayload.exercise_timers_state = newTimers

                // 3. Local State Updates
                setRestTargetTime(targetTime)
                setLastRestExId(resumeId)
                setTotalRestSeconds(restTime)
                setRestTimerSeconds(restTime)
                setRestTimerOpen(true)
                setExerciseTimers(newTimers)

                // 4. DB Update
                await supabase.from('workout_sessions').update(updatePayload).eq('id', sessionId)
            }
        } catch (e) {
            console.error(e)
            showError("Erro ao salvar")
        }
    }

    const handleFinish = async () => {
        if (!sessionId || !clientWorkout) return

        setLoading(true)
        try {
            // Validate basic constraints
            if (elapsedTime < 60 || executionLogs.length === 0) {
                await supabase.from('workout_sessions')
                    .update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: elapsedTime })
                    .eq('id', sessionId)
                showSuccess('Treino finalizado! (Curto demais para XP)')
                navigate(-1)
                return
            }

            // Calculations
            const enrichedLogs = executionLogs.map(log => {
                const exerciseDef = exercises.find(we => we.id === log.workout_exercise_id)
                return {
                    ...log,
                    exercise: { name: exerciseDef?.exercise?.name || log.exercise?.name || '' },
                    exercise_id: exerciseDef?.exercise_id || log.exercise_id
                }
            })

            // 1RMs
            const performedIds = [...new Set(enrichedLogs.map(l => l.exercise_id).filter(Boolean))] as string[]
            let history1RMs: Record<string, number> = {}
            // We can use the historyLogs state we fetched!
            historyLogs.forEach(h => {
                const exName = exercises.find(e => e.exercise_id === h.exercise_id)?.exercise?.name || ''
                const cId = getCanonicalExerciseId(exName)
                if (cId) {
                    const rm = calculateOneRM(h.weight, h.reps)
                    if (rm > (history1RMs[cId] || 0)) history1RMs[cId] = rm
                }
            })

            // Profile Data
            const { data: profile } = await supabase.from('profiles').select('current_xp, level').eq('id', clientWorkout.client_id).single()
            const { data: body } = await supabase.from('biometric_data').select('weight').eq('client_id', clientWorkout.client_id).limit(1).maybeSingle()

            const xpResult = calculateSessionXP(
                elapsedTime,
                exerciseTimers, // Note: We inherited these from DB but we didn't actively update them in this page unless we implemented the timer logic. 
                // Logic hole: Actively timing exercises in this view? 
                // `ActiveWorkoutSession` doesn't seem to have a "Start Timer" button for exercises, only Main Timer. 
                // So XP calc based on 'exerciseTimers' might be 0 for this session if user only uses this view.
                // Acceptable for now.
                enrichedLogs,
                exercises,
                body?.weight || 70,
                history1RMs
            )

            const xpGained = xpResult.total
            const newXP = (profile?.current_xp || 0) + xpGained
            const newLevel = Math.floor(newXP / 1000) + 1

            await supabase.from('workout_sessions')
                .update({ status: 'completed', ended_at: new Date().toISOString(), duration_seconds: elapsedTime })
                .eq('id', sessionId)

            await supabase.from('profiles').update({ current_xp: newXP, level: newLevel }).eq('id', clientWorkout.client_id)

            setSummaryData({
                xpEarned: xpGained,
                currentXP: newXP,
                newLevel,
                oldLevel: profile?.level || 1,
                workoutName: clientWorkout.workout?.name || 'Treino',
                durationSeconds: elapsedTime,
                totalLoadKg: enrichedLogs.reduce((a, l) => a + (l.weight || 0) * (l.reps || 0), 0)
            })

            setShowSummaryModal(true)
            if (refreshProfile) refreshProfile()

        } catch (e) {
            console.error(e)
            showError("Erro ao finalizar")
        } finally {
            setLoading(false)
        }
    }


    // Rest Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (restTargetTime) {
            interval = setInterval(() => {
                const now = Date.now()
                const remaining = Math.ceil((restTargetTime - now) / 1000)

                if (remaining <= 0) {
                    setRestTimerSeconds(0)
                    setRestTargetTime(null)
                    setRestTimerOpen(false)

                    // Notify
                    try {
                        // Sound & Vibration
                        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
                        audio.play().catch((e) => console.log("Audio Permission/Autoplay Blocked", e))

                        if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300])

                        // System Notification
                        if (Notification.permission === 'granted') {
                            // Try Service Worker registration first if available (better for Android)
                            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                                navigator.serviceWorker.ready.then(registration => {
                                    registration.showNotification("CapiFit", {
                                        body: "Descanso finalizado!",
                                        icon: '/favicon.ico',
                                        vibrate: [300, 100, 300]
                                    })
                                })
                            } else {
                                new Notification("CapiFit", {
                                    body: "Descanso finalizado!",
                                    vibrate: [300, 100, 300]
                                })
                            }
                        }
                    } catch (e) {
                        console.error("Notify error", e)
                    }

                    // Auto-Resume
                    if (lastRestExId) {
                        handleToggleTimer(lastRestExId)
                        setLastRestExId(null)
                    }
                } else {
                    setRestTimerSeconds(remaining)
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [restTargetTime, lastRestExId])




    return (
        <div className="min-h-screen bg-background relative">
            <WorkoutSummaryModal
                isOpen={showSummaryModal}
                onClose={() => navigate(-1)} // Go back when closing summary
                xpEarned={summaryData.xpEarned}
                currentXP={summaryData.currentXP}
                newLevel={summaryData.newLevel}
                oldLevel={summaryData.oldLevel}
                workoutName={summaryData.workoutName}
                durationSeconds={summaryData.durationSeconds}
                totalLoadKg={summaryData.totalLoadKg}
            />

            <ActiveWorkoutSession
                isOpen={true} // Always open in this page
                onMinimize={() => navigate(-1)} // Back button behavior
                exercises={exercises}
                executionLogs={executionLogs}
                historyLogs={historyLogs}
                onSaveLog={handleSaveLog}
                onFinishWorkout={handleFinish}
                restTimerOpen={restTimerOpen}
                setRestTimerOpen={setRestTimerOpen}
                restTimerSeconds={restTimerSeconds}
                setRestTimerSeconds={setRestTimerSeconds}
                totalRestSeconds={totalRestSeconds}

                // Timer Props
                activeTimerId={activeTimerId}
                exerciseTimers={exerciseTimers}
                onToggleTimer={handleToggleTimer}
                isSessionActive={sessionData?.status === 'started'}
            />
        </div>
    )
}

export default ActiveSessionPage
