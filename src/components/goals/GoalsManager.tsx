
import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Target, Plus, Trash2, Edit2, CheckCircle, Calendar } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'

interface Goal {
    id: string
    title: string
    target_type: string
    start_value: number
    current_value: number
    target_value: number
    deadline: string | null
    status: 'active' | 'completed' | 'abandoned'
}

interface GoalsManagerProps {
    clientId: string | undefined
    simplified?: boolean
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ clientId, simplified = false }) => {
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

    const initialFormState = {
        title: '',
        target_type: 'weight',
        start_value: '',
        current_value: '',
        target_value: '',
        deadline: ''
    }
    const [formData, setFormData] = useState(initialFormState)

    useEffect(() => {
        if (clientId) fetchGoals()
    }, [clientId])

    const fetchGoals = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('user_goals')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setGoals(data || [])
        } catch (err) {
            console.error('Error fetching goals:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (goal?: Goal) => {
        if (goal) {
            setEditingGoal(goal)
            setFormData({
                title: goal.title,
                target_type: goal.target_type,
                start_value: goal.start_value.toString(),
                current_value: goal.current_value.toString(),
                target_value: goal.target_value.toString(),
                deadline: goal.deadline || ''
            })
        } else {
            setEditingGoal(null)
            setFormData(initialFormState)
        }
        setIsDialogOpen(true)
    }

    const handleSaveDefault = async () => {
        try {
            if (!clientId) return

            const payload = {
                client_id: clientId,
                title: formData.title,
                target_type: formData.target_type,
                start_value: parseFloat(formData.start_value),
                current_value: parseFloat(formData.current_value),
                target_value: parseFloat(formData.target_value),
                deadline: formData.deadline || null,
                status: 'active'
            }

            if (editingGoal) {
                const { error } = await supabase.from('user_goals').update(payload).eq('id', editingGoal.id)
                if (error) throw error
                showSuccess('Meta atualizada!')
            } else {
                const { error } = await supabase.from('user_goals').insert(payload)
                if (error) throw error
                showSuccess('Meta criada!')
            }

            setIsDialogOpen(false)
            fetchGoals()
        } catch (err: any) {
            showError('Erro ao salvar meta.')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir esta meta?')) return
        try {
            const { error } = await supabase.from('user_goals').delete().eq('id', id)
            if (error) throw error
            showSuccess('Meta excluída.')
            setGoals(prev => prev.filter(g => g.id !== id))
        } catch (e) {
            showError('Erro ao excluir.')
        }
    }

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        handleDelete(id);
    }

    const calculateProgress = (start: number, current: number, target: number) => {
        if (target === start) return 100
        const totalDiff = target - start
        const currentDiff = current - start
        const percent = (currentDiff / totalDiff) * 100
        return Math.min(Math.max(percent, 0), 100)
    }

    const renderGoalCard = (goal: Goal) => {
        const progress = calculateProgress(goal.start_value, goal.current_value, goal.target_value)
        return (
            <div key={goal.id} className={`${simplified ? 'bg-muted/50 p-3 rounded-md border border-border mb-2 last:mb-0' : 'bg-card border border-border p-4 rounded-lg'} space-y-2 cursor-pointer hover:bg-muted/60 transition-colors`} onClick={() => handleOpenDialog(goal)}>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className={`font-bold text-foreground ${simplified ? 'text-sm' : ''}`}>{goal.title}</h4>
                        {!simplified && <p className="text-xs text-muted-foreground capitalize">{goal.target_type.replace('_', ' ')}</p>}
                    </div>
                    {!simplified && <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={(e) => handleDeleteClick(e, goal.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground text-xs">Progresso</span>
                        <span className="font-semibold text-xs">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    {!simplified && <div>Início: {goal.start_value}</div>}
                    <div className="font-bold text-foreground">Atual: {goal.current_value}</div>
                    <div className="font-bold text-blue-500">Alvo: {goal.target_value}</div>
                </div>

                {goal.deadline && (
                    <div className="flex items-center gap-1 text-[10px] text-orange-500 mt-1">
                        <Calendar className="h-3 w-3" /> Prazo: {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                )}
            </div>
        )
    }

    if (simplified) {
        if (goals.length === 0) return <div className="text-sm text-muted-foreground text-center py-4">Nenhuma meta específica definida.</div>
        return <div className="space-y-3">{goals.map(renderGoalCard)}</div>
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-red-500" /> Metas & Objetivos</CardTitle>
                    <CardDescription>Defina e acompanhe suas metas de curto e longo prazo.</CardDescription>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nova Meta</Button>
            </CardHeader>
            <CardContent>
                {goals.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                        Nenhuma meta definida. Comece criando uma!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goals.map(renderGoalCard)}
                    </div>
                )}
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
                        <DialogDescription>Preencha os dados da sua meta.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Título da Meta</Label>
                            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Chegar a 80kg" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Tipo</Label>
                                <Select value={formData.target_type} onValueChange={v => setFormData({ ...formData, target_type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weight">Peso Corporal</SelectItem>
                                        <SelectItem value="body_fat">% Gordura</SelectItem>
                                        <SelectItem value="squat">Agachamento</SelectItem>
                                        <SelectItem value="bench">Supino</SelectItem>
                                        <SelectItem value="deadlift">Lev. Terra</SelectItem>
                                        <SelectItem value="custom">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Prazo (Opcional)</Label>
                                <Input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div><Label>Valor Inicial</Label><Input type="number" value={formData.start_value} onChange={e => setFormData({ ...formData, start_value: e.target.value })} /></div>
                            <div><Label>Valor Atual</Label><Input type="number" value={formData.current_value} onChange={e => setFormData({ ...formData, current_value: e.target.value })} /></div>
                            <div><Label>Valor Alvo</Label><Input type="number" value={formData.target_value} onChange={e => setFormData({ ...formData, target_value: e.target.value })} /></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveDefault}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

export default GoalsManager
