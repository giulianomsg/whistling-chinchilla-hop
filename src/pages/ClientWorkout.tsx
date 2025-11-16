import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
  AlertCircle
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

const ClientWorkout: React.FC = () => {
  const { user, profile } = useAuth()
  const [clientWorkout, setClientWorkout] = useState<ClientWorkout | null>(null)
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar plano ativo do cliente
  const fetchClientWorkout = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('client_workouts')
        .select(`
          *,
          workout:workouts(*)
        `)
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao buscar plano do cliente:', error)
        return
      }

      setClientWorkout(data)
      
      // Se encontrou um plano, buscar os exercícios
      if (data) {
        await fetchWorkoutExercises(data.workout_id)
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar exercícios do plano
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
        console.error('Erro ao buscar exercícios do plano:', error)
        return
      }

      setWorkoutExercises(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  useEffect(() => {
    fetchClientWorkout()
  }, [user])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando seu plano de treino...</p>
        </div>
      </div>
    )
  }

  if (!clientWorkout) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Você ainda não tem um plano de treino ativo
            </h2>
            <p className="text-gray-600 mb-6">
              Entre em contato com seu profissional para receber um plano personalizado.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Próximos passos:</strong><br />
                1. Fale com seu profissional de fitness<br />
                2. Solicite um plano de treino<br />
                3. Volte aqui para visualizar seus exercícios
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meu Treino</h1>
              <p className="text-gray-600">Seu plano personalizado de treino</p>
            </div>
          </div>

          {/* Informações do Plano */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {clientWorkout.workout.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientWorkout.workout.description && (
                <p className="text-gray-600 mb-4">{clientWorkout.workout.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant="secondary" className="text-xs">
                    Ativo
                  </Badge>
                </div>
              </div>

              {clientWorkout.workout.objective && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-700">Objetivo:</p>
                  <p className="text-sm text-gray-600">{clientWorkout.workout.objective}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercícios por Dia */}
          {workoutExercises.length > 0 && (
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
          )}
        </div>
      </div>
    )
  )
}

export default ClientWorkout