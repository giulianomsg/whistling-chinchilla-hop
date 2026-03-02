import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Minimize2, CheckCircle2, Trophy, ArrowLeft, User } from 'lucide-react'
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


    // Exercise Timer Props
    activeTimerId: string | null
    exerciseTimers: Record<string, any>
    onToggleTimer: (id: string) => void
    isSessionActive: boolean

    // Global Timer
    elapsedTime: number

    // Session ID for persistence
    sessionId?: string | null
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
    sessionId
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Auto-navigate to active exercise on open
    useEffect(() => {
        if (isOpen) {
            const targetId = activeTimerId || lastRestExId
            if (targetId && exercises.length > 0) {
                const idx = exercises.findIndex(e => e.id === targetId)
                if (idx !== -1) {
                    setCurrentIndex(idx)
                }
            }
        }
    }, [isOpen])

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
            "fixed inset-0 z-[110] bg-background flex-col animate-in fade-in duration-300 !mt-0 h-screen",
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
                    sessionId={sessionId}
                />
            </div>

            {/* Global Mini-player (when navigating away from active timer) */}
            {activeTimerId && activeTimerId !== currentExercise.id && (
                <div className="bg-primary/10 border-t border-primary/20 p-3 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-primary">Em Andamento</span>
                        <span className="font-bold text-sm truncate">{exercises.find(e => e.id === activeTimerId)?.exercise?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-primary animate-pulse">
                            {formatSeconds(exerciseTimers[activeTimerId] || 0)}
                        </span>
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                                const idx = exercises.findIndex(e => e.id === activeTimerId);
                                if (idx !== -1) setCurrentIndex(idx);
                            }}
                            className="h-8 text-xs font-bold shadow-md shadow-primary/20"
                        >
                            Voltar para Série
                        </Button>
                    </div>
                </div>
            )}

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
