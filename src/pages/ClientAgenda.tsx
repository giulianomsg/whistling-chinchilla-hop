import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Plus, Calendar as CalendarIcon, CheckCircle, Clock } from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { format, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

interface ScheduledWorkout {
    id: string
    workout_id: string
    scheduled_at: string
    status: 'pending' | 'completed' | 'cancelled' | 'pending_approval' | 'confirmed' | 'rejected'
    created_by: string
    notes?: string
    workout?: {
        name: string
    }
}

interface WorkoutSession {
    id: string
    workout_id: string
    created_at: string
    status: 'completed' | 'abandoned' | 'started'
    duration_seconds?: number
    workout?: {
        name: string
    }
}

interface ClientWorkout {
    id: string
    workout: {
        id: string
        name: string
    }
}

const ClientAgenda: React.FC = () => {
    const { user } = useAuth()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([])
    const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
    const [availableWorkouts, setAvailableWorkouts] = useState<ClientWorkout[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('')
    const [submitting, setSubmitting] = useState(false)
    const [professionalId, setProfessionalId] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState('09:00')

    // Rejection State
    const [rejectionReason, setRejectionReason] = useState('')
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [selectedScheduleId, setSelectedScheduleId] = useState('')
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [cancellationReason, setCancellationReason] = useState('')
    const [selectedAgendaDetails, setSelectedAgendaDetails] = useState<any>(null)

    // History Detail State
    const [selectedHistorySession, setSelectedHistorySession] = useState<WorkoutSession | null>(null)
    const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false)
    const [historyLogs, setHistoryLogs] = useState<any[]>([])
    const [historyLogsLoading, setHistoryLogsLoading] = useState(false)

    // Carregar dados
    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // 1. Buscar Sessões Passadas (Histórico)
                const { data: sessions, error: sessionsError } = await supabase
                    .from('workout_sessions')
                    .select('*, workout:workouts(name)')
                    .eq('client_id', user.id)
                    .order('created_at', { ascending: false })

                if (sessionsError) throw sessionsError

                // Fetch Professional
                const { data: proLink } = await supabase
                    .from('client_professionals')
                    .select('professional_id')
                    .eq('client_id', user.id)
                    .eq('status', 'active')
                    .maybeSingle()

                if (proLink) setProfessionalId(proLink.professional_id)

                // 2. Buscar Agendamentos Futuros
                const { data: scheduled, error: scheduledError } = await supabase
                    .from('scheduled_workouts')
                    .select('*, workout:workouts(name)')
                    .eq('client_id', user.id)
                    .neq('status', 'rejected')
                    .order('scheduled_at', { ascending: true })

                if (scheduledError) throw scheduledError

                // 3. Buscar Treinos Disponíveis para Agendar
                const { data: workouts, error: workoutsError } = await supabase
                    .from('client_workouts')
                    .select('id, workout:workouts(id, name)')
                    .eq('client_id', user.id)
                    .eq('status', 'active')

                if (workoutsError) throw workoutsError

                setWorkoutSessions(sessions || [])
                setScheduledWorkouts(scheduled || [])
                // Cast to fix TS error, assuming supabase returns correct structure but TS infers array for join sometimes
                const typedWorkouts = (workouts as any)?.map((item: any) => ({
                    id: item.id,
                    workout: Array.isArray(item.workout) ? item.workout[0] : item.workout
                }))
                setAvailableWorkouts(typedWorkouts || [])
            } catch (error) {
                console.error('Erro ao carregar agenda:', error)
                toast.error('Não foi possível carregar sua agenda.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        const channel = supabase
            .channel(`my-agenda-${user.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'scheduled_workouts', filter: `client_id=eq.${user.id}` },
                () => {
                    fetchAgenda()
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [user])

    const fetchAgenda = async () => {
        if (!user) return
        const { data } = await supabase
            .from('scheduled_workouts')
            .select('*, workout:workouts(name)')
            .eq('client_id', user.id)
            .order('scheduled_at', { ascending: true })
        if (data) setScheduledWorkouts(data)
    }

    // Helpers para o Calendário
    const getDayContent = (day: Date) => {
        // Verificar se tem sessão completada
        const hasSession = workoutSessions.some(s => isSameDay(new Date(s.created_at), day))
        // Verificar se tem agendamento
        const hasSchedule = scheduledWorkouts.some(s => isSameDay(new Date(s.scheduled_at), day))

        if (hasSession) return <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-500" />
        if (hasSchedule) return <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
        return null
    }

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate)
        if (newDate && isAfter(newDate, startOfDay(new Date()))) {
            // Se for futuro, limpar seleção anterior para o modal
            setSelectedWorkoutId('')
        }
    }

    const handleScheduleWorkout = async () => {
        if (!date || !selectedWorkoutId || !user) return

        setSubmitting(true)
        try {
            // Parse DateTime
            const [hours, minutes] = selectedTime.split(':').map(Number)
            const scheduledDateTime = new Date(date)
            scheduledDateTime.setHours(hours, minutes, 0, 0)

            if (isBefore(scheduledDateTime, new Date())) {
                toast.error('Não é possível agendar no passado.')
                setSubmitting(false)
                return
            }

            // Conflict Check
            if (professionalId) {
                const { data: isAvailable, error: conflictError } = await supabase.rpc('check_professional_availability', {
                    p_professional_id: professionalId,
                    p_start_time: scheduledDateTime.toISOString(),
                    p_duration_minutes: 60,
                    p_exclude_schedule_id: null
                })

                if (isAvailable === false) {
                    if (!confirm('O professor já tem um agendamento neste horário. Deseja solicitar mesmo assim?')) {
                        setSubmitting(false)
                        return
                    }
                }
            }

            // Encontrar o workout real ID a partir do client_workout selection
            const selectedClientWorkout = availableWorkouts.find(cw => cw.workout.id === selectedWorkoutId)

            if (!selectedClientWorkout) throw new Error("Treino inválido")

            const { error } = await supabase.from('scheduled_workouts').insert({
                client_id: user.id,
                workout_id: selectedWorkoutId,
                scheduled_at: scheduledDateTime.toISOString(),
                status: 'pending_approval',
                created_by: user.id,
                professional_id: professionalId // Populate pro_id
            })

            if (error) throw error

            toast.success('Treino agendado com sucesso!')
            setIsDialogOpen(false)

            // Refresh list
            const { data: updatedScheduled } = await supabase
                .from('scheduled_workouts')
                .select('*, workout:workouts(name)')
                .eq('client_id', user.id)
                .order('scheduled_at', { ascending: true })

            if (updatedScheduled) setScheduledWorkouts(updatedScheduled)

        } catch (error) {
            console.error('Erro ao agendar:', error)
            toast.error('Erro ao agendar treino.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancelWithReason = async () => {
        if (!cancellationReason.trim()) { toast.error('Informe o motivo'); return; }
        try {
            const { error } = await supabase.from('scheduled_workouts').update({ status: 'cancelled', cancellation_reason: cancellationReason }).eq('id', selectedScheduleId)
            if (error) throw error
            toast.success('Agendamento cancelado.')
            setScheduledWorkouts(prev => prev.filter(s => s.id !== selectedScheduleId))
            setIsCancelDialogOpen(false)
            setCancellationReason('')
        } catch (e) { toast.error('Erro ao cancelar') }
    }

    const handleApproveSchedule = async (scheduleId: string) => {
        try {
            const { error } = await supabase.from('scheduled_workouts').update({ status: 'confirmed' }).eq('id', scheduleId)
            if (error) throw error
            toast.success('Agendamento confirmado!')
            // Refresh
            const { data } = await supabase.from('scheduled_workouts').select('*, workout:workouts(name)').eq('client_id', user!.id).order('scheduled_at', { ascending: true })
            if (data) setScheduledWorkouts([...data])
        } catch (e) { toast.error('Erro ao confirmar') }
    }

    const handleRejectSchedule = (scheduleId: string) => {
        setSelectedScheduleId(scheduleId)
        setRejectionReason('')
        setIsRejectDialogOpen(true)
    }

    const confirmRejection = async () => {
        try {
            const { error } = await supabase.from('scheduled_workouts').update({
                status: 'rejected',
                rejection_reason: rejectionReason
            }).eq('id', selectedScheduleId)

            if (error) throw error
            toast.success('Agendamento rejeitado.')
            setScheduledWorkouts(prev => prev.filter(s => s.id !== selectedScheduleId))
            setIsRejectDialogOpen(false)
        } catch (e) { toast.error('Erro ao rejeitar') }
    }

    const handleHistorySessionClick = async (session: WorkoutSession) => {
        setSelectedHistorySession(session)
        setIsHistoryDetailOpen(true)
        setHistoryLogsLoading(true)

        const { data } = await supabase
            .from('workout_execution_logs')
            .select(`*, exercise:exercises_library(name)`)
            .eq('workout_session_id', session.id)
            .order('completed_at', { ascending: true })

        setHistoryLogs(data || [])
        setHistoryLogsLoading(false)
    }

    // Filtrar dados para o dia selecionado
    const selectedDateSessions = date ? workoutSessions.filter(s => isSameDay(new Date(s.created_at), date)) : []
    const selectedDateSchedules = date ? scheduledWorkouts.filter(s => isSameDay(new Date(s.scheduled_at), date)) : []
    const isFutureDate = date ? isAfter(date, new Date()) || isSameDay(date, new Date()) : false

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <CalendarIcon className="h-8 w-8 text-primary" /> Minha Agenda
                        </h1>
                        <p className="text-muted-foreground mt-1">Gerencie seus treinos e visualize seu histórico.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Coluna do Calendário */}
                    <div className="md:col-span-4 lg:col-span-4">
                        <Card className="border-border bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-4 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    locale={ptBR}
                                    className="rounded-md border border-border"
                                    components={{
                                        DayContent: (props) => (
                                            <div className="relative flex items-center justify-center w-full h-full text-sm">
                                                {props.date.getDate()}
                                                {getDayContent(props.date)}
                                            </div>
                                        )
                                    }}
                                />
                            </CardContent>
                        </Card>

                        {/* Legenda */}
                        <div className="mt-4 flex gap-4 justify-center text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Realizado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>Agendado</span>
                            </div>
                        </div>
                    </div>

                    {/* Coluna de Detalhes */}
                    <div className="md:col-span-8 lg:col-span-8 space-y-6">
                        <Card className="border-border min-h-[400px]">
                            <CardHeader className="border-b border-border">
                                <div className="flex justify-between items-center">
                                    <CardTitle>
                                        {date ? format(date, "d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
                                    </CardTitle>
                                    {isFutureDate && (selectedDateSchedules.length === 0 && selectedDateSessions.length === 0) && (
                                        <Button onClick={() => setIsDialogOpen(true)} size="sm" className="gap-2">
                                            <Plus className="h-4 w-4" /> Agendar Treino
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {loading ? (
                                    <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                                ) : (
                                    <>
                                        {/* Treinos Agendados */}
                                        {selectedDateSchedules.length > 0 && (
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-blue-500 flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4" /> Agendado
                                                </h3>
                                                {selectedDateSchedules.map(schedule => (
                                                    <div key={schedule.id} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex justify-between items-center">
                                                        <div>
                                                            <h4 className="font-bold text-foreground">{schedule.workout?.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge
                                                                    variant={
                                                                        schedule.status === 'confirmed' ? 'default' :
                                                                            schedule.status === 'cancelled' ? 'destructive' : 'outline'
                                                                    }
                                                                    className={`cursor-pointer hover:opacity-80 ${schedule.status === 'pending_approval' ? 'border-yellow-500 text-yellow-600' : ''}`}
                                                                    onClick={() => setSelectedAgendaDetails(schedule)}
                                                                >
                                                                    {schedule.status === 'pending_approval' ? 'Aguardando Aprovação' :
                                                                        schedule.status === 'confirmed' ? 'Confirmado' :
                                                                            schedule.status === 'cancelled' ? 'Cancelado' : schedule.status}
                                                                </Badge>
                                                                {schedule.created_by !== user?.id && <span className="text-xs bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Solicitação do Professor</span>}
                                                            </div>
                                                        </div>

                                                        {schedule.status === 'pending_approval' && schedule.created_by !== user?.id ? (
                                                            <div className="flex gap-2">
                                                                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleRejectSchedule(schedule.id)}>Rejeitar</Button>
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveSchedule(schedule.id)}>Aceitar</Button>
                                                            </div>
                                                        ) : (
                                                            (schedule.status !== 'cancelled' && schedule.status !== 'rejected') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-muted-foreground hover:text-destructive"
                                                                    onClick={() => { setSelectedScheduleId(schedule.id); setIsCancelDialogOpen(true) }}
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                            )
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Treinos Realizados */}
                                        {selectedDateSessions.length > 0 && (
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-green-500 flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4" /> Realizado
                                                </h3>
                                                {selectedDateSessions.map(session => (
                                                    <div
                                                        key={session.id}
                                                        className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 cursor-pointer hover:bg-green-500/20 transition-colors"
                                                        onClick={() => handleHistorySessionClick(session)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-foreground">{session.workout?.name}</h4>
                                                                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.duration_seconds ? `${Math.floor(session.duration_seconds / 60)} min` : '--'}</span>
                                                                    <span className="flex items-center gap-1 capitalize">{format(new Date(session.created_at), 'HH:mm')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Estado Vazio */}
                                        {selectedDateSchedules.length === 0 && selectedDateSessions.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-dashed border-2 border-border">
                                                <CalendarIcon className="h-12 w-12 mb-3 opacity-20" />
                                                <p>Nenhum treino para este dia.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>

                            <Dialog open={!!selectedAgendaDetails} onOpenChange={(open) => !open && setSelectedAgendaDetails(null)}>
                                <DialogContent className="bg-card border-border text-foreground">
                                    <DialogHeader><DialogTitle>Detalhes do Agendamento</DialogTitle></DialogHeader>
                                    {selectedAgendaDetails && (
                                        <div className="space-y-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <div className="text-xs text-muted-foreground">Horário</div>
                                                    <div className="font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> {format(new Date(selectedAgendaDetails.scheduled_at), "dd/MM 'às' HH:mm")}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-xs text-muted-foreground">Treino</div>
                                                    <div className="font-medium">{selectedAgendaDetails.workout?.name}</div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground">Status</div>
                                                <Badge
                                                    variant={selectedAgendaDetails.status === 'confirmed' ? 'default' : selectedAgendaDetails.status === 'cancelled' ? 'destructive' : 'outline'}
                                                    className={selectedAgendaDetails.status === 'pending_approval' ? 'border-yellow-500 text-yellow-600' : ''}
                                                >
                                                    {selectedAgendaDetails.status === 'pending_approval' ? 'Pendente' :
                                                        selectedAgendaDetails.status === 'confirmed' ? 'Confirmado' :
                                                            selectedAgendaDetails.status === 'cancelled' ? 'Cancelado' : selectedAgendaDetails.status}
                                                </Badge>
                                            </div>
                                            {selectedAgendaDetails.cancellation_reason && (
                                                <div className="space-y-1">
                                                    <div className="text-xs text-red-500 font-medium">Motivo do Cancelamento</div>
                                                    <div className="text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded border border-red-100 dark:border-red-800">
                                                        {selectedAgendaDetails.cancellation_reason}
                                                    </div>
                                                </div>
                                            )}
                                            <DialogFooter><Button onClick={() => setSelectedAgendaDetails(null)}>Fechar</Button></DialogFooter>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </Card>
                    </div>
                </div>

                {/* Dialog de Agendamento */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>Agendar Treino</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Data Selecionada</Label>
                                <div className="p-3 bg-muted rounded-md border border-border text-foreground font-medium">
                                    {date ? format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Horário</Label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="time"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Selecione o Treino</Label>
                                <Select value={selectedWorkoutId} onValueChange={setSelectedWorkoutId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Escolha um treino..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableWorkouts.map(cw => (
                                            <SelectItem key={cw.workout.id} value={cw.workout.id}>
                                                {cw.workout.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleScheduleWorkout} disabled={!selectedWorkoutId || submitting}>
                                {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                Confirmar Agendamento
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog de Rejeição */}
                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent className="bg-card border-border text-foreground">
                        <DialogHeader><DialogTitle>Rejeitar Solicitação</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <Label>Motivo da Rejeição</Label>
                            <Textarea
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                placeholder="Por que você não pode neste horário?"
                                className="resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={confirmRejection} disabled={!rejectionReason.trim()}>Rejeitar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog de Cancelamento */}
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                    <DialogContent className="bg-card border-border text-foreground">
                        <DialogHeader><DialogTitle>Cancelar Agendamento</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <Label>Motivo do Cancelamento</Label>
                            <Textarea
                                value={cancellationReason}
                                onChange={e => setCancellationReason(e.target.value)}
                                placeholder="Motivo do cancelamento (Obrigatório)"
                                className="resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>Voltar</Button>
                            <Button variant="destructive" onClick={handleCancelWithReason} disabled={!cancellationReason.trim()}>Confirmar Cancelamento</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog de Detalhes do Histórico */}
                <Dialog open={isHistoryDetailOpen} onOpenChange={setIsHistoryDetailOpen}>
                    <DialogContent className="bg-card border-border text-foreground sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{selectedHistorySession?.workout?.name}</DialogTitle>
                            <div className="text-sm text-muted-foreground flex gap-3">
                                <span>{selectedHistorySession && format(new Date(selectedHistorySession.created_at), "d 'de' MMMM", { locale: ptBR })}</span>
                            </div>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4 mt-4">
                            {historyLogsLoading ? (
                                <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                            ) : historyLogs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">Nenhum registro de exercício encontrado.</div>
                            ) : (
                                <div className="space-y-4">
                                    {historyLogs.map((log, index) => (
                                        <div key={log.id || index} className="bg-muted p-4 rounded-lg border border-border">
                                            <h4 className="font-bold text-foreground mb-2">{log.exercise?.name || 'Exercício'}</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-background p-2 rounded border border-border">
                                                    <span className="text-muted-foreground block text-xs uppercase">Carga</span>
                                                    <span className="font-mono font-bold">{log.weight} kg</span>
                                                </div>
                                                <div className="bg-background p-2 rounded border border-border">
                                                    <span className="text-muted-foreground block text-xs uppercase">Repetições</span>
                                                    <span className="font-mono font-bold">{log.reps}</span>
                                                </div>
                                            </div>
                                            {log.notes && (
                                                <div className="mt-2 text-sm text-muted-foreground italic border-t border-border/50 pt-2">
                                                    "{log.notes}"
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
        </div>
    )
}

export default ClientAgenda
