import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Minimize2, CheckCircle2, Trophy, ArrowLeft } from 'lucide-react'
import { ActiveExerciseSlide } from './ActiveExerciseSlide'
import { RestTimerOverlay } from './RestTimerOverlay'
import { cn } from '@/lib/utils'

interface ActiveWorkoutSessionProps {
    exercises: any[]
    executionLogs: any[]
    historyLogs: any[]
    onSaveLog: (exerciseId: string, setIndex: number, weight: number, reps: number, isCompleted: boolean) => void
    onFinishWorkout: () => void
    onMinimize: () => void
    isOpen: boolean

    // Rest Timer State from Parent
    restTimerOpen: boolean
    setRestTimerOpen: (open: boolean) => void
    restTimerSeconds: number
    setRestTimerSeconds: (seconds: any) => void // Accepts function or number
    totalRestSeconds: number
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
    exercises,
    executionLogs,
    historyLogs,
    onSaveLog,
    onFinishWorkout,
    onMinimize,
    isOpen,
    restTimerOpen,
    setRestTimerOpen,
    restTimerSeconds,
    setRestTimerSeconds,
    totalRestSeconds
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Reset index if exercises change significantly or on re-mount if needed, 
    // but we probably want to persist index if minimized.
    // For now, let's keep it simple: local state. 
    // If parent unmounts, this resets. The prompt asked for state persistence.
    // If "Minimize" sets isOpen=false, and checks style={{display: none}}, state is kept.

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

    // Calculate progress
    const completedCount = exercises.reduce((acc, ex) => {
        const logs = executionLogs.filter(l => l.workout_exercise_id === ex.id)
        // Heuristic: If logs count >= sets, it's "done"
        if (logs.length >= ex.sets) return acc + 1
        return acc
    }, 0)

    const progressPercentage = (completedCount / exercises.length) * 100

    // if (!isOpen) return null (Removed to persist state)
    // If no exercises, show something else (but we keep rendered if hidden)
    if (!currentExercise && isOpen) return null

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <div className={cn(
            "fixed inset-0 z-[9999] flex flex-col bg-background h-[100dvh] w-screen overflow-hidden overscroll-none touch-none !mt-0 !mb-0",
            isOpen ? "flex" : "hidden"
        )} style={{ backgroundColor: 'hsl(var(--background))' }}>
            {/* Header */}
            <div className="flex-none flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-md z-10">
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

                <div className="w-9" /> {/* Spacer to center title */}
            </div>

            {/* Main Content (Carousel) */}
            <div className="flex-1 relative min-h-0 w-full">
                {/* We could use a real carousel lib, but simple conditional rendering 
                with animation keys works well for step-by-step 
            */}
                <ActiveExerciseSlide
                    key={currentExercise.id}
                    exercise={currentExercise}
                    executionLogs={executionLogs}
                    historyLogs={historyLogs}
                    onSaveLog={onSaveLog}
                />
            </div>

            {/* Footer Navigation */}
            <div className="flex-none w-full max-w-full px-4 py-3 box-border border-t border-border bg-card/80 backdrop-blur-xl flex items-center justify-between gap-4 z-10 pb-safe">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="h-12 w-12 flex-none rounded-full border-2"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex-1 text-center min-w-0">
                    <p className="text-xs text-muted-foreground uppercase font-bold text-[10px] tracking-widest">Exercício Atual</p>
                    <p className="font-bold truncate px-2">{currentExercise.exercise?.name}</p>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentIndex === exercises.length - 1}
                    className={cn(
                        "h-12 w-12 flex-none rounded-full border-2",
                        currentIndex < exercises.length - 1 ? "border-primary text-primary hover:bg-primary/10" : ""
                    )}
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Rest Timer Overlay */}
            <RestTimerOverlay
                isOpen={restTimerOpen}
                onClose={() => setRestTimerOpen(false)}
                onAddSeconds={(s) => setRestTimerSeconds((prev: number) => prev + s)}
                secondsRemaining={restTimerSeconds}
                totalSeconds={totalRestSeconds}
            />
        </div>
    )
}
