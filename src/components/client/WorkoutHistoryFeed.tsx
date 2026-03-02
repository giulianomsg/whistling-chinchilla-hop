import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Clock, Dumbbell, ChevronRight, Loader2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'

interface WorkoutHistoryFeedProps {
    clientId: string;
}

const WorkoutHistoryFeed: React.FC<WorkoutHistoryFeedProps> = ({ clientId }) => {
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState<any>(null)
    const [sessionLogs, setSessionLogs] = useState<any[]>([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    useEffect(() => {
        if (!clientId) return
        const fetchSessions = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('workout_sessions')
                .select(`*, workout:workouts(name)`)
                .eq('client_id', clientId)
                .eq('status', 'completed')
                .order('ended_at', { ascending: false })

            setSessions(data || [])
            setLoading(false)
        }
        fetchSessions()
    }, [clientId])

    const handleSessionClick = async (session: any) => {
        setSelectedSession(session)
        setIsDetailOpen(true)
        setLogsLoading(true)

        const { data } = await supabase
            .from('workout_execution_logs')
            .select(`*, exercise:exercises_library(name)`)
            .eq('workout_session_id', session.id)
            .order('completed_at', { ascending: true })

        setSessionLogs(data || [])
        setLogsLoading(false)
    }

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        return `${m} min`
    }

    if (loading) return <div className="py-12 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

    if (sessions.length === 0) {
        return (
            <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">Nenhum treino registrado</h3>
                    <p className="text-muted-foreground">Complete seu primeiro treino para vê-lo aqui!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {sessions.map(session => (
                <Card
                    key={session.id}
                    className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleSessionClick(session)}
                >
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-bold text-foreground text-lg">{session.workout?.name || 'Treino Personalizado'}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(session.ended_at).toLocaleDateString('pt-BR')}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(session.duration_seconds)}</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
            ))}

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-lg bg-card border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle>{selectedSession?.workout?.name}</DialogTitle>
                        <DialogDescription>
                            Realizado em {selectedSession && new Date(selectedSession.ended_at).toLocaleDateString('pt-BR')} • Duração: {selectedSession && formatDuration(selectedSession.duration_seconds)}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] pr-4">
                        {logsLoading ? (
                            <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                        ) : sessionLogs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">Nenhum exercício registrado neste treino.</div>
                        ) : (
                            <div className="space-y-4">
                                {sessionLogs.map((log, idx) => (
                                    <div key={log.id} className={cn("bg-muted/50 p-4 rounded-lg border border-border", log.is_valid_for_xp === false && "opacity-75")}>
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                <span className={cn("text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs", log.is_valid_for_xp === false ? "bg-destructive/10 text-destructive" : "bg-primary/10")}>{idx + 1}</span>
                                                <span className={cn(log.is_valid_for_xp === false && "line-through text-muted-foreground")}>{log.exercise?.name}</span>
                                            </h4>
                                            {log.is_valid_for_xp === false && (
                                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                                    <AlertTriangle className="h-3 w-3" /> Carga sob revisão
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="bg-background p-2 rounded border border-border">
                                                <span className="text-muted-foreground block text-xs">Carga</span>
                                                <span className={cn("font-mono font-medium", log.is_valid_for_xp === false && "line-through")}>{log.weight || '-'} kg</span>
                                            </div>
                                            <div className="bg-background p-2 rounded border border-border">
                                                <span className="text-muted-foreground block text-xs">Repetições</span>
                                                <span className={cn("font-mono font-medium", log.is_valid_for_xp === false && "line-through")}>{log.reps || '-'}</span>
                                            </div>
                                        </div>
                                        {log.notes && (
                                            <div className="mt-2 text-sm text-muted-foreground bg-background p-2 rounded border border-border">
                                                <span className="block text-xs font-semibold mb-1">Notas:</span>
                                                <span className={cn(log.is_valid_for_xp === false && "line-through")}>{log.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default WorkoutHistoryFeed
