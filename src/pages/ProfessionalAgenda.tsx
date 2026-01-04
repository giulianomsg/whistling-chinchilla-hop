
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar as CalendarIcon, Clock, User, CheckCircle, AlertCircle } from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { format, isSameDay, startOfDay } from 'date-fns'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const ProfessionalAgenda: React.FC = () => {
    const { user } = useAuth()
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [allSchedules, setAllSchedules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Details Modal
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    useEffect(() => {
        const fetchAllSchedules = async () => {
            if (!user) return
            setLoading(true)
            try {
                // Fetch schedules where relevant. Since we don't have 'professional_id' populated for everyone yet, 
                // we rely on 'client_professionals' join or 'created_by' logic?
                // Ideally, with 0065 migration, we start populating professional_id.
                // But for now, let's fetch ALL schedules for clients of this professional.
                // Or better, let's look for schedules where this user is the professional.

                // Since the migration adds professional_id, we should use it.
                // For old records it's null, so we might miss them unless we backfill.
                // Let's assume migration is run and future schedules will have it. 
                // For completeness, we can also fetch based on client relationship.

                // Let's stick to 'professional_id' for simplicity and robust future proofing.
                // Assuming RLS policy allows seeing these rows.

                const { data, error } = await supabase
                    .from('scheduled_workouts')
                    .select(`
                        *,
                        client:profiles!client_id(full_name, avatar_url, id),
                        workout:workouts(name)
                    `)
                    .eq('professional_id', user.id)
                    .neq('status', 'rejected') // Maybe exclude rejected?
                    .order('scheduled_at', { ascending: true })

                if (error) throw error
                setAllSchedules(data || [])
            } catch (error) {
                console.error("Error fetching agenda", error)
                toast.error("Erro ao carregar agenda global.")
            } finally {
                setLoading(false)
            }
        }

        fetchAllSchedules()
    }, [user])

    const getDayContent = (day: Date) => {
        const daySchedules = allSchedules.filter(s => isSameDay(new Date(s.scheduled_at), day))
        if (daySchedules.length === 0) return null

        // Color logic: If any conflict/overlap? No, just status.
        const hasPending = daySchedules.some(s => s.status === 'pending_approval')
        const hasConfirmed = daySchedules.some(s => s.status === 'confirmed')

        let colorClass = 'bg-blue-500' // Default confirmed
        if (hasPending) colorClass = 'bg-yellow-500'

        return <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${colorClass}`} />
    }

    const selectedDateSchedules = date ? allSchedules.filter(s => isSameDay(new Date(s.scheduled_at), date)) : []

    const openDetails = (schedule: any) => {
        setSelectedSchedule(schedule)
        setIsDetailOpen(true)
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="w-full mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <CalendarIcon className="h-8 w-8 text-primary" /> Agenda Global
                        </h1>
                        <p className="text-muted-foreground mt-1">Visualize todos os seus atendimentos.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4">
                        <Card className="border-border">
                            <CardContent className="p-4 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
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
                        <div className="mt-4 flex gap-4 justify-center text-sm text-muted-foreground">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span>Pendente</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span>Confirmado</span></div>
                        </div>
                    </div>

                    <div className="md:col-span-8 space-y-6">
                        <Card className="border-border min-h-[400px]">
                            <CardHeader className="border-b border-border">
                                <CardTitle>{date ? format(date, "d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {loading ? (
                                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
                                ) : selectedDateSchedules.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">Nenhum agendamento para este dia.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedDateSchedules.map(schedule => (
                                            <div
                                                key={schedule.id}
                                                className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border cursor-pointer hover:bg-muted/80 transition-colors"
                                                onClick={() => openDetails(schedule)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-primary/10 p-2 rounded-full text-primary font-bold text-xs flex flex-col items-center min-w-[50px]">
                                                        <span>{format(new Date(schedule.scheduled_at), 'HH:mm')}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-foreground flex items-center gap-2">
                                                            {schedule.client?.full_name || 'Aluno Desconhecido'}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">{schedule.workout?.name || 'Treino'}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={
                                                    schedule.status === 'confirmed' ? 'default' :
                                                        schedule.status === 'cancelled' ? 'destructive' : 'outline'
                                                } className={schedule.status === 'pending_approval' ? 'border-yellow-500 text-yellow-600' : ''}>
                                                    {schedule.status === 'pending_approval' ? 'Pendente' :
                                                        schedule.status === 'confirmed' ? 'Confirmado' :
                                                            schedule.status === 'cancelled' ? 'Cancelado' : schedule.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="bg-card border-border text-foreground">
                        <DialogHeader>
                            <DialogTitle>Detalhes do Agendamento</DialogTitle>
                        </DialogHeader>
                        {selectedSchedule && (
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Horário</div>
                                        <div className="font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> {format(new Date(selectedSchedule.scheduled_at), "dd/MM 'às' HH:mm")}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Duração Estimada</div>
                                        <div className="font-medium">{selectedSchedule.duration_minutes || 60} min</div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Aluno</div>
                                    <div className="font-medium flex items-center gap-2"><User className="h-4 w-4" /> {selectedSchedule.client?.full_name}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Treino</div>
                                    <div className="font-medium">{selectedSchedule.workout?.name}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">Status</div>
                                    <Badge variant={
                                        selectedSchedule.status === 'confirmed' ? 'default' :
                                            selectedSchedule.status === 'cancelled' ? 'destructive' : 'outline'
                                    } className={selectedSchedule.status === 'pending_approval' ? 'border-yellow-500 text-yellow-600' : ''}>
                                        {selectedSchedule.status === 'pending_approval' ? 'Pendente' :
                                            selectedSchedule.status === 'confirmed' ? 'Confirmado' :
                                                selectedSchedule.status === 'cancelled' ? 'Cancelado' : selectedSchedule.status}
                                    </Badge>
                                </div>
                                {selectedSchedule.cancellation_reason && (
                                    <div className="space-y-1">
                                        <div className="text-xs text-red-500 font-medium">Motivo do Cancelamento</div>
                                        <div className="text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded border border-red-100 dark:border-red-800">
                                            {selectedSchedule.cancellation_reason}
                                        </div>
                                    </div>
                                )}
                                {selectedSchedule.notes && (
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Observações</div>
                                        <div className="text-sm bg-muted p-2 rounded">{selectedSchedule.notes}</div>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-border flex justify-end gap-2">
                                    {/* Future actions: Cancel, Reschedule */}
                                    {/* For now just Close */}
                                    <Button onClick={() => setIsDetailOpen(false)}>Fechar</Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div >
    )
}

export default ProfessionalAgenda
