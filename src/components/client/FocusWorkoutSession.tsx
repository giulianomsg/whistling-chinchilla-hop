import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Video, VideoOff, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SetInputRow } from './SetInputRow'
import { RestTimerOverlay } from './RestTimerOverlay'

interface FocusWorkoutSessionProps {
    exercises: any[]
    executionLogs: any[]
    historyLogs: any[]
    onSaveLog: (exerciseId: string, setIndex: number, weight: number, reps: number, isCompleted: boolean) => void
    onFinishWorkout: () => void
    onMinimize: () => void
    isOpen: boolean

    // Rest Timer State
    restTimerOpen: boolean
    setRestTimerOpen: (open: boolean) => void
    restTimerSeconds: number
    setRestTimerSeconds: (seconds: any) => void
    totalRestSeconds: number
}

export const FocusWorkoutSession: React.FC<FocusWorkoutSessionProps> = ({
    exercises,
    executionLogs,
    historyLogs,
    onSaveLog,
    onMinimize,
    isOpen,
    restTimerOpen,
    setRestTimerOpen,
    restTimerSeconds,
    setRestTimerSeconds,
    totalRestSeconds
}) => {
    // Current Exercise State
    const [currentIndex, setCurrentIndex] = useState(0)
    const currentExercise = exercises[currentIndex]

    // Media State
    const [mediaError, setMediaError] = useState(false)
    const [showInstructions, setShowInstructions] = useState(false)

    // Reset media error on exercise change
    useEffect(() => {
        setMediaError(false)
        setShowInstructions(false)
    }, [currentIndex])

    if (!isOpen || !currentExercise) return null

    // Helper: Navigation
    const handleNext = () => {
        if (currentIndex < exercises.length - 1) setCurrentIndex(prev => prev + 1)
    }
    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
    }

    // Helper: Media Logic
    const safeName = currentExercise.exercise?.name ? currentExercise.exercise.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''
    const localGifUrl = `/gifs_exercicios/${safeName}.gif`
    const remoteUrl = currentExercise.exercise?.demo_url

    // Helper: Logs for current exercise
    const currentExLogs = executionLogs.filter(l => l.workout_exercise_id === currentExercise.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const pastLogs = historyLogs.filter(l => l.exercise_id === currentExercise.exercise_id && l.workout_exercise_id !== currentExercise.id)

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-bottom duration-300">

            {/* 1. Header: Fixed Top */}
            <div className="flex-none h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10">
                <Button variant="ghost" size="sm" onClick={onMinimize} className="text-muted-foreground hover:text-foreground -ml-2 gap-1">
                    <ArrowLeft className="h-4 w-4" /> Voltar à lista
                </Button>
                <div className="text-sm font-bold text-foreground/80">
                    {currentIndex + 1} / {exercises.length}
                </div>
                {/* Spacer to balance header */}
                <div className="w-16" />
            </div>

            {/* 2. Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-background/50">
                <div className="max-w-md mx-auto w-full pb-32">

                    {/* Media Area */}
                    <div className="relative aspect-video bg-muted border-b border-border">
                        {!mediaError ? (
                            <img
                                src={localGifUrl}
                                alt={currentExercise.exercise?.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Try remote if local fails
                                    if (remoteUrl && e.currentTarget.src !== remoteUrl) {
                                        e.currentTarget.src = remoteUrl
                                    } else {
                                        setMediaError(true)
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/30">
                                <VideoOff className="h-10 w-10 mb-2 opacity-50" />
                                <span className="text-xs">Sem demonstração</span>
                            </div>
                        )}

                        <div className="absolute bottom-3 left-3 flex gap-2">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur text-xs font-bold shadow-sm">
                                {currentExercise.exercise?.muscle_group || 'Geral'}
                            </Badge>
                            {remoteUrl && (
                                <Badge variant="secondary" className="bg-background/80 backdrop-blur text-xs shadow-sm gap-1">
                                    <Video className="h-3 w-3" /> Vídeo
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Exercise Info */}
                    <div className="p-5 space-y-6">
                        <div>
                            <h2 className="text-2xl font-extrabold leading-tight text-foreground">{currentExercise.exercise?.name}</h2>
                            {currentExercise.notes && (
                                <p className="mt-2 text-sm text-muted-foreground bg-blue-500/5 border border-blue-500/10 p-3 rounded-md">
                                    <span className="font-bold text-blue-500 block mb-1">Nota:</span>
                                    {currentExercise.notes}
                                </p>
                            )}
                            {currentExercise.exercise?.instructions && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => setShowInstructions(!showInstructions)}
                                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        <AlertCircle className="h-3 w-3" />
                                        {showInstructions ? 'Ocultar Instruções' : 'Ver Instruções'}
                                    </button>
                                    {showInstructions && (
                                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1">
                                            {currentExercise.exercise?.instructions}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sets Wrapper */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Check className="h-5 w-5 text-primary" /> Séries
                                </h3>
                                <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                    META: {currentExercise.sets}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {Array.from({ length: currentExercise.sets }).map((_, i) => {
                                    const historyLog = pastLogs[i]
                                    const currentLog = currentExLogs.find(l => l.workout_exercise_id === currentExercise.id && l.set_number === i + 1)
                                    // Use index if set_number not found logic fallback (assuming ordered list)
                                    const displayLog = currentLog || currentExLogs[i]

                                    return (
                                        <SetInputRow
                                            key={i}
                                            setNumber={i + 1}
                                            previousWeight={historyLog?.weight}
                                            previousReps={historyLog?.reps}
                                            currentLog={displayLog}
                                            isCompleted={!!displayLog}
                                            onSave={(w, r, c) => onSaveLog(currentExercise.id, i + 1, w, r, c)}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Footer Navigation: Fixed Bottom */}
            <div className="flex-none p-4 border-t border-border bg-card/90 backdrop-blur-md flex items-center gap-3 safe-area-bottom">
                <Button
                    variant="outline"
                    className="flex-1 h-12 text-base"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft className="mr-2 h-5 w-5" /> Anterior
                </Button>

                <Button
                    variant="default"
                    className="flex-[2] h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                    onClick={handleNext}
                    disabled={currentIndex === exercises.length - 1}
                >
                    Próximo <ChevronRight className="ml-2 h-5 w-5" />
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
