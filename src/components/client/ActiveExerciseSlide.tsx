import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlayCircle, VideoOff, Info } from 'lucide-react'
import { SetInputRow } from './SetInputRow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ActiveExerciseSlideProps {
    exercise: any
    executionLogs: any[]
    historyLogs: any[] // Previous session logs for history lookup
    onSaveLog: (exerciseId: string, setIndex: number, weight: number, reps: number, isCompleted: boolean) => void
}

export const ActiveExerciseSlide: React.FC<ActiveExerciseSlideProps> = ({
    exercise,
    executionLogs,
    historyLogs,
    onSaveLog
}) => {
    const [mediaError, setMediaError] = useState(false)

    // Helper to find log for a specific set
    // This assumes logs are created in order or processed to match sets.
    // For simplicity, we filter logs for this exercise and map them by index if possible,
    // or just rely on the parent to pass the correct structure.
    // Here we filter logs for this specific exercise ID and assume order matters.
    const currentExLogs = executionLogs.filter(l => l.workout_exercise_id === exercise.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Find history for this exercise (from a previous session)
    // We look for logs with the same exercise_id but different workout_exercise_id or date
    const pastLogs = historyLogs.filter(l => l.exercise_id === exercise.exercise_id && l.workout_exercise_id !== exercise.id)

    // Media priority: 1. GIF (local/url), 2. Video URL, 3. Placeholder
    // Assuming 'demo_url' contains the URL. If it's a GIF, it's used.
    // If user meant "local file system", we'd construct a path, but we'll stick to demo_url or a constructed path if demo_url is empty.
    // We'll attempt a constructed path for the "local GIF" requirement if demo_url is missing.

    const getMediaSource = () => {
        if (exercise.exercise?.demo_url) return exercise.exercise.demo_url
        // Fallback logic for "local" gifs if needed using name convention
        // const safeName = exercise.exercise?.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        // return `/gifs_exercicios/${safeName}.gif`
        return null
    }

    const mediaSrc = getMediaSource()

    return (
        <div className="h-full flex flex-col overflow-y-auto pb-20 custom-scrollbar">
            {/* Media Section */}
            <div className="w-full aspect-video bg-black/5 relative shrink-0">
                {!mediaError && mediaSrc ? (
                    mediaSrc.endsWith('.mp4') || mediaSrc.includes('youtube') || mediaSrc.includes('vimeo') ? (
                        <iframe
                            src={mediaSrc}
                            className="w-full h-full object-cover"
                            allow="autoplay; encrypted-media"
                            onError={() => setMediaError(true)}
                        />
                    ) : (
                        <img
                            src={mediaSrc}
                            alt={exercise.exercise?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback to trying to load a local gif by name if the URL failed or wasn't provided
                                const target = e.target as HTMLImageElement;
                                if (!target.src.includes('/gifs_exercicios/')) {
                                    const safeName = exercise.exercise?.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                    target.src = `/gifs_exercicios/${safeName}.gif`
                                } else {
                                    setMediaError(true)
                                }
                            }}
                        />
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <VideoOff className="h-12 w-12 mb-2 opacity-20" />
                        <p className="text-xs">Sem demonstração disponível</p>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-24 pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4">
                    <Badge variant="secondary" className="mb-2 backdrop-blur-md bg-background/50 text-foreground border-foreground/10">
                        {exercise.exercise?.muscle_group || 'Geral'}
                    </Badge>
                    <h2 className="text-2xl font-bold text-foreground leading-tight shadow-md">{exercise.exercise?.name}</h2>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Helper Info Tabs */}
                {(exercise.notes || exercise.exercise?.instructions) && (
                    <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground border border-border">
                        {exercise.notes && <div className="mb-2"><span className="font-bold text-foreground">Nota do Treinador:</span> {exercise.notes}</div>}

                        {exercise.exercise?.instructions && (
                            <details className="group cursor-pointer">
                                <summary className="flex items-center font-medium hover:text-primary transition-colors">
                                    <Info className="h-4 w-4 mr-2" /> Ver Instruções
                                </summary>
                                <p className="mt-2 text-xs leading-relaxed pl-6">
                                    {exercise.exercise?.instructions}
                                </p>
                            </details>
                        )}
                    </div>
                )}

                {/* Sets List */}
                <div className="space-y-1">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <h3 className="font-bold text-lg">Séries</h3>
                        <span className="text-xs text-muted-foreground">{exercise.sets} séries programadas</span>
                    </div>

                    {Array.from({ length: exercise.sets }).map((_, i) => {
                        const historyLog = pastLogs[i] // Simple matching logic (1st set matches 1st past set)
                        const currentLog = currentExLogs.find(l => l.workout_exercise_id === exercise.id && l.set_number === i + 1) // Need to ensure logs store set_number or infer it

                        // If we don't have explicit set_number in logs, we might have to rely on order, which is risky if they are deleted. 
                        // For now, let's assume we pass the INDEX to the save function and let the parent handle the "finding or creating" logic properly.
                        // But we need to display current state.
                        // A robust way: Parent passes an array of "SessionSet" objects that merge plan + log.
                        // For now, let's rely on the parent passing updated 'executionLogs'.
                        // We'll treat the i-th item in currentExLogs as the i-th set ONLY IF we strictly manage them.
                        // Better: Let's assume the parent knows how to map them.
                        // Actually, we should probably modify the schema to include `set_number` in `workout_execution_logs` to be precise, 
                        // but the prompt asked not to check schema again unless necessary. 
                        // I'll simulate it: The component renders N rows. The parent callback receives (setIndex).
                        // We try to find a log that matches this setIndex. 

                        // Refinement: I'll stick to using the log at index `i` if available, or undefined.
                        const logForThisSet = currentExLogs[i]

                        return (
                            <SetInputRow
                                key={i}
                                setNumber={i + 1}
                                previousWeight={historyLog?.weight}
                                previousReps={historyLog?.reps}
                                currentLog={logForThisSet}
                                isCompleted={!!logForThisSet}
                                onSave={(w, r, c) => onSaveLog(exercise.id, i + 1, w, r, c)}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
