import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dumbbell, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Calendar, 
  Target,
  Clock,
  Loader2,
  ChevronRight,
  GripVertical
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'

interface Workout {
  id: string
  name: string
  description: string | null
  objective: string | null
  duration_weeks: number
  days_per_week: number | null
  professional_id: string
  is_template: boolean
  created_at: string
  updated_at: string
}

interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_groups: string[] | null
  difficulty_level: string | null
  is_public: boolean
  created_by: string
}

interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  day_number: number
  order_index: number
  sets: number
  reps: string | null
  weight: number | null
  rest_time_seconds: number | null
  notes: string | null
  exercise?: Exercise
}

const WorkoutPlanner: React.FC = () => {
  const { user, profile, loading } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  // Dialog states
  const [isCreateWorkoutDialogOpen, setIsCreateWorkoutDialogOpen] = useState(false)
  const [isEditWorkoutDialogOpen, setIsEditWorkoutDialogOpen] = useState(false)
  const [isManageExercisesSheetOpen, setIsManageExercisesSheetOpen] = useState(false)
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false)
  const [isEditExerciseDialogOpen, setIsEditExerciseDialogOpen] = useState(false)

  // Form states
  const [workoutFormData, setWorkoutFormData] = useState({
    name: '',
    description: '',
    objective: '',
    duration_weeks: 4,
    days_per_week: 3
  })

  const [exerciseFormData, setExerciseFormData] = useState({
    exercise_id: '',
    day_number: 1,
    sets: 3,
    reps: '8-12',
    weight: null,
    rest_time_seconds: 60,
    notes: ''
  })

  // Estado para edição de exercício do plano
  const [editingExerciseDetails, setEditingExerciseDetails] = useState<WorkoutExercise | null>(null)
  const [editExerciseFormData, setEditExerciseFormData] = useState({
    sets: 3,
    reps: '8-12',
    weight: null,
    rest_time_seconds: 60,
    notes: ''
  })

  // Buscar workouts
  const fetchWorkouts = async () => {
    if (!user) return

    try {
      setPageLoading(true)
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar workouts:', error)
        showError('Erro ao carregar planos de treino')
        return
      }

      setWorkouts(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao carregar planos de treino')
    } finally {
      setPageLoading(false)
    }
  }

  // Buscar exercícios disponíveis
  const fetchExercises = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .order('name', { ascending: true })

      if (error) {
        console.error('Erro ao buscar exercícios:', error)
        return
      }

      setExercises(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar exercícios de um workout específico
  const fetchWorkoutExercises = async (workoutId: string) => {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises_library(*)
        `)
        .eq('workout_id', workoutId)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Erro ao buscar exercícios do workout:', error)
        return
      }

      setWorkoutExercises(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  useEffect(() => {
    // Só executa se o auth NÃO estiver carregando E o user existir
    if (!loading && user) {
      fetchWorkouts()
      fetchExercises()
    }
  }, [user, loading]) // <-- Muda as dependências

  // Resetar formulário de workout
  const resetWorkoutForm = () => {
    setWorkoutFormData({
      name: '',
      description: '',
      objective: '',
      duration_weeks: 4,
      days_per_week: 3
    })
  }

  // Resetar formulário de exercício
  const resetExerciseForm = () => {
    setExerciseFormData({
      exercise_id: '',
      day_number: 1,
      sets: 3,
      reps: '8-12',
      weight: null,
      rest_time_seconds: 60,
      notes: ''
    })
  }

  // Resetar formulário de edição de exercício
  const resetEditExerciseForm = () => {
    setEditExerciseFormData({
      sets: 3,
      reps: '8-12',
      weight: null,
      rest_time_seconds: 60,
      notes: ''
    })
    setEditingExerciseDetails(null)
  }

  // Criar workout
  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const workoutData = {
        name: workoutFormData.name,
        description: workoutFormData.description || null,
        objective: workoutFormData.objective || null,
        duration_weeks: workoutFormData.duration_weeks,
        days_per_week: workoutFormData.days_per_week,
        professional_id: user.id,
        is_template: false
      }

      const { error } = await supabase
        .from('workouts')
        .insert(workoutData)

      if (error) {
        console.error('Erro ao criar workout:', error)
        showError('Erro ao criar plano de treino')
        return
      }

      showSuccess('Plano de treino criado com sucesso!')
      setIsCreateWorkoutDialogOpen(false)
      resetWorkoutForm()
      fetchWorkouts()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao criar plano de treino')
    }
  }

  // Editar workout
  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout)
    setWorkoutFormData({
      name: workout.name,
      description: workout.description || '',
      objective: workout.objective || '',
      duration_weeks: workout.duration_weeks,
      days_per_week: workout.days_per_week || 3
    })
    setIsEditWorkoutDialogOpen(true)
  }

  // Atualizar workout
  const handleUpdateWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedWorkout) return

    try {
      const workoutData = {
        name: workoutFormData.name,
        description: workoutFormData.description || null,
        objective: workoutFormData.objective || null,
        duration_weeks: workoutFormData.duration_weeks,
        days_per_week: workoutFormData.days_per_week
      }

      const { error } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', selectedWorkout.id)

      if (error) {
        console.error('Erro ao atualizar workout:', error)
        showError('Erro ao atualizar plano de treino')
        return
      }

      showSuccess('Plano de treino atualizado com sucesso!')
      setIsEditWorkoutDialogOpen(false)
      setSelectedWorkout(null)
      resetWorkoutForm()
      fetchWorkouts()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao atualizar plano de treino')
    }
  }

  // Deletar workout
  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)

      if (error) {
        console.error('Erro ao deletar workout:', error)
        showError('Erro ao deletar plano de treino')
        return
      }

      showSuccess('Plano de treino deletado com sucesso!')
      fetchWorkouts()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao deletar plano de treino')
    }
  }

  // Gerenciar exercícios de um workout
  const handleManageExercises = async (workout: Workout) => {
    setSelectedWorkout(workout)
    await fetchWorkoutExercises(workout.id)
    setIsManageExercisesSheetOpen(true)
  }

  // Adicionar exercício ao workout
  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedWorkout) return

    try {
      // Obter o próximo order_index para este dia
      const dayExercises = workoutExercises.filter(we => we.day_number === exerciseFormData.day_number)
      const nextOrderIndex = dayExercises.length + 1

      const workoutExerciseData = {
        workout_id: selectedWorkout.id,
        exercise_id: exerciseFormData.exercise_id,
        day_number: exerciseFormData.day_number,
        order_index: nextOrderIndex,
        sets: exerciseFormData.sets,
        reps: exerciseFormData.reps,
        weight: exerciseFormData.weight,
        rest_time_seconds: exerciseFormData.rest_time_seconds,
        notes: exerciseFormData.notes || null
      }

      const { error } = await supabase
        .from('workout_exercises')
        .insert(workoutExerciseData)

      if (error) {
        console.error('Erro ao adicionar exercício:', error)
        showError('Erro ao adicionar exercício ao plano')
        return
      }

      showSuccess('Exercício adicionado com sucesso!')
      setIsAddExerciseDialogOpen(false)
      resetExerciseForm()
      fetchWorkoutExercises(selectedWorkout.id)
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao adicionar exercício')
    }
  }

  // Editar exercício do workout
  const handleEditWorkoutExercise = (workoutExercise: WorkoutExercise) => {
    setEditingExerciseDetails(workoutExercise)
    setEditExerciseFormData({
      sets: workoutExercise.sets,
      reps: workoutExercise.reps || '8-12',
      weight: workoutExercise.weight,
      rest_time_seconds: workoutExercise.rest_time_seconds || 60,
      notes: workoutExercise.notes || ''
    })
    setIsEditExerciseDialogOpen(true)
  }

  // Atualizar exercício do workout
  const handleUpdateWorkoutExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExerciseDetails) return

    try {
      const updateData = {
        sets: editExerciseFormData.sets,
        reps: editExerciseFormData.reps,
        weight: editExerciseFormData.weight,
        rest_time_seconds: editExerciseFormData.rest_time_seconds,
        notes: editExerciseFormData.notes || null
      }

      const { error } = await supabase
        .from('workout_exercises')
        .update(updateData)
        .eq('id', editingExerciseDetails.id)

      if (error) {
        console.error('Erro ao atualizar exercício do workout:', error)
        showError('Erro ao atualizar exercício do plano')
        return
      }

      showSuccess('Exercício atualizado com sucesso!')
      setIsEditExerciseDialogOpen(false)
      resetEditExerciseForm()
      if (selectedWorkout) {
        fetchWorkoutExercises(selectedWorkout.id)
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao atualizar exercício')
    }
  }

  // Deletar exercício do workout
  const handleDeleteWorkoutExercise = async (workoutExerciseId: string) => {
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', workoutExerciseId)

      if (error) {
        console.error('Erro ao deletar exercício do workout:', error)
        showError('Erro ao remover exercício do plano')
        return
      }

      showSuccess('Exercício removido com sucesso!')
      if (selectedWorkout) {
        fetchWorkoutExercises(selectedWorkout.id)
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao remover exercício')
    }
  }

  // Agrupar exercícios por dia
  const getExercisesByDay = () => {
    const grouped: { [key: number]: WorkoutExercise[] } = {}
    workoutExercises.forEach(we => {
      if (!grouped[we.day_number]) {
        grouped[we.day_number] = []
      }
      grouped[we.day_number].push(we)
    })
    return grouped
  }

  const exercisesByDay = getExercisesByDay()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Dumbbell className="h-8 w-8 text-blue-600" />
                Montador de Planos de Treino
              </h1>
              <p className="mt-2 text-gray-600">
                Crie e gerencie planos de treino personalizados
              </p>
            </div>
            
            <Dialog open={isCreateWorkoutDialogOpen} onOpenChange={setIsCreateWorkoutDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Plano de Treino</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWorkout} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workout-name">Nome do Plano *</Label>
                    <Input
                      id="workout-name"
                      value={workoutFormData.name}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, name: e.target.value })}
                      placeholder="Treino de Hipertrofia - 4 semanas"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workout-description">Descrição</Label>
                    <Textarea
                      id="workout-description"
                      value={workoutFormData.description}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, description: e.target.value })}
                      placeholder="Descrição detalhada do plano de treino..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workout-objective">Objetivo</Label>
                    <Input
                      id="workout-objective"
                      value={workoutFormData.objective}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, objective: e.target.value })}
                      placeholder="Hipertrofia, Definição, Força..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (semanas)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="52"
                        value={workoutFormData.duration_weeks}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, duration_weeks: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="days-per-week">Dias por semana</Label>
                      <Input
                        id="days-per-week"
                        type="number"
                        min="1"
                        max="7"
                        value={workoutFormData.days_per_week}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, days_per_week: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateWorkoutDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Criar Plano
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de Workouts */}
        {pageLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <Card key={workout.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditWorkout(workout)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar o plano "{workout.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteWorkout(workout.id)}>
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {workout.description && (
                    <p className="text-sm text-gray-600 mb-3">{workout.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {workout.objective && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Objetivo:</span>
                        <Badge variant="secondary" className="text-xs">
                          {workout.objective}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Duração:</span>
                      <span className="text-sm font-medium">{workout.duration_weeks} semanas</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Frequência:</span>
                      <span className="text-sm font-medium">{workout.days_per_week}x por semana</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleManageExercises(workout)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Gerenciar Exercícios
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {workouts.length === 0 && !pageLoading && (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano encontrado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro plano de treino personalizado.</p>
            <Button onClick={() => setIsCreateWorkoutDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Plano
            </Button>
          </div>
        )}

        {/* Sheet de Gerenciamento de Exercícios */}
        <Sheet open={isManageExercisesSheetOpen} onOpenChange={setIsManageExercisesSheetOpen}>
          <SheetContent className="w-full sm:w-[800px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Gerenciar Exercícios - {selectedWorkout?.name}</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Exercícios do Plano</h3>
                <Dialog open={isAddExerciseDialogOpen} onOpenChange={setIsAddExerciseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Exercício
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Exercício ao Plano</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddExercise} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="exercise-select">Exercício *</Label>
                        <Select value={exerciseFormData.exercise_id} onValueChange={(value) => setExerciseFormData({ ...exerciseFormData, exercise_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um exercício" />
                          </SelectTrigger>
                          <SelectContent>
                            {exercises.map((exercise) => (
                              <SelectItem key={exercise.id} value={exercise.id}>
                                {exercise.name} {exercise.is_public && '(Público)'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="day-number">Dia do Treino</Label>
                          <Input
                            id="day-number"
                            type="number"
                            min="1"
                            max={selectedWorkout?.days_per_week || 7}
                            value={exerciseFormData.day_number}
                            onChange={(e) => setExerciseFormData({ ...exerciseFormData, day_number: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sets">Séries</Label>
                          <Input
                            id="sets"
                            type="number"
                            min="1"
                            max="10"
                            value={exerciseFormData.sets}
                            onChange={(e) => setExerciseFormData({ ...exerciseFormData, sets: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reps">Repetições</Label>
                          <Input
                            id="reps"
                            value={exerciseFormData.reps}
                            onChange={(e) => setExerciseFormData({ ...exerciseFormData, reps: e.target.value })}
                            placeholder="8-12, 10, 15..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rest">Descanso (segundos)</Label>
                          <Input
                            id="rest"
                            type="number"
                            min="0"
                            max="600"
                            value={exerciseFormData.rest_time_seconds}
                            onChange={(e) => setExerciseFormData({ ...exerciseFormData, rest_time_seconds: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={exerciseFormData.notes}
                          onChange={(e) => setExerciseFormData({ ...exerciseFormData, notes: e.target.value })}
                          placeholder="Observações sobre o exercício..."
                          rows={2}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddExerciseDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={!exerciseFormData.exercise_id}>
                          Adicionar Exercício
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tabs por dia */}
              <Tabs defaultValue="day-1" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {Array.from({ length: selectedWorkout?.days_per_week || 3 }, (_, i) => (
                    <TabsTrigger key={i + 1} value={`day-${i + 1}`}>
                      Dia {i + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Array.from({ length: selectedWorkout?.days_per_week || 3 }, (_, i) => {
                  const dayNumber = i + 1
                  const dayExercises = exercisesByDay[dayNumber] || []
                  
                  return (
                    <TabsContent key={dayNumber} value={`day-${dayNumber}`} className="mt-4">
                      {dayExercises.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhum exercício para este dia</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dayExercises.map((workoutExercise, index) => (
                            <Card key={workoutExercise.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="flex items-center gap-2 mt-1">
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-500">
                                        #{index + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{workoutExercise.exercise?.name}</h4>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge variant="secondary">
                                          {workoutExercise.sets} séries
                                        </Badge>
                                        <Badge variant="outline">
                                          {workoutExercise.reps} reps
                                        </Badge>
                                        {workoutExercise.rest_time_seconds && (
                                          <Badge variant="outline">
                                            {workoutExercise.rest_time_seconds}s descanso
                                          </Badge>
                                        )}
                                      </div>
                                      {workoutExercise.notes && (
                                        <p className="text-sm text-gray-600 mt-2">{workoutExercise.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    {/* Botão de Editar */}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditWorkoutExercise(workoutExercise)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost">
                                          <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja remover "{workoutExercise.exercise?.name}" do plano?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteWorkoutExercise(workoutExercise.id)}>
                                            Remover
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  )
                })}
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialog de Edição de Workout */}
        <Dialog open={isEditWorkoutDialogOpen} onOpenChange={setIsEditWorkoutDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Plano de Treino</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateWorkout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-workout-name">Nome do Plano *</Label>
                <Input
                  id="edit-workout-name"
                  value={workoutFormData.name}
                  onChange={(e) => setWorkoutFormData({ ...workoutFormData, name: e.target.value })}
                  placeholder="Treino de Hipertrofia - 4 semanas"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-workout-description">Descrição</Label>
                <Textarea
                  id="edit-workout-description"
                  value={workoutFormData.description}
                  onChange={(e) => setWorkoutFormData({ ...workoutFormData, description: e.target.value })}
                  placeholder="Descrição detalhada do plano de treino..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-workout-objective">Objetivo</Label>
                <Input
                  id="edit-workout-objective"
                  value={workoutFormData.objective}
                  onChange={(e) => setWorkoutFormData({ ...workoutFormData, objective: e.target.value })}
                  placeholder="Hipertrofia, Definição, Força..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duração (semanas)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="1"
                    max="52"
                    value={workoutFormData.duration_weeks}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, duration_weeks: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-days-per-week">Dias por semana</Label>
                  <Input
                    id="edit-days-per-week"
                    type="number"
                    min="1"
                    max="7"
                    value={workoutFormData.days_per_week}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, days_per_week: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditWorkoutDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Atualizar Plano
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição de Exercício do Plano */}
        <Dialog open={isEditExerciseDialogOpen} onOpenChange={setIsEditExerciseDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Exercício do Plano</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateWorkoutExercise} className="space-y-4">
              <div className="space-y-2">
                <Label>Exercício</Label>
                <Input 
                  value={editingExerciseDetails?.exercise?.name || ''} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sets">Séries</Label>
                  <Input
                    id="edit-sets"
                    type="number"
                    min="1"
                    max="10"
                    value={editExerciseFormData.sets}
                    onChange={(e) => setEditExerciseFormData({ ...editExerciseFormData, sets: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reps">Repetições</Label>
                  <Input
                    id="edit-reps"
                    value={editExerciseFormData.reps}
                    onChange={(e) => setEditExerciseFormData({ ...editExerciseFormData, reps: e.target.value })}
                    placeholder="8-12, 10, 15..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Carga (kg)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    min="0"
                    step="0.5"
                    value={editExerciseFormData.weight || ''}
                    onChange={(e) => setEditExerciseFormData({ 
                      ...editExerciseFormData, 
                      weight: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rest">Descanso (segundos)</Label>
                  <Input
                    id="edit-rest"
                    type="number"
                    min="0"
                    max="600"
                    value={editExerciseFormData.rest_time_seconds}
                    onChange={(e) => setEditExerciseFormData({ ...editExerciseFormData, rest_time_seconds: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Observações</Label>
                <Textarea
                  id="edit-notes"
                  value={editExerciseFormData.notes}
                  onChange={(e) => setEditExerciseFormData({ ...editExerciseFormData, notes: e.target.value })}
                  placeholder="Observações sobre o exercício..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditExerciseDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Atualizar Exercício
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default WorkoutPlanner