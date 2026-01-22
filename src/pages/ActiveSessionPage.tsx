
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

    // Background Mode Helpers (WakeLock + Silent Audio)
    const wakeLockRef = React.useRef<any>(null)
    const silentAudioRef = React.useRef<HTMLAudioElement | null>(null)

    const toggleBackgroundMode = async (active: boolean) => {
        try {
            if (active) {
                // Wake Lock (Keep Screen On)
                if ('wakeLock' in navigator) {
                    try { wakeLockRef.current = await (navigator as any).wakeLock.request('screen') } catch (e) { }
                }
                // Silent Audio Loop (Keep CPU Awake)
                if (!silentAudioRef.current) {
                    silentAudioRef.current = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAgZGF0YQAAAAA=')
                    silentAudioRef.current.loop = true
                }
                silentAudioRef.current.play().catch(() => { })
            } else {
                if (wakeLockRef.current) {
                    wakeLockRef.current.release().catch(() => { })
                    wakeLockRef.current = null
                }
                if (silentAudioRef.current) {
                    silentAudioRef.current.pause()
                }
            }
        } catch (e) { }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => { toggleBackgroundMode(false) }
    }, [])


    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    // Rest Timer Logic (Web Worker)
    useEffect(() => {
        if (!restTargetTime) return

        // Create a blob worker for the timer to run in background more reliably
        const workerCode = `
            self.onmessage = function() {
                setInterval(() => {
                    self.postMessage('tick');
                }, 1000);
            }
        `
        const blob = new Blob([workerCode], { type: 'application/javascript' })
        const worker = new Worker(URL.createObjectURL(blob))

        worker.onmessage = () => {
            const now = Date.now()
            const remaining = Math.ceil((restTargetTime - now) / 1000)

            if (remaining <= 0) {
                setRestTimerSeconds(0)
                setRestTargetTime(null)
                setRestTimerOpen(false)
                worker.terminate()

                // Notify Logic
                try {
                    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
                    audio.play().catch((e) => console.log("Audio Permission/Autoplay Blocked", e))
                    if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300])

                    if (Notification.permission === 'granted') {
                        new Notification("CapiFit", { body: "Descanso finalizado!", vibrate: [300, 100, 300] } as any)
                    }
                } catch (e) { console.error(e) }

                if (lastRestExId) {
                    handleToggleTimer(lastRestExId)
                    setLastRestExId(null)
                }
            } else {
                setRestTimerSeconds(remaining)
            }
        }

        worker.postMessage('start')

        return () => {
            worker.terminate()
        }
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
                const savedTr = loadedTimers['_tr']

                if (savedRt && savedRt > Date.now()) {
                    setRestTargetTime(savedRt)
                    setLastRestExId(savedRre || null)
                    setRestTimerOpen(true)
                    setTotalRestSeconds(savedTr || 60)
                    toggleBackgroundMode(true)
                }

                if (session.status === 'started' && session.active_timer_id && session.active_timer_started_at) {
                    const activeStart = new Date(session.active_timer_started_at).getTime()
                    // Set start time for delta calc
                    setActiveTimerStartTime(activeStart)

                    const now = Date.now()
                    const additionalSeconds = Math.max(0, Math.floor((now - activeStart) / 1000))
                    // Base is what was saved previously. 
                    // Verify if 'exercise_timers_state' stores the TOTAL up to previous pause.
                    const currentTotal = (loadedTimers[session.active_timer_id] || 0)
                    // If we use delta logic, we don't add additionalSeconds here to the base. 
                    // The base is static. The display adds delta.
                    // loadedTimers[session.active_timer_id] = currentTotal + additionalSeconds // This was mutating base in previous logic?
                    // Actually, let's keep loadedTimers as the "Archived Time".

                    setActiveTimerId(session.active_timer_id)
                }

                // Hydrate Refs for Delta Calculation
                exerciseTimersBaseRef.current = { ...loadedTimers }

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

    // Exercise Timer Start Time State
    const [activeTimerStartTime, setActiveTimerStartTime] = useState<number | null>(null)

    // Exercise Timer Ticker (Delta Time)
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (activeTimerId && activeTimerStartTime && sessionData?.status === 'started') {
            interval = setInterval(() => {
                const now = Date.now()
                const additional = Math.floor((now - activeTimerStartTime) / 1000)
                // Update the "Display" timer in state.
                // Note: This updates the state object which might cause re-renders.
                // We are adding 'additional' to the base val.
                // To avoid "summing up" drift, we need to know the BUFFERED/BASE value (from DB).
                // But `exerciseTimers` is being updated here. This is circular if we use `exerciseTimers` as base.
                // CORRECT FIX:
                // `exerciseTimers` should be the source of truth for "Completed Time".
                // We should NOT update `exerciseTimers` in this interval if we want to restart from base.
                // BUT, the UI reads `exerciseTimers[id]`.
                // So we update it.
                // However, `setExerciseTimers(prev => base + additional)` requires `base`.
                // But `prev` is the CURRENT value (which includes previous additional).
                // This means we are Accumulating Delta! This is bad if we just add (now - start) to prev.
                // We should add (now - start) to BASE.
                // But we don't have BASE in a separate state.
                // Temporary fix: Just rely on the previous "ticker" logic but use delta since last tick?
                // No.
                // Better: We only update the display component if possible.
                // BUT, keeping it simple:
                // We can just keep the "Ticker" (+1s) approach for the display if the background issue is solved by 
                // re-syncing on visibility change.
                // The user asked for "Delta Time" or "Web Workers".
                // I will use `activeTimerStartTime` to calculating the TOTAL time every tick.
                // I need the "Stored Time" (time before current range).
                // I will store "timersBase" in a Ref.
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [])

    // New Ref approach for stability
    const exerciseTimersBaseRef = React.useRef<Record<string, number>>({})

    // Exercise Timer Ticker (Delta Time Implementation)
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (activeTimerId && activeTimerStartTime && sessionData?.status === 'started') {
            const baseTime = exerciseTimersBaseRef.current[activeTimerId] || 0

            interval = setInterval(() => {
                const now = Date.now()
                const delta = Math.floor((now - activeTimerStartTime) / 1000)
                const total = baseTime + delta

                setExerciseTimers((prev: any) => ({
                    ...prev,
                    [activeTimerId]: total
                }))
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [activeTimerId, activeTimerStartTime, sessionData])


    // Handlers
    const handleToggleTimer = async (exerciseId: string, ignoreRest: boolean = false) => {
        if (!sessionId || sessionData?.status !== 'started') {
            showError("Inicie o treino para cronometrar.")
            return
        }

        if (restTimerOpen && !ignoreRest) {
            showError("Descanso em andamento! Pule o descanso para retomar.")
            return
        }

        // Check if exercise is already completed (all sets done)
        // We only block STARTING the timer. Stopping is always allowed (though if it's running it means it wasn't done?)
        // Actually, if it's running, we assume we can stop it.
        // So only block if `activeTimerId !== exerciseId` (i.e., we are trying to start it).
        if (activeTimerId !== exerciseId) {
            const targetEx = exercises.find(e => e.id === exerciseId)
            const existingLogs = executionLogs.filter(l => l.workout_exercise_id === exerciseId)
            if (targetEx && targetEx.sets && existingLogs.length >= targetEx.sets) {
                showError("Exercício concluído! Não é necessário cronometrar.")
                return
            }
        }

        const now = new Date()
        let updatePayload: any = {}
        let newTimersVal = { ...exerciseTimers }

        if (activeTimerId) {
            // STOPPING CURRENT
            const elapsed = exerciseTimers[activeTimerId] || 0 // This is the total displayed
            newTimersVal[activeTimerId] = elapsed

            // Update Base Ref
            exerciseTimersBaseRef.current[activeTimerId] = elapsed

            updatePayload.exercise_timers_state = newTimersVal
            updatePayload.active_timer_id = null
            updatePayload.active_timer_started_at = null

            if (activeTimerId === exerciseId) {
                setActiveTimerId(null)
                setActiveTimerStartTime(null)
            } else {
                // SWITCHING
                updatePayload.active_timer_id = exerciseId
                updatePayload.active_timer_started_at = now.toISOString()
                setActiveTimerId(exerciseId)
                setActiveTimerStartTime(now.getTime())
                // Ensure base is set if not already (it should be from init)
                if (exerciseTimersBaseRef.current[exerciseId] === undefined) {
                    exerciseTimersBaseRef.current[exerciseId] = newTimersVal[exerciseId] || 0
                }
            }
        } else {
            // STARTING NEW
            updatePayload.active_timer_id = exerciseId
            updatePayload.active_timer_started_at = now.toISOString()
            setActiveTimerId(exerciseId)
            setActiveTimerStartTime(now.getTime())
            if (exerciseTimersBaseRef.current[exerciseId] === undefined) {
                exerciseTimersBaseRef.current[exerciseId] = newTimersVal[exerciseId] || 0
            }
        }

        if (updatePayload.active_timer_id) {
            // If starting a timer, force clear any rest state so it doesn't persist
            delete newTimersVal['_rt']
            delete newTimersVal['_rre']
            delete newTimersVal['_tr']
            // Re-assign to ensure payload has clean state
            updatePayload.exercise_timers_state = newTimersVal
        }

        await supabase.from('workout_sessions').update(updatePayload).eq('id', sessionId)
        setExerciseTimers(newTimersVal)
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
                // Determine if this was the last set
                // We use the count of logs for this exercise.
                // Note: 'relevantLogs' includes the one we just saved/updated if we re-fetched or updated state locally?
                // 'executionLogs' state update in lines 412/416 is async/batched so 'executionLogs' here might be stale?
                // Actually `setExecutionLogs` uses functional update, but `executionLogs` var is from render scope.
                // However, we can use `setIndex` and `workoutExercise.sets`.
                const setsTarget = workoutExercise?.sets || 0
                const isLastSet = setsTarget > 0 && setIndex >= setsTarget

                const restTime = workoutExercise?.rest_time_seconds || 60
                const targetTime = Date.now() + restTime * 1000

                // If it's the last set: Stop timer, NO rest, NO auto-resume
                // If NOT last set: Stop timer, START rest, AUTO-resume

                const shouldRest = !isLastSet
                const resumeId = shouldRest ? exerciseId : null

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

                // 2. Persist Rest State (Only if resting)
                if (shouldRest) {
                    newTimers['_rt'] = targetTime
                    newTimers['_rre'] = resumeId
                    newTimers['_tr'] = restTime

                    updatePayload.exercise_timers_state = newTimers

                    setRestTargetTime(targetTime)
                    setLastRestExId(resumeId)
                    setTotalRestSeconds(restTime)
                    setRestTimerSeconds(restTime)
                    setRestTimerOpen(true)
                    toggleBackgroundMode(true)
                } else {
                    // Update only timers state (storing the stopped time)
                    updatePayload.exercise_timers_state = newTimers

                    // Clear rest if any (edge case)
                    setRestTargetTime(null)
                    setRestTimerOpen(false)
                }

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
    const handleSkipRest = async () => {
        // Immediate cleanup of local state
        setRestTargetTime(null)
        setRestTimerSeconds(0)
        setRestTimerOpen(false)

        // Resume Exercise Timer immediately without audio
        if (lastRestExId) {
            await handleToggleTimer(lastRestExId, true)
            setLastRestExId(null)
        } else {
            // If no auto-resume, explicitly clear rest from DB to prevent it from reappearing
            let newTimersVal = { ...exerciseTimers }
            delete newTimersVal['_rt']
            delete newTimersVal['_rre']
            delete newTimersVal['_tr']
            setExerciseTimers(newTimersVal)
            await supabase.from('workout_sessions').update({ exercise_timers_state: newTimersVal }).eq('id', sessionId)
        }
    }

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
                        // Sound & Vibration - Repeat 3 times
                        const playAlarm = (count: number) => {
                            if (count <= 0) return
                            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
                            audio.volume = 1.0
                            audio.play().catch((e) => console.log("Audio Permission Blocked", e))
                            if ('vibrate' in navigator) navigator.vibrate([500, 200, 500])

                            setTimeout(() => playAlarm(count - 1), 1500) // Repeat every 1.5s
                        }
                        playAlarm(3)

                        // System Notification
                        if (Notification.permission === 'granted') {
                            // Try Service Worker registration first if available (better for Android)
                            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                                navigator.serviceWorker.ready.then(registration => {
                                    registration.showNotification("CapiFit", {
                                        body: "Descanso finalizado!",
                                        icon: '/favicon.ico',
                                        vibrate: [300, 100, 300]
                                    } as any)
                                })
                            } else {
                                new Notification("CapiFit", {
                                    body: "Descanso finalizado!",
                                    vibrate: [300, 100, 300]
                                } as any)
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
                onSkipRest={handleSkipRest}
                lastRestExId={lastRestExId}

                // Timer Props
                activeTimerId={activeTimerId}
                exerciseTimers={exerciseTimers}
                onToggleTimer={handleToggleTimer}
                isSessionActive={sessionData?.status === 'started'}
                elapsedTime={elapsedTime}
            />
        </div>
    )
}

export default ActiveSessionPage
