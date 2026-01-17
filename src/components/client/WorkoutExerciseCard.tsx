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
    // Extra validation to avoid matching generic filenames
    // A clean youtube ID is usually 11 chars, but can vary.
    // Important: Don't match if it ends in .mp4 or similar extension
    if (match && match[1] && !/\.(mp4|webm|ogg|mov)$/i.test(match[1])) return match[1]
    return null
}

const isVideoUrl = (url: string) => {
    if (!url) return false
    try {
        const path = new URL(url).pathname;
        return /\.(mp4|webm|ogg|mov)$/i.test(path);
    } catch {
        return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
    }
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

    // Logic for Media Types
    const demoUrl = we.exercise?.demo_url
    const demoType = we.exercise?.demo_type
    const videoUrl = we.exercise?.video_url

    // 1. Try to get YouTube ID from video_url
    const youtubeId = videoUrl ? getVideoId(videoUrl) : null

    // 2. Check source of direct video
    // Priority: demo_url (if explicit video OR implicit video) -> video_url (if implicit video)
    let directVideoSrc: string | null = null

    if (demoType === 'video' && demoUrl) {
        directVideoSrc = demoUrl
    } else if (demoUrl && isVideoUrl(demoUrl)) {
        directVideoSrc = demoUrl
    } else if (!youtubeId && videoUrl && isVideoUrl(videoUrl)) {
        // If not youtube, but is video extension in video_url field
        directVideoSrc = videoUrl
    }

    const hasVideo = !!(youtubeId || directVideoSrc)

    // GIF/Image Logic
    // If demo_url is NOT being used as the direct video source, it might be a gif/image
    const isDemoUrlUsedAsVideo = directVideoSrc === demoUrl
    const potentialDemoImage = !isDemoUrlUsedAsVideo ? demoUrl : null

    const uploadedGif = potentialDemoImage || we.exercise?.gif_url
    const hasGif = !!uploadedGif
    const hasInfo = (we.exercise?.instructions?.length > 0) || (we.exercise?.tips?.length > 0)

    return (
        <div className={`bg-card/50 border ${isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-border'} rounded-xl overflow-hidden shadow-sm mb-3`}>
            {/* Main Content Container - Vertical Stack for Mobile */}
            <div className="p-3">

                {/* 1. Header: Title & Status - Grid to separate Title from main Status/Check */}
                <div className="grid grid-cols-[1fr_auto] gap-3 mb-2 items-start">
                    <div className="min-w-0">
                        <h4 className={`text-sm md:text-base font-bold leading-tight break-words ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                            {we.exercise.name}
                        </h4>
                        {isCompleted && (
                            <div className="mt-1">
                                <Badge variant="outline" className="border-green-500/50 text-green-600 dark:text-green-400 text-[10px] h-4 px-1 rounded-sm">
                                    Concluído
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Primary Action: Check Button (Always visible top right or beside title) */}
                    <div className="shrink-0">
                        <Button
                            size="icon"
                            onClick={() => onLogClick(we)}
                            className={`h-11 w-11 rounded-full transition-all shadow-sm ${isCompleted ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-muted hover:bg-muted/80 text-muted-foreground border border-border'}`}
                        >
                            {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* 2. Stats / Tags - Flow Layout */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="bg-muted/50 border border-border px-2 py-1 rounded text-[10px] md:text-xs text-muted-foreground font-medium">
                        {we.sets} séries
                    </div>
                    <div className="bg-muted/50 border border-border px-2 py-1 rounded text-[10px] md:text-xs text-muted-foreground font-medium">
                        {we.reps} reps
                    </div>
                    {we.weight && (
                        <div className="bg-muted/50 border border-border px-2 py-1 rounded text-[10px] md:text-xs text-muted-foreground font-medium">
                            {we.weight}kg
                        </div>
                    )}
                    {we.rest_time_seconds && (
                        <div className="bg-muted/50 border border-border px-2 py-1 rounded text-[10px] md:text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <PlayCircle className="h-3 w-3" /> {we.rest_time_seconds}s
                        </div>
                    )}
                </div>

                {/* 3. Secondary Actions & Timer - Grid Layout */}
                <div className="grid grid-cols-4 gap-2">
                    {/* Timer Button - Spans 1 */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onToggleTimer(we.id) }}
                        disabled={!isSessionActive || isCompleted}
                        className={`col-span-1 h-9 p-0 flex flex-col items-center justify-center border-dashed ${isTimerRunning ? 'border-orange-500 text-orange-500 bg-orange-500/5' : 'border-border text-muted-foreground'}`}
                    >
                        {isTimerRunning ? <PlayCircle className="h-3.5 w-3.5 animate-spin mb-0.5" /> : <PlayCircle className="h-3.5 w-3.5 mb-0.5" />}
                        <span className="text-[9px] font-mono leading-none">
                            {(() => {
                                const m = Math.floor(activeTime / 60).toString().padStart(2, '0')
                                const s = (activeTime % 60).toString().padStart(2, '0')
                                return `${m}:${s}`
                            })()}
                        </span>
                    </Button>

                    {/* Media/Info Toggles - Span remaining 3 */}
                    <div className="col-span-3 grid grid-cols-3 gap-1">
                        {hasGif && (
                            <Button variant="ghost" size="sm" onClick={() => setShowGif(!showGif)} className={`h-9 px-0 ${showGif ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                                <div className="flex flex-col items-center">
                                    <ImageIcon className="h-3.5 w-3.5 mb-0.5" />
                                    <span className="text-[9px]">Demo</span>
                                </div>
                            </Button>
                        )}
                        {hasVideo && (
                            <Button variant="ghost" size="sm" onClick={() => setShowVideo(!showVideo)} className={`h-9 px-0 ${showVideo ? 'bg-red-500/20 text-red-500' : 'text-muted-foreground'}`}>
                                <div className="flex flex-col items-center">
                                    <VideoIcon className="h-3.5 w-3.5 mb-0.5" />
                                    <span className="text-[9px]">Vídeo</span>
                                </div>
                            </Button>
                        )}
                        {hasInfo && (
                            <Button variant="ghost" size="sm" onClick={() => setShowInfo(!showInfo)} className={`h-9 px-0 ${showInfo ? 'bg-blue-500/20 text-blue-500' : 'text-muted-foreground'}`}>
                                <div className="flex flex-col items-center">
                                    <Info className="h-3.5 w-3.5 mb-0.5" />
                                    <span className="text-[9px]">Info</span>
                                </div>
                            </Button>
                        )}
                    </div>
                </div>

            </div>

            {/* Expandable Content Area - Remained mostly same but adjusted padding */}
            {(showGif || showVideo || showInfo) && (
                <div className="bg-muted/30 border-t border-border p-3 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Gif View */}
                    {showGif && hasGif && (
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Demonstração Visual</p>
                            <div className="rounded-lg overflow-hidden border border-border bg-background max-w-xs mx-auto">
                                <img src={uploadedGif} alt="Demo" className="w-full h-auto object-cover" />
                            </div>
                        </div>
                    )}

                    {/* Video View */}
                    {showVideo && hasVideo && (
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Vídeo Completo</p>
                            <div className="aspect-video rounded-lg overflow-hidden bg-black shadow-sm">
                                {directVideoSrc ? (
                                    <video src={directVideoSrc} controls className="w-full h-full" />
                                ) : youtubeId && (
                                    <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeId}`} allowFullScreen />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Info View */}
                    {showInfo && (
                        <div className="space-y-3">
                            {we.exercise.instructions?.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Instruções</p>
                                    <ul className="list-disc pl-4 text-xs space-y-1 text-muted-foreground">
                                        {we.exercise.instructions.map((inst: string, i: number) => <li key={i}>{inst}</li>)}
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
