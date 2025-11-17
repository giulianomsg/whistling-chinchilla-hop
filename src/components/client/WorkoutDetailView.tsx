import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dumbbell, 
  Calendar, 
  Target,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Timer,
  BarChart3
} from 'lucide-react'
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

interface ClientWorkout {
  id: string
  client_id: string
  workout_id: string
  professional_id: string
  start_date: string
  end_date: string | null
  status: string
  notes: string | null
  workout: Workout
}

interface WorkoutDetailViewProps {
  clientWorkout: ClientWorkout
}

const WorkoutDetailView: React.FC<WorkoutDetailViewProps> = ({ clientWorkout }) => {
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar exercícios do treino
  const fetchWorkoutExercises = async () => {
    try {
      console.log('🔍 [WORKOUT_DETAIL] Buscando exercícios do treino:', clientWorkout.workout_id)
      setLoading(true)
      
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises_library(*)
        `)
        .eq('workout_id', clientWorkout.workout_id)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) {
        console.error('❌ [WORKOUT_DETAIL] Erro ao buscar exercícios:', error)
        return
      }

      // ✅ PROTEGER CONTRA NULL: Filtrar itens com exercise null
      const filteredData = (data || []).filter(item => item.exercise !== null)
      console.log('✅ [WORKOUT_DETAIL] Exercícios carregados:', filteredData.length)
      setWorkoutExercises(filteredData)
    } catch (error) {
      console.error('❌ [WORKOUT_DETAIL] Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clientWorkout?.workout_id) {
      fetchWorkoutExercises()
    }
  }, [clientWorkout?.workout_id])

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

  // Calcular estatísticas do treino
  const getWorkoutStats = () => {
    const totalExercises = workoutExercises.length
    const totalSets = workoutExercises.reduce((sum, we) => sum + we.sets, 0)
    const muscleGroups = new Set<string>()
    
    workoutExercises.forEach(we => {
      if (we.exercise?.muscle_groups) {
        we.exercise.muscle_groups.forEach(mg => muscleGroups.add(mg))
      }
    })

    return {
      totalExercises,
      totalSets,
      muscleGroups: Array.from(muscleGroups),
      daysPerWeek: clientWorkout.workout.days_per_week || 0
    }
  }

  const stats = getWorkoutStats()

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-gray-600">Carregando detalhes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Treino */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-600" />
            {clientWorkout.workout.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientWorkout.workout.description && (
            <p className="text-gray-600 mb-4">{clientWorkout.workout.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Início:</span>
              <span className="text-sm font-medium">
                {new Date(clientWorkout.start_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Duração:</span>
              <span className="text-sm font-medium">{clientWorkout.workout.duration_weeks} semanas</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Frequência:</span>
              <span className="text-sm font-medium">{stats.daysPerWeek}x por semana</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant="secondary" className="text-xs">
                Ativo
              </Badge>
            </div>
          </div>

          {clientWorkout.workout.objective && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm font-medium text-blue-800">Objetivo:</p>
              <p className="text-sm text-blue-700">{clientWorkout.workout.objective}</p>
            </div>
          )}

          {clientWorkout.notes && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Nota do profissional:</strong> {clientWorkout.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas do Treino */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Estatísticas do Treino
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.totalExercises}</p>
              <p className="text-sm text-gray-600">Exercícios</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.totalSets}</p>
              <p className="text-sm text-gray-600">Séries Totais</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.daysPerWeek}</p>
              <p className="text-sm text-gray-600">Dias/Semana</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{stats.muscleGroups.length}</p>
              <p className="text-sm text-gray-600">Grupos Musculares</p>
            </div>
          </div>
          
          {stats.muscleGroups.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Grupos Musculares Trabalhados:</p>
              <div className="flex flex-wrap gap-1">
                {stats.muscleGroups.map((muscle, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercícios por Dia */}
      {workoutExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exercícios do Treino</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="day-1" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {Array.from({ length: clientWorkout.workout.days_per_week || 3 }, (_, i) => (
                  <TabsTrigger key={i + 1} value={`day-${i + 1}`}>
                    Dia {i + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Array.from({ length: clientWorkout.workout.days_per_week || 3 }, (_, i) => {
                const dayNumber = i + 1
                const dayExercises = exercisesByDay[dayNumber] || []
                
                return (
                  <TabsContent key={dayNumber} value={`day-${dayNumber}`} className="mt-6">
                    {dayExercises.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Nenhum exercício para este dia</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dayExercises.map((workoutExercise, index) => (
                          <Card key={workoutExercise.id}>
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {workoutExercise.exercise?.name}
                                  </h3>
                                  
                                  {workoutExercise.exercise?.description && (
                                    <p className="text-gray-600 mb-3">
                                      {workoutExercise.exercise.description}
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-2 mb-3">
                                    <Badge variant="secondary">
                                      {workoutExercise.sets} séries
                                    </Badge>
                                    <Badge variant="outline">
                                      {workoutExercise.reps} reps
                                    </Badge>
                                    {workoutExercise.weight && (
                                      <Badge variant="outline">
                                        {workoutExercise.weight} kg
                                      </Badge>
                                    )}
                                    {workoutExercise.rest_time_seconds && (
                                      <Badge variant="outline">
                                        {workoutExercise.rest_time_seconds}s descanso
                                      </Badge>
                                    )}
                                  </div>

                                  {workoutExercise.exercise?.muscle_groups && workoutExercise.exercise.muscle_groups.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-sm font-medium text-gray-700 mb-1">Músculos trabalhados:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {workoutExercise.exercise.muscle_groups.map((muscle, muscleIndex) => (
                                          <Badge key={muscleIndex} variant="secondary" className="text-xs">
                                            {muscle}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {workoutExercise.notes && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                      <p className="text-sm text-yellow-800">
                                        <strong>Nota do profissional:</strong> {workoutExercise.notes}
                                      </p>
                                    </div>
                                  )}
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
          </CardContent>
        </Card>
      )}

      {workoutExercises.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exercício encontrado</h3>
            <p className="text-gray-600">
              Este treino ainda não possui exercícios cadastrados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WorkoutDetailView