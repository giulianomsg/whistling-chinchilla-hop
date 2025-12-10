
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Plus, Calendar as CalendarIcon, CheckCircle, Clock } from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { format, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns'

interface ScheduledWorkout {
    id: string
    workout_id: string
    scheduled_at: string
    status: 'pending' | 'completed' | 'cancelled'
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

                // 2. Buscar Agendamentos Futuros
                const { data: scheduled, error: scheduledError } = await supabase
                    .from('scheduled_workouts')
                    .select('*, workout:workouts(name)')
                    .eq('client_id', user.id)
                    //.eq('status', 'pending') // Mostrar todos por enquanto
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
                setAvailableWorkouts(workouts || [])
            } catch (error) {
                console.error('Erro ao carregar agenda:', error)
                toast.error('Não foi possível carregar sua agenda.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

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
            // Encontrar o workout real ID a partir do client_workout selection
            const selectedClientWorkout = availableWorkouts.find(cw => cw.workout.id === selectedWorkoutId)

            if (!selectedClientWorkout) throw new Error("Treino inválido")

            const { error } = await supabase.from('scheduled_workouts').insert({
                client_id: user.id,
                workout_id: selectedWorkoutId,
                scheduled_at: date.toISOString(),
                status: 'pending'
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

    const handleCancelSchedule = async (id: string) => {
        try {
            const { error } = await supabase.from('scheduled_workouts').delete().eq('id', id)
            if (error) throw error
            toast.success('Agendamento cancelado.')
            setScheduledWorkouts(prev => prev.filter(s => s.id !== id))
        } catch (error) {
            toast.error('Erro ao cancelar.')
        }
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
                                                            <p className="text-sm text-blue-400 capitalize">{schedule.status === 'pending' ? 'Pendente' : schedule.status}</p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleCancelSchedule(schedule.id)}
                                                        >
                                                            Cancelar
                                                        </Button>
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
                                                    <div key={session.id} className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
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
                                                <p>Nenhuma atividade para este dia.</p>
                                                {isFutureDate && (
                                                    <Button variant="link" onClick={() => setIsDialogOpen(true)} className="mt-2 text-primary">
                                                        Agendar um treino agora
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
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
            </div>
        </div>
    )
}

export default ClientAgenda
