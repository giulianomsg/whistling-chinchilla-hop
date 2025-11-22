import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dumbbell, Plus, Edit, Trash2, Settings, Calendar, Target, Clock, Loader2, GripVertical, Search
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
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isManageSheetOpen, setIsManageSheetOpen] = useState(false)
  const [isAddExDialogOpen, setIsAddExDialogOpen] = useState(false)

  // Estados de formulário simplificados para o exemplo
  const [newWorkout, setNewWorkout] = useState({ name: '', weeks: 4, days: 3, objective: '' })
  const [newExercise, setNewExercise] = useState({ exId: '', day: 1, sets: 3, reps: '10', note: '' })

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setPageLoading(true)
      const [wRes, eRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('professional_id', user.id).order('created_at', { ascending: false }),
        supabase.from('exercises_library').select('*').order('name')
      ])
      setWorkouts(wRes.data || [])
      setExercises(eRes.data || [])
      setPageLoading(false)
    }
    fetchData()
  }, [user])

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { error } = await supabase.from('workouts').insert({
      name: newWorkout.name, duration_weeks: newWorkout.weeks, days_per_week: newWorkout.days,
      objective: newWorkout.objective, professional_id: user.id, is_template: false
    })
    if (!error) {
      showSuccess('Plano criado!'); setIsCreateDialogOpen(false);
      // Reload simplificado
      window.location.reload() 
    } else showError('Erro ao criar plano')
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
      handleManage(selectedWorkout) // Reload list
      setIsAddExDialogOpen(false)
    }
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild><Button className="bg-primary text-black font-bold"><Plus className="mr-2 h-4 w-4"/> Novo Plano</Button></DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
              <DialogHeader><DialogTitle>Criar Plano</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateWorkout} className="space-y-4">
                <div><Label>Nome</Label><Input value={newWorkout.name} onChange={e => setNewWorkout({...newWorkout, name: e.target.value})} className="bg-black/20 border-white/10"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Semanas</Label><Input type="number" value={newWorkout.weeks} onChange={e => setNewWorkout({...newWorkout, weeks: +e.target.value})} className="bg-black/20 border-white/10"/></div>
                  <div><Label>Dias/sem</Label><Input type="number" value={newWorkout.days} onChange={e => setNewWorkout({...newWorkout, days: +e.target.value})} className="bg-black/20 border-white/10"/></div>
                </div>
                <div><Label>Objetivo</Label><Input value={newWorkout.objective} onChange={e => setNewWorkout({...newWorkout, objective: e.target.value})} className="bg-black/20 border-white/10"/></div>
                <Button type="submit" className="w-full bg-primary text-black">Salvar</Button>
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
                <CardTitle className="text-white text-lg flex justify-between">{workout.name} 
                  <Button variant="ghost" size="icon" onClick={() => handleManage(workout)} className="text-gray-400 hover:text-white"><Settings className="h-4 w-4"/></Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400 text-sm space-y-2">
                <div className="flex gap-2 items-center"><Clock className="h-4 w-4"/> {workout.duration_weeks} semanas</div>
                <div className="flex gap-2 items-center"><Calendar className="h-4 w-4"/> {workout.days_per_week}x por semana</div>
                <div className="flex gap-2 items-center"><Target className="h-4 w-4"/> {workout.objective || 'Geral'}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sheet de Gerenciamento */}
        <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
          <SheetContent className="bg-slate-900 border-l border-white/10 text-white w-[90%] sm:w-[600px] overflow-y-auto">
            <SheetHeader><SheetTitle className="text-white">Editar: {selectedWorkout?.name}</SheetTitle></SheetHeader>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Exercícios</h3>
                <Dialog open={isAddExDialogOpen} onOpenChange={setIsAddExDialogOpen}>
                  <DialogTrigger asChild><Button size="sm" className="bg-white/10 hover:bg-white/20 text-white"><Plus className="h-4 w-4 mr-2"/> Add</Button></DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader><DialogTitle>Adicionar Exercício</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <Select onValueChange={v => setNewExercise({...newExercise, exId: v})}>
                        <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Selecione..."/></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/10 text-white">
                          {exercises.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-3 gap-2">
                        <div><Label>Dia</Label><Input type="number" className="bg-black/20 border-white/10" value={newExercise.day} onChange={e => setNewExercise({...newExercise, day: +e.target.value})}/></div>
                        <div><Label>Séries</Label><Input type="number" className="bg-black/20 border-white/10" value={newExercise.sets} onChange={e => setNewExercise({...newExercise, sets: +e.target.value})}/></div>
                        <div><Label>Reps</Label><Input className="bg-black/20 border-white/10" value={newExercise.reps} onChange={e => setNewExercise({...newExercise, reps: e.target.value})}/></div>
                      </div>
                      <Button onClick={handleAddExercise} className="w-full bg-primary text-black">Confirmar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs defaultValue="day-1">
                <TabsList className="bg-white/5 w-full justify-start overflow-x-auto">
                  {Array.from({length: selectedWorkout?.days_per_week || 1}, (_, i) => (
                    <TabsTrigger key={i} value={`day-${i+1}`} className="data-[state=active]:bg-primary data-[state=active]:text-black">Dia {i+1}</TabsTrigger>
                  ))}
                </TabsList>
                {Array.from({length: selectedWorkout?.days_per_week || 1}, (_, i) => (
                  <TabsContent key={i} value={`day-${i+1}`} className="space-y-3 mt-4">
                    {workoutExercises.filter(we => we.day_number === i+1).map(we => (
                      <Card key={we.id} className="bg-white/5 border-white/10 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="bg-white/10 w-6 h-6 flex items-center justify-center rounded-full text-xs">{we.order_index}</span>
                          <div>
                            <div className="font-bold">{we.exercise?.name}</div>
                            <div className="text-xs text-gray-400">{we.sets} x {we.reps}</div>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-900/20"><Trash2 className="h-4 w-4"/></Button>
                      </Card>
                    ))}
                    {workoutExercises.filter(we => we.day_number === i+1).length === 0 && <div className="text-center text-gray-500 text-sm py-4">Sem exercícios neste dia</div>}
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