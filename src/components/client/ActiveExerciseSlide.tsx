import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlayCircle, VideoOff, Info, Image as ImageIcon, Video as VideoIcon, Square, Play } from 'lucide-react'
import { SetInputRow } from './SetInputRow'
import { Textarea } from '@/components/ui/textarea'

interface ActiveExerciseSlideProps {
    exercise: any
    executionLogs: any[]
    historyLogs: any[]
    onSaveLog: (exerciseId: string, setIndex: number, weight: number, reps: number, isCompleted: boolean) => void
    activeTime: number
    isTimerRunning: boolean
    onToggleTimer: (exerciseId: string) => void
    isSessionActive: boolean
    isResting?: boolean
    onUpdateLogNote: (logId: string, note: string) => void
    sessionId?: string | null
}

export const ActiveExerciseSlide: React.FC<ActiveExerciseSlideProps> = ({
    exercise,
    executionLogs,
    historyLogs,
    onSaveLog,
    activeTime,
    isTimerRunning,
    onToggleTimer,
    isSessionActive,
    isResting,
    onUpdateLogNote,
    sessionId
}) => {
    // View Mode: 'gif' | 'video' | 'info'
    const [viewMode, setViewMode] = useState<'gif' | 'video' | 'info'>('gif')

    // Reset view mode when exercise changes
    useEffect(() => {
        // Default priority: GIF -> Video -> Info
        const hasGif = !!(exercise.exercise?.gif_url) || (exercise.exercise?.demo_url && !isVideoUrl(exercise.exercise?.demo_url))
        if (hasGif) setViewMode('gif')
        else if (hasVideo(exercise)) setViewMode('video')
        else setViewMode('info')
    }, [exercise.id])

    // Helpers
    const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url) || url?.includes('youtu')
    const hasVideo = (ex: any) => !!(ex.exercise?.video_url || (ex.exercise?.demo_type === 'video' && ex.exercise?.demo_url))
    const hasGif = !!(exercise.exercise?.gif_url)

    // Construct URLs
    const safeName = exercise.exercise?.name ? exercise.exercise.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''
    const localGifUrl = `/gifs_exercicios/${safeName}.gif`
    const remoteUrl = exercise.exercise?.demo_url
    const videoUrl = exercise.exercise?.video_url || (exercise.exercise?.demo_type === 'video' ? exercise.exercise?.demo_url : null)
    const youtubeId = videoUrl ? getVideoId(videoUrl) : null

    // Determine content to render in Hero
    const renderHeroContent = () => {
        if (viewMode === 'info') {
            return (
                <div className="h-full bg-card p-6 overflow-y-auto border-b border-border">
                    <div className="flex items-center gap-2 mb-4 text-blue-500">
                        <Info className="h-6 w-6" />
                        <span className="font-bold text-lg uppercase">Instruções</span>
                    </div>
                    {exercise.exercise?.instructions ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                                {exercise.exercise.instructions.map((inst: string, i: number) => <li key={i}>{inst}</li>)}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic">Sem instruções disponíveis.</p>
                    )}
                    {exercise.notes && (
                        <div className="mt-6 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                            <p className="font-bold text-yellow-600 text-sm mb-1">Nota do Treinador</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">{exercise.notes}</p>
                        </div>
                    )}
                </div>
            )
        }

        if (viewMode === 'video' && (videoUrl || youtubeId)) {
            return (
                <div className="w-full h-full bg-black">
                    {youtubeId ? (
                        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeId}`} allowFullScreen />
                    ) : (
                        <video src={videoUrl} controls className="w-full h-full object-contain" />
                    )}
                </div>
            )
        }

        // Default: GIF (Local or Remote)
        // Correctly prioritize Supabase URL (demo_url) if it is an image/gif
        const demoIsGif = exercise.exercise?.demo_url && !isVideoUrl(exercise.exercise?.demo_url)
        const displayGif = exercise.exercise?.gif_url || (demoIsGif ? exercise.exercise?.demo_url : null) || localGifUrl

        return (
            <div className="w-full h-full bg-black/5 relative">
                <img
                    src={displayGif}
                    alt={exercise.exercise?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none'
                    }}
                />
                {/* Overlay Text only on GIF/Image mode */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent h-32 pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <Badge variant="secondary" className="mb-2 backdrop-blur-md bg-background/50 text-foreground border-foreground/10">
                        {exercise.exercise?.muscle_group || 'Geral'}
                    </Badge>
                    <h2 className="text-2xl font-bold text-foreground leading-tight shadow-md">{exercise.exercise?.name}</h2>
                </div>
            </div>
        )
    }

    const currentExLogs = executionLogs.filter(l => l.workout_exercise_id === exercise.id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const pastLogs = historyLogs.filter(l => l.exercise_id === exercise.exercise_id && l.workout_exercise_id !== exercise.id)

    return (
        <div className="h-full flex flex-col overflow-y-auto pb-20 custom-scrollbar" style={{ margin: 'auto' }}>
            {/* Hero Section */}
            <div className="w-full aspect-video bg-muted relative shrink-0">
                {renderHeroContent()}
            </div>

            {/* Controls Bar */}
            <div className="p-2 border-b border-border bg-card/50 flex items-center justify-between gap-2 sticky top-0 z-10 backdrop-blur-sm">
                {/* Timer Button */}
                <Button
                    variant={isTimerRunning ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => onToggleTimer(exercise.id)}
                    className={`h-9 px-3 rounded-full flex items-center gap-2 transition-all ${isTimerRunning ? 'animate-pulse' : 'border-dashed border-muted-foreground/50'} ${isResting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isTimerRunning ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 ml-0.5" />}
                    <span className="font-mono font-bold text-sm min-w-[3ch] text-center">
                        {(() => {
                            const m = Math.floor(activeTime / 60).toString().padStart(2, '0')
                            const s = (activeTime % 60).toString().padStart(2, '0')
                            return `${m}:${s}`
                        })()}
                    </span>
                </Button>

                {/* View Toggles */}
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('gif')}
                        className={`h-7 px-2 text-[10px] uppercase font-bold rounded-md ${viewMode === 'gif' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                        Demo
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('video')}
                        className={`h-7 px-2 text-[10px] uppercase font-bold rounded-md ${viewMode === 'video' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                        disabled={!hasVideo(exercise)}
                    >
                        Vídeo
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('info')}
                        className={`h-7 px-2 text-[10px] uppercase font-bold rounded-md ${viewMode === 'info' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                        Info
                    </Button>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-6">
                {/* Helper Note if not in Info mode */}
                {viewMode !== 'info' && exercise.notes && (
                    <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-xs text-yellow-700 dark:text-yellow-400">
                        <span className="font-bold">Nota:</span> {exercise.notes}
                    </div>
                )}

                {/* Sets List */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <h3 className="font-bold text-lg">Séries</h3>
                        <div className="flex items-center gap-2">
                            {exercise.rest_time_seconds && (
                                <Badge variant="outline" className="text-[10px] h-5 gap-1">
                                    <PlayCircle className="h-3 w-3" /> Descanso: {exercise.rest_time_seconds}s
                                </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{exercise.sets} séries • {exercise.reps} reps</span>
                        </div>
                    </div>

                    {Array.from({ length: exercise.sets }).map((_, i) => {
                        const historyLog = pastLogs[i]
                        const currentLog = currentExLogs.find(l => l.set_number === i + 1) || currentExLogs[i] // Fallback index
                        const isLastSet = i === exercise.sets - 1
                        return (
                            <div key={i} className="flex flex-col gap-2">
                                <SetInputRow
                                    setNumber={i + 1}
                                    previousWeight={historyLog?.weight}
                                    previousReps={historyLog?.reps}
                                    currentLog={currentLog}
                                    isCompleted={!!currentLog}
                                    onSave={(w, r, c) => onSaveLog(exercise.id, i + 1, w, r, c)}
                                />
                                {isLastSet && currentLog && (
                                    <div className="ml-10 md:ml-14 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                        <label className="text-[10px] md:text-xs font-bold text-muted-foreground/70 uppercase mb-1 block pl-1">Observações do Exercício</label>
                                        <Textarea
                                            placeholder="Alguma dor? Carga ficou leve? Anote aqui..."
                                            defaultValue={currentLog.notes || ''}
                                            className="bg-card/50 min-h-[80px] text-sm resize-none border-dashed focus:border-solid transition-all"
                                            onBlur={(e) => onUpdateLogNote(currentLog.id, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// Helpers outside component
const getVideoId = (url: string) => {
    if (!url) return null
    try {
        const urlObj = new URL(url)
        if (urlObj.hostname === 'youtu.be') return urlObj.pathname.substring(1)
        if (urlObj.searchParams.get('v')) return urlObj.searchParams.get('v')
        if (urlObj.pathname.startsWith('/embed/')) return urlObj.pathname.split('/')[2]
        if (urlObj.pathname.startsWith('/shorts/')) return urlObj.pathname.split('/')[2]
    } catch (e) { }
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?\/]+)/)
    if (match && match[1] && !/\.(mp4|webm|ogg|mov)$/i.test(match[1])) return match[1]
    return null
}
