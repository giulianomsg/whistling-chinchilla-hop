import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Play, Info, Image as ImageIcon, Video as VideoIcon, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react'

interface WorkoutExerciseCardProps {
    exercise: any
    executionLogs: any[]
    isSessionActive: boolean
    activeTime: number
    isTimerRunning: boolean
    onLogClick: (exercise: any) => void
    onToggleTimer: (exerciseId: string) => void
}

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
    if (match && match[1]) return match[1]
    return null
}

export const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({
    exercise: we,
    executionLogs,
    activeTime,
    isTimerRunning,
    isSessionActive,
    onLogClick,
    onToggleTimer
}) => {
    const [showGif, setShowGif] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const [showInfo, setShowInfo] = useState(false)

    const isCompleted = executionLogs.some(log => log.workout_exercise_id === we.id)
    const videoId = we.exercise?.video_url ? getVideoId(we.exercise.video_url) : null
    const hasGif = !!we.exercise?.gif_url
    const hasVideo = !!videoId
    const hasInfo = (we.exercise?.instructions?.length > 0) || (we.exercise?.tips?.length > 0)

    return (
        <div className={`bg-card/50 border ${isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-border'} rounded-lg overflow-hidden transition-all shadow-sm`}>
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-base font-bold ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>{we.exercise.name}</h4>
                            {isCompleted && <Badge variant="outline" className="border-green-500/50 text-green-600 dark:text-green-400 text-[10px] h-5 px-1.5">Feito</Badge>}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                            <span className="bg-muted px-2 py-0.5 rounded border border-border">{we.sets} séries</span>
                            <span className="bg-muted px-2 py-0.5 rounded border border-border">{we.reps} reps</span>
                            {we.weight && <span className="bg-muted px-2 py-0.5 rounded border border-border">{we.weight}kg</span>}
                            {we.rest_time_seconds && <span className="bg-muted px-2 py-0.5 rounded border border-border">{we.rest_time_seconds}s</span>}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        {/* Timer Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); onToggleTimer(we.id) }}
                            className={`h-9 px-2 gap-1.5 transition-all text-xs border-dashed ${isTimerRunning
                                ? 'border-orange-500 bg-orange-500/10 text-orange-500 animate-pulse'
                                : activeTime > 0 ? 'border-blue-500/30 text-blue-500' : 'border-border text-muted-foreground'}`}
                            disabled={!isSessionActive || isCompleted}
                        >
                            {isTimerRunning ? <PlayCircle className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                            <span className="font-mono font-bold w-[40px] text-center">
                                {(() => {
                                    const m = Math.floor(activeTime / 60).toString().padStart(2, '0')
                                    const s = (activeTime % 60).toString().padStart(2, '0')
                                    return `${m}:${s}`
                                })()}
                            </span>
                        </Button>

                        {/* Check Button */}
                        <Button
                            size="icon"
                            onClick={() => onLogClick(we)}
                            className={`h-10 w-10 shrink-0 rounded-full transition-all ${isCompleted ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border'}`}
                        >
                            {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-border">
                    {hasGif && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowGif(!showGif)}
                            className={`h-8 px-2 text-xs gap-1.5 ${showGif ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <ImageIcon className="h-3.5 w-3.5" />
                            GIF
                            {showGif ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                    )}

                    {hasVideo && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowVideo(!showVideo)}
                            className={`h-8 px-2 text-xs gap-1.5 ${showVideo ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <VideoIcon className="h-3.5 w-3.5" />
                            Vídeo
                            {showVideo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                    )}

                    {hasInfo && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowInfo(!showInfo)}
                            className={`h-8 px-2 text-xs gap-1.5 ${showInfo ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <Info className="h-3.5 w-3.5" />
                            Detalhes
                            {showInfo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Expandable Content Area */}
            {(showGif || showVideo || showInfo) && (
                <div className="bg-muted/30 border-t border-border p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">

                    {/* Gif View */}
                    {showGif && we.exercise.gif_url && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Demonstração</p>
                            <div className="aspect-square rounded-lg overflow-hidden border border-border bg-background relative mx-auto max-w-[250px]">
                                <img src={we.exercise.gif_url} alt={we.exercise.name} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}

                    {/* Video View */}
                    {showVideo && videoId && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-red-500/80 uppercase tracking-wider">Vídeo Completo</p>
                            <div className="aspect-video rounded-lg overflow-hidden bg-black shadow-lg border border-border">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    className="border-0"
                                />
                            </div>
                        </div>
                    )}

                    {/* Info View */}
                    {showInfo && (
                        <div className="space-y-4">
                            {we.exercise.instructions?.length > 0 && (
                                <div className="bg-card p-3 rounded-lg border border-border shadow-sm">
                                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Instruções</p>
                                    <ul className="space-y-1 text-sm text-foreground list-disc list-inside marker:text-blue-500/50">
                                        {we.exercise.instructions.map((inst: string, idx: number) => (
                                            <li key={idx} className="leading-snug">{inst}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {we.exercise.tips?.length > 0 && (
                                <div className="bg-card p-3 rounded-lg border border-border shadow-sm">
                                    <p className="text-xs font-semibold text-yellow-500/80 uppercase tracking-wider mb-2">Dicas</p>
                                    <ul className="space-y-1 text-sm text-foreground list-disc list-inside marker:text-yellow-500/50">
                                        {we.exercise.tips.map((tip: string, idx: number) => (
                                            <li key={idx} className="leading-snug">{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}
