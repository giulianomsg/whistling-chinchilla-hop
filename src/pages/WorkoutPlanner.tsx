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
  GripVertical,
  Search,
  Filter
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
  
  // Estados para busca e filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [objectiveFilter, setObjectiveFilter] = useState<string>('all')

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

  // Objetivos comuns para filtro
  const objectives = [
    'Hipertrofia',
    'Emagrecimento',
    'Resistência',
    'Força',
    'Flexibilidade',
    'Condicionamento',
    'Reabilitação',
    'Outros'
  ]

  // Buscar workouts
  const fetchWorkouts = async () => {
    if (!user) return

    try {
      setPageLoading(true)
      let query = supabase
        .from('workouts')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      if (objectiveFilter !== 'all') {
        query = query.eq('objective', objectiveFilter)
      }

      const { data, error } = await query

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

      // ✅ PROTEGER CONTRA NULL: Filtrar itens com exercise null
      const filteredData = (data || []).filter(item => item.exercise !== null)
      setWorkoutExercises(filteredData)
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchWorkouts()
      fetchExercises()
    }
  }, [user?.id, loading, searchTerm, objectiveFilter])

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
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Planos de Treino
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Crie e gerencie planos de treino personalizados
              </p>
            </div>
            
            <Dialog open={isCreateWorkoutDialogOpen} onOpenChange={setIsCreateWorkoutDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-primary dark:text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-card border-gray-200 dark:border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Criar Novo Plano de Treino</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWorkout} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workout-name" className="dark:text-gray-200">Nome do Plano *</Label>
                    <Input
                      id="workout-name"
                      value={workoutFormData.name}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, name: e.target.value })}
                      placeholder="Plano de Hipertrofia"
                      required
                      className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="dark:text-gray-200">Duração (semanas)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="52"
                        value={workoutFormData.duration_weeks}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, duration_weeks: parseInt(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="days-per-week" className="dark:text-gray-200">Dias por semana</Label>
                      <Input
                        id="days-per-week"
                        type="number"
                        min="1"
                        max="7"
                        value={workoutFormData.days_per_week || 3}
                        onChange={(e) => setWorkoutFormData({ ...workoutFormData, days_per_week: parseInt(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objective" className="dark:text-gray-200">Objetivo</Label>
                    <Textarea
                      id="objective"
                      value={workoutFormData.objective}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, objective: e.target.value })}
                      placeholder="Hipertrofia, emagrecimento, resistência..."
                      rows={2}
                      className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="dark:text-gray-200">Descrição</Label>
                    <Textarea
                      id="description"
                      value={workoutFormData.description}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, description: e.target.value })}
                      placeholder="Descrição detalhada do plano..."
                      rows={3}
                      className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateWorkoutDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-primary">
                      Criar Plano
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar planos de treino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
              <SelectTrigger className="bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white">
                <SelectValue placeholder="Objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Objetivos</SelectItem>
                {objectives.map((objective) => (
                  <SelectItem key={objective} value={objective}>
                    {objective}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Workouts */}
        {pageLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <Card key={workout.id} className="relative bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{workout.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleManageExercises(workout)}
                        className="dark:text-gray-400 dark:hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditWorkout(workout)}
                        className="dark:text-gray-400 dark:hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                              Tem certeza que deseja deletar o plano "{workout.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:border-white/10 dark:text-gray-300">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteWorkout(workout.id)} className="bg-red-600 hover:bg-red-700 text-white">
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
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{workout.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {workout.duration_weeks} semanas
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {workout.days_per_week}x por semana
                      </span>
                    </div>

                    {workout.objective && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{workout.objective}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full mt-4 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10" 
                    variant="outline"
                    onClick={() => handleManageExercises(workout)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gerenciar Exercícios
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {workouts.length === 0 && !pageLoading && (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum plano encontrado</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Comece criando seu primeiro plano de treino personalizado.</p>
            <Button onClick={() => setIsCreateWorkoutDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Plano
            </Button>
          </div>
        )}

        {/* Sheet de Gerenciamento de Exercícios */}
        <Sheet open={isManageExercisesSheetOpen} onOpenChange={setIsManageExercisesSheetOpen}>
          <SheetContent className="w-[800px] sm:w-[1000px] bg-white dark:bg-card border-l border-gray-200 dark:border-white/10">
            <SheetHeader>
              <SheetTitle className="text-gray-900 dark:text-white">Gerenciar Exercícios - {selectedWorkout?.name}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exercícios do Plano</h3>
                <Dialog open={isAddExerciseDialogOpen} onOpenChange={setIsAddExerciseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Exercício
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white">Adicionar Exercício ao Plano</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddExercise} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="exercise-select" className="dark:text-gray-200">Exercício *</Label>
                        <Select 
                          value={exerciseFormData.exercise_id} 
                          onValueChange={(value) => setExerciseFormData({ ...exerciseFormData, exercise_id: value })}
                        >
                          <SelectTrigger className="dark:bg-background/50 dark:border-white/10 dark:text-white">
                            <SelectValue placeholder="Selecione um exercício" />
                          </SelectTrigger>
                          <SelectContent>
                            {exercises.map((exercise) => (
                              <SelectItem key={exercise.id} value={exercise.id}>
                                {exercise.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="day-number" className="dark:text-gray-200">Dia *</Label>
                          <Input
                            id="day-number"
                            type="number"
                            min="1"
                            max={selectedWorkout?.days_per_week || 7}
                            value={exerciseFormData.day_number}
                            onChange={(e) => setExerciseFormData({ ...exerciseFormData, day_number: parseInt(e.target.value) })}
                            required
                            className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sets" className="dark:text-gray-200">Séries *</Label>
                          <Input
                            id="sets"
                            type="number"
                            min="1"
                            max="10"
                            value={exerciseFormData.sets}
                            onChange={(e) => setExerciseFormData({ ...exerciseFormData, sets: parseInt(e.target.value) })}
                            required
                            className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reps" className="dark:text-gray-200">Repetições</Label>
                          <Input
                            id="reps"
                            value={exerciseFormData.reps}
                            onChange={(e) => setExerciseFormData({ ...exerciseFormData, reps: e.target.value })}
                            placeholder="8-12"
                            className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rest" className="dark:text-gray-200">Descanso (segundos)</Label>
                          <Input
                            id="rest"
                            type="number"
                            min="0"
                            max="600"
                            value={exerciseFormData.rest_time_seconds || 60}
                            onChange={(e) => setExerciseFormData({ ...exerciseFormData, rest_time_seconds: parseInt(e.target.value) })}
                            className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exercise-notes" className="dark:text-gray-200">Notas</Label>
                        <Textarea
                          id="exercise-notes"
                          value={exerciseFormData.notes}
                          onChange={(e) => setExerciseFormData({ ...exerciseFormData, notes: e.target.value })}
                          placeholder="Instruções especiais..."
                          rows={2}
                          className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddExerciseDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={!exerciseFormData.exercise_id} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Adicionar Exercício
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Exercícios por Dia */}
              {workoutExercises.length > 0 && (
                <Tabs defaultValue="day-1" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 dark:bg-card/50">
                    {Array.from({ length: selectedWorkout?.days_per_week || 3 }, (_, i) => (
                      <TabsTrigger 
                        key={i + 1} 
                        value={`day-${i + 1}`}
                        className="data-[state=active]:dark:bg-primary/20 data-[state=active]:dark:text-primary"
                      >
                        Dia {i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Array.from({ length: selectedWorkout?.days_per_week || 3 }, (_, i) => {
                    const dayNumber = i + 1
                    const dayExercises = exercisesByDay[dayNumber] || []
                    
                    return (
                      <TabsContent key={dayNumber} value={`day-${dayNumber}`} className="mt-6">
                        {dayExercises.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>Nenhum exercício para este dia</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {dayExercises.map((workoutExercise, index) => (
                              <Card key={workoutExercise.id} className="bg-white/50 dark:bg-card/20 border border-gray-200 dark:border-white/5">
                                <CardContent className="p-6">
                                  <div className="flex items-start gap-4">
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-200 rounded-full text-sm font-medium">
                                        {index + 1}
                                      </span>
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {workoutExercise.exercise?.name}
                                      </h3>
                                      
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        <Badge variant="secondary">
                                          {workoutExercise.sets} séries
                                        </Badge>
                                        <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">
                                          {workoutExercise.reps} reps
                                        </Badge>
                                        {workoutExercise.weight && (
                                          <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">
                                            {workoutExercise.weight} kg
                                          </Badge>
                                        )}
                                        {workoutExercise.rest_time_seconds && (
                                          <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">
                                            {workoutExercise.rest_time_seconds}s descanso
                                          </Badge>
                                        )}
                                      </div>

                                      {workoutExercise.notes && (
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            <strong>Nota:</strong> {workoutExercise.notes}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditWorkoutExercise(workoutExercise)}
                                        className="dark:text-gray-400 dark:hover:text-white"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button size="sm" variant="ghost">
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="dark:text-white">Confirmar Exclusão</AlertDialogTitle>
                                            <AlertDialogDescription className="dark:text-gray-400">
                                              Tem certeza que deseja remover "{workoutExercise.exercise?.name}" do plano?
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="dark:border-white/10 dark:text-gray-300">Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteWorkoutExercise(workoutExercise.id)} className="bg-red-600 hover:bg-red-700 text-white">
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
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialog de Edição de Exercício */}
        <Dialog open={isEditExerciseDialogOpen} onOpenChange={setIsEditExerciseDialogOpen}>
          <DialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Editar Exercício</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateWorkoutExercise} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sets" className="dark:text-gray-200">Séries *</Label>
                  <Input
                    id="edit-sets"
                    type="number"
                    min="1"
                    max="10"
                    value={editExerciseFormData.sets}
                    onChange={(e) => setEditExerciseFormData({ ...editExerciseFormData, sets: parseInt(e.target.value) })}
                    required
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reps" className="dark:text-gray-200">Repetições</Label>
                  <Input
                    id="edit-reps"
                    value={editExerciseFormData.reps}
                    onChange={(e) => setEditExerciseFormData({ ...editExerciseFormData, reps: e.target.value })}
                    placeholder="8-12"
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-weight" className="dark:text-gray-200">Peso (kg)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    min="0"
                    step="0.5"
                    value={editExerciseFormData.weight || ''}
                    onChange={(e) => setEditExerciseFormData({ ...editExerciseFormData, weight: e.target.value ? parseFloat(e.target.value) : null })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rest" className="dark:text-gray-200">Descanso (segundos)</Label>
                  <Input
                    id="edit-rest"
                    type="number"
                    min="0"
                    max="600"
                    value={editExerciseFormData.rest_time_seconds}
                    onChange={(e) => setEditExerciseFormData({ ...editExerciseFormData, rest_time_seconds: parseInt(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes" className="dark:text-gray-200">Notas</Label>
                <Textarea
                  id="edit-notes"
                  value={editExerciseFormData.notes}
                  onChange={(e) => setEditExerciseFormData({ ...editExerciseFormData, notes: e.target.value })}
                  placeholder="Instruções especiais..."
                  rows={2}
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditExerciseDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Atualizar Exercício
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição de Workout */}
        <Dialog open={isEditWorkoutDialogOpen} onOpenChange={setIsEditWorkoutDialogOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-card border-gray-200 dark:border-white/10">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Editar Plano de Treino</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateWorkout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-workout-name" className="dark:text-gray-200">Nome do Plano *</Label>
                <Input
                  id="edit-workout-name"
                  value={workoutFormData.name}
                  onChange={(e) => setWorkoutFormData({ ...workoutFormData, name: e.target.value })}
                  placeholder="Plano de Hipertrofia"
                  required
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration" className="dark:text-gray-200">Duração (semanas)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="1"
                    max="52"
                    value={workoutFormData.duration_weeks}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, duration_weeks: parseInt(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-days-per-week" className="dark:text-gray-200">Dias por semana</Label>
                  <Input
                    id="edit-days-per-week"
                    type="number"
                    min="1"
                    max="7"
                    value={workoutFormData.days_per_week}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, days_per_week: parseInt(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-objective" className="dark:text-gray-200">Objetivo</Label>
                <Textarea
                  id="edit-objective"
                  value={workoutFormData.objective}
                  onChange={(e) => setWorkoutFormData({ ...workoutFormData, objective: e.target.value })}
                  placeholder="Hipertrofia, emagrecimento, resistência..."
                  rows={2}
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="dark:text-gray-200">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={workoutFormData.description}
                  onChange={(e) => setWorkoutFormData({ ...workoutFormData, description: e.target.value })}
                  placeholder="Descrição detalhada do plano..."
                  rows={3}
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditWorkoutDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Atualizar Plano
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