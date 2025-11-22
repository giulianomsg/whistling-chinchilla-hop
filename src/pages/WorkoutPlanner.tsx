import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Dumbbell, Plus, Edit, Trash2, Settings, Calendar, Target, Clock, Loader2, GripVertical, Search, Check
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'

const WorkoutPlanner: React.FC = () => {
  const { user, loading } = useAuth()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [exercises, setExercises] = useState<any[]>([])
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null)
  
  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isManageSheetOpen, setIsManageSheetOpen] = useState(false)
  const [isAddExDialogOpen, setIsAddExDialogOpen] = useState(false)

  // States do Formulário de Plano
  const initialPlanState = { id: '', name: '', weeks: 4, days: 3, objective: '', description: '' }
  const [planForm, setPlanForm] = useState(initialPlanState)
  const [isEditing, setIsEditing] = useState(false)

  // State do Exercício
  const [newExercise, setNewExercise] = useState({ exId: '', day: 1, sets: 3, reps: '10', note: '' })

  const fetchWorkouts = async () => {
    if (!user) return
    setPageLoading(true)
    const { data } = await supabase.from('workouts').select('*').eq('professional_id', user.id).order('created_at', { ascending: false })
    setWorkouts(data || [])
    setPageLoading(false)
  }

  useEffect(() => {
    if (!user) return
    fetchWorkouts()
    const loadExs = async () => {
      const { data } = await supabase.from('exercises_library').select('*').order('name')
      setExercises(data || [])
    }
    loadExs()
  }, [user])

  // Resetar form ao abrir criação
  const openCreateDialog = () => {
    setPlanForm(initialPlanState)
    setIsEditing(false)
    setIsCreateDialogOpen(true)
  }

  // Preencher form ao abrir edição
  const openEditDialog = (workout: any) => {
    setPlanForm({
      id: workout.id,
      name: workout.name,
      weeks: workout.duration_weeks,
      days: workout.days_per_week,
      objective: workout.objective || '',
      description: workout.description || ''
    })
    setIsEditing(true)
    setIsCreateDialogOpen(true)
  }

  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const payload = {
      name: planForm.name, 
      duration_weeks: planForm.weeks, 
      days_per_week: planForm.days,
      objective: planForm.objective, 
      description: planForm.description,
      professional_id: user.id, 
      is_template: false
    }

    let error
    if (isEditing) {
      const res = await supabase.from('workouts').update(payload).eq('id', planForm.id)
      error = res.error
    } else {
      const res = await supabase.from('workouts').insert(payload)
      error = res.error
    }

    if (!error) {
      showSuccess(isEditing ? 'Plano atualizado!' : 'Plano criado!')
      setIsCreateDialogOpen(false)
      fetchWorkouts()
    } else {
      showError('Erro ao salvar plano')
    }
  }

  const handleDeleteWorkout = async (id: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (!error) { showSuccess('Plano excluído'); fetchWorkouts() }
    else showError('Erro ao excluir')
  }

  const handleManage = async (workout: any) => {
    setSelectedWorkout(workout)
    const { data } = await supabase.from('workout_exercises').select(`*, exercise:exercises_library(*)`).eq('workout_id', workout.id).order('day_number').order('order_index')
    setWorkoutExercises(data || [])
    setIsManageSheetOpen(true)
  }

  const handleAddExercise = async () => {
    if (!selectedWorkout || !newExercise.exId) return
    const { error } = await supabase.from('workout_exercises').insert({
      workout_id: selectedWorkout.id, exercise_id: newExercise.exId,
      day_number: newExercise.day, sets: newExercise.sets, reps: newExercise.reps, notes: newExercise.note,
      order_index: 99
    })
    if (!error) {
      showSuccess('Exercício adicionado!')
      // Refresh local
      const { data } = await supabase.from('workout_exercises').select(`*, exercise:exercises_library(*)`).eq('workout_id', selectedWorkout.id).order('day_number').order('order_index')
      setWorkoutExercises(data || [])
      setIsAddExDialogOpen(false)
    }
  }

  const handleDeleteExercise = async (id: string) => {
    await supabase.from('workout_exercises').delete().eq('id', id)
    const { data } = await supabase.from('workout_exercises').select(`*, exercise:exercises_library(*)`).eq('workout_id', selectedWorkout.id).order('day_number').order('order_index')
    setWorkoutExercises(data || [])
  }

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Dumbbell className="text-primary"/> Planos de Treino</h1>
            <p className="text-gray-400 mt-1">Crie e gerencie rotinas de treino.</p>
          </div>
          <Button onClick={openCreateDialog} className="bg-primary text-black font-bold"><Plus className="mr-2 h-4 w-4"/> Novo Plano</Button>
          
          {/* Dialog Create/Edit Unified */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-lg">
              <DialogHeader><DialogTitle>{isEditing ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSaveWorkout} className="space-y-4">
                <div><Label>Nome do Plano *</Label><Input required value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="bg-black/20 border-white/10"/></div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Duração (Semanas)</Label><Input type="number" min="1" value={planForm.weeks} onChange={e => setPlanForm({...planForm, weeks: +e.target.value})} className="bg-black/20 border-white/10"/></div>
                  <div><Label>Dias por Semana</Label><Input type="number" min="1" max="7" value={planForm.days} onChange={e => setPlanForm({...planForm, days: +e.target.value})} className="bg-black/20 border-white/10"/></div>
                </div>
                
                <div><Label>Objetivo Principal</Label><Input value={planForm.objective} onChange={e => setPlanForm({...planForm, objective: e.target.value})} className="bg-black/20 border-white/10" placeholder="Ex: Hipertrofia"/></div>
                
                <div><Label>Descrição Detalhada</Label><Textarea rows={3} value={planForm.description} onChange={e => setPlanForm({...planForm, description: e.target.value})} className="bg-black/20 border-white/10" placeholder="Ex: Foco em pernas e ombros..."/></div>
                
                <Button type="submit" className="w-full bg-primary text-black font-bold">{isEditing ? 'Atualizar Plano' : 'Criar Plano'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input placeholder="Buscar planos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workouts.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map(workout => (
            <Card key={workout.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg truncate">{workout.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleManage(workout)} title="Gerenciar Exercícios" className="text-gray-400 hover:text-white"><Settings className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(workout)} title="Editar Informações" className="text-gray-400 hover:text-blue-400"><Edit className="h-4 w-4"/></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                        <AlertDialogHeader><AlertDialogTitle>Excluir Plano?</AlertDialogTitle><AlertDialogDescription>Isso não afeta treinos já iniciados por alunos.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel className="text-black">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteWorkout(workout.id)} className="bg-red-600">Excluir</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-gray-400 text-sm space-y-2">
                <div className="flex gap-2 items-center"><Clock className="h-4 w-4"/> {workout.duration_weeks} semanas</div>
                <div className="flex gap-2 items-center"><Calendar className="h-4 w-4"/> {workout.days_per_week}x por semana</div>
                <div className="flex gap-2 items-center"><Target className="h-4 w-4"/> {workout.objective || 'Geral'}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sheet de Gerenciamento de Exercícios */}
        <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
          <SheetContent className="bg-slate-900 border-l border-white/10 text-white w-[90%] sm:w-[600px] overflow-y-auto">
            <SheetHeader><SheetTitle className="text-white">Gerenciar: {selectedWorkout?.name}</SheetTitle></SheetHeader>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Exercícios do Plano</h3>
                <Dialog open={isAddExDialogOpen} onOpenChange={setIsAddExDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50"><Plus className="h-4 w-4 mr-2"/> Adicionar</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader><DialogTitle>Adicionar Exercício</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Exercício</Label>
                        <Select onValueChange={v => setNewExercise({...newExercise, exId: v})}>
                          <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Selecione..."/></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10 text-white max-h-60">
                            {exercises.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div><Label>Dia (1-{selectedWorkout?.days_per_week})</Label><Input type="number" min="1" max={selectedWorkout?.days_per_week} className="bg-black/20 border-white/10" value={newExercise.day} onChange={e => setNewExercise({...newExercise, day: +e.target.value})}/></div>
                        <div><Label>Séries</Label><Input type="number" className="bg-black/20 border-white/10" value={newExercise.sets} onChange={e => setNewExercise({...newExercise, sets: +e.target.value})}/></div>
                        <div><Label>Reps</Label><Input className="bg-black/20 border-white/10" value={newExercise.reps} onChange={e => setNewExercise({...newExercise, reps: e.target.value})}/></div>
                      </div>
                      <div><Label>Nota (Opcional)</Label><Input className="bg-black/20 border-white/10" value={newExercise.note} onChange={e => setNewExercise({...newExercise, note: e.target.value})} placeholder="Ex: Drop-set na última"/></div>
                      <Button onClick={handleAddExercise} disabled={!newExercise.exId} className="w-full bg-primary text-black">Confirmar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs defaultValue="day-1">
                <TabsList className="bg-white/5 w-full justify-start overflow-x-auto p-1">
                  {Array.from({length: selectedWorkout?.days_per_week || 1}, (_, i) => (
                    <TabsTrigger key={i} value={`day-${i+1}`} className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 px-4">Dia {i+1}</TabsTrigger>
                  ))}
                </TabsList>
                {Array.from({length: selectedWorkout?.days_per_week || 1}, (_, i) => (
                  <TabsContent key={i} value={`day-${i+1}`} className="space-y-3 mt-4">
                    {workoutExercises.filter(we => we.day_number === i+1).map(we => (
                      <div key={we.id} className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center justify-between group hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/20 text-primary w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-inner">{we.order_index}</div>
                          <div>
                            <div className="font-bold text-white">{we.exercise?.name}</div>
                            <div className="text-xs text-gray-400">{we.sets} séries x {we.reps} reps</div>
                            {we.notes && <div className="text-[10px] text-yellow-500/80 mt-1">{we.notes}</div>}
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteExercise(we.id)} className="text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    ))}
                    {workoutExercises.filter(we => we.day_number === i+1).length === 0 && <div className="text-center text-gray-500 text-sm py-8 bg-white/5 rounded-lg border border-dashed border-white/10">Sem exercícios neste dia</div>}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default WorkoutPlanner