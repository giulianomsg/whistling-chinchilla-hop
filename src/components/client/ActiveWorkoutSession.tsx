import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Minimize2, CheckCircle2, Trophy, ArrowLeft, User, Play, Pause, Square } from 'lucide-react'
import { ActiveExerciseSlide } from './ActiveExerciseSlide'
import { RestTimerOverlay } from './RestTimerOverlay'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import BodyHighlighter from '@/components/visualization/BodyHighlighter'

interface ActiveWorkoutSessionProps {
    exercises: any[]
    executionLogs: any[]
    historyLogs: any[]
    onSaveLog: (exerciseId: string, setIndex: number, weight: number, reps: number, isCompleted: boolean) => void
    onUpdateLogNote: (logId: string, note: string) => void
    onFinishWorkout: () => void
    onMinimize: () => void
    isOpen: boolean

    // Rest Timer State from Parent
    restTimerOpen: boolean
    setRestTimerOpen: (open: boolean) => void
    restTimerSeconds: number
    setRestTimerSeconds: (seconds: any) => void
    totalRestSeconds: number
    onSkipRest?: () => void
    lastRestExId?: string | null

    // Session Controls
    sessionStatus: 'idle' | 'started' | 'paused' | 'completed'
    onPauseSession: () => void
    onResumeSession: () => void


    // Exercise Timer Props
    activeTimerId: string | null
    exerciseTimers: Record<string, any>
    onToggleTimer: (id: string) => void
    isSessionActive: boolean

    // Global Timer
    elapsedTime: number
}

// Helper for formatting
const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
    exercises,
    executionLogs,
    historyLogs,
    onSaveLog,
    onUpdateLogNote,
    onFinishWorkout,
    onMinimize,
    isOpen,
    restTimerOpen,
    setRestTimerOpen,
    restTimerSeconds,
    setRestTimerSeconds,
    totalRestSeconds,
    onSkipRest,
    lastRestExId,
    activeTimerId,
    exerciseTimers,
    onToggleTimer,
    isSessionActive,
    elapsedTime,
    sessionStatus,
    onPauseSession,
    onResumeSession
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Auto-navigate to active exercise on load or when timer starts
    useEffect(() => {
        const targetId = activeTimerId || lastRestExId
        if (targetId && exercises.length > 0) {
            const idx = exercises.findIndex(e => e.id === targetId)
            if (idx !== -1) {
                setCurrentIndex(idx)
            }
        }
    }, [activeTimerId, lastRestExId, exercises])

    // ... (rest of state)

    const currentExercise = exercises[currentIndex]

    const handleNext = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    // ...

    // if (!isOpen) return null (Removed to persist state)
    // If no exercises, show something else (but we keep rendered if hidden)
    if (!currentExercise && isOpen) return null

    return (
        <div className={cn(
            "fixed inset-0 z-50 bg-background flex-col animate-in fade-in duration-300",
            isOpen ? "flex" : "hidden"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-md">
                <Button variant="ghost" size="icon" onClick={onMinimize}>
                    <Minimize2 className="h-5 w-5 text-muted-foreground" />
                </Button>

                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold">
                        {currentIndex + 1} / {exercises.length}
                    </span>
                    <div className="w-24 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Muscle View Button */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <User className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-card/95 border-border text-foreground">
                        <h3 className="font-bold text-center mb-4">Músculos Trabalhados</h3>
                        <div className="flex justify-center">
                            <BodyHighlighter muscles={
                                Array.from(new Set(
                                    exercises.flatMap(e => {
                                        if (!e.exercise) return []
                                        const groups = e.exercise.muscle_groups || []
                                        const single = e.exercise.muscle_group
                                        const safeGroups = Array.isArray(groups) ? groups : []
                                        return [...safeGroups, single]
                                    }).filter((m: any) => m && typeof m === 'string')
                                )) as string[]
                            } />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Session Controls & Timer - CENTERED */}
            {isOpen && (
                <div className="flex flex-col items-center justify-center p-2 bg-card/30 backdrop-blur-sm border-b border-border z-40">
                    <div className="flex items-center gap-4 bg-background/80 p-2 rounded-full border border-border shadow-sm">
                        {/* Timer Display */}
                        <div className="px-3 py-1 bg-muted/50 rounded-full">
                            <span className="font-mono font-bold text-xl text-foreground tabular-nums tracking-wider">
                                {formatSeconds(elapsedTime)}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {sessionStatus === 'started' ? (
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={onPauseSession}
                                    className="h-10 w-10 full rounded-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                                >
                                    <Pause className="h-5 w-5 fill-current" />
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    onClick={onResumeSession}
                                    className="h-10 w-10 full rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                >
                                    <Play className="h-5 w-5 fill-current ml-0.5" />
                                </Button>
                            )}

                            <Button
                                size="icon"
                                variant="destructive"
                                onClick={onFinishWorkout}
                                className="h-10 w-10 full rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50"
                            >
                                <Square className="h-4 w-4 fill-current" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content (Carousel) */}
            <div className="flex-1 overflow-hidden relative">
                {/* Block Overlay when Paused */}
                {!isSessionActive && (
                    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                        <div className="bg-card p-6 rounded-2xl shadow-xl border border-border max-w-sm">
                            <h3 className="text-xl font-bold mb-2 text-foreground">Treino Pausado</h3>
                            <p className="text-muted-foreground text-sm mb-4">Retome o treino na tela principal para gerenciar séries e cronômetros.</p>
                            <Button onClick={onMinimize} variant="outline">Voltar</Button>
                        </div>
                    </div>
                )}
                {/* We could use a real carousel lib, but simple conditional rendering 
              with animation keys works well for step-by-step 
          */}
                <ActiveExerciseSlide
                    key={currentExercise.id}
                    exercise={currentExercise}
                    executionLogs={executionLogs}
                    historyLogs={historyLogs}
                    onSaveLog={onSaveLog}
                    onUpdateLogNote={onUpdateLogNote}
                    activeTime={exerciseTimers[currentExercise.id] || 0}
                    isTimerRunning={activeTimerId === currentExercise.id}
                    onToggleTimer={onToggleTimer}
                    isSessionActive={isSessionActive}
                    isResting={restTimerOpen}
                />
            </div>

            {/* Footer Navigation */}
            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-xl flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="h-12 w-12 rounded-full border-2"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-bold text-[10px] tracking-widest">Exercício Atual</p>
                    <p className="font-bold truncate px-2">{currentExercise.exercise?.name}</p>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentIndex === exercises.length - 1}
                    className={cn(
                        "h-12 w-12 rounded-full border-2",
                        currentIndex < exercises.length - 1 ? "border-primary text-primary hover:bg-primary/10" : ""
                    )}
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Rest Timer Overlay */}
            <RestTimerOverlay
                isOpen={restTimerOpen}
                onClose={() => {
                    if (onSkipRest) onSkipRest()
                    else setRestTimerOpen(false)
                }}
                onAddSeconds={(s) => setRestTimerSeconds((prev: number) => prev + s)}
                secondsRemaining={restTimerSeconds}
                totalSeconds={totalRestSeconds}
            />
        </div>
    )
}
