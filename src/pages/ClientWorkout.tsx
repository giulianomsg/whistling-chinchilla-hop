import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Dumbbell, 
  Calendar, 
  Target,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Maximize2
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import WorkoutDetailView from '@/components/client/WorkoutDetailView'

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
  const [showDetailView, setShowDetailView] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Buscar plano ativo do cliente
  const fetchClientWorkout = async () => {
    if (!user) {
      console.log('❌ [CLIENT_WORKOUT] Usuário null, não buscando plano')
      return
    }

    try {
      console.log('🔍 [CLIENT_WORKOUT] Buscando plano do cliente:', user.id)
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
        console.error('❌ [CLIENT_WORKOUT] Erro ao buscar plano do cliente:', error)
        console.error('❌ [CLIENT_WORKOUT] Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details
        })
        return
      }

      console.log('✅ [CLIENT_WORKOUT] Plano encontrado:', data)
      setClientWorkout(data)
      
      // Se encontrou um plano, buscar os exercícios
      if (data) {
        await fetchWorkoutExercises(data.workout_id)
      }
    } catch (error) {
      console.error('❌ [CLIENT_WORKOUT] Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar exercícios do plano
  const fetchWorkoutExercises = async (workoutId: string) => {
    try {
      console.log('🔍 [CLIENT_WORKOUT] Buscando exercícios do plano:', workoutId)
      
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
        console.error('❌ [CLIENT_WORKOUT] Erro ao buscar exercícios do plano:', error)
        return
      }

      // ✅ PROTEGER CONTRA NULL: Filtrar itens com exercise null
      const filteredData = (data || []).filter(item => item.exercise !== null)
      console.log('✅ [CLIENT_WORKOUT] Exercícios do plano carregados:', filteredData.length)
      setWorkoutExercises(filteredData)
    } catch (error) {
      console.error('❌ [CLIENT_WORKOUT] Erro inesperado:', error)
    }
  }

  // useEffect simplificado e estável
  useEffect(() => {
    console.log('🔍 [CLIENT_WORKOUT] useEffect chamado', { 
      user: !!user, 
      profile: !!profile,
      userId: user?.id,
      initialized
    })
    
    // Só executar se tiver usuário e ainda não foi inicializado
    if (user && !initialized) {
      console.log('🚀 [CLIENT_WORKOUT] Inicializando busca de plano')
      setInitialized(true)
      fetchClientWorkout()
    }
  }, [user?.id, profile?.id, initialized])

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

  if (showDetailView) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailView(false)}
              className="mb-4"
            >
              ← Voltar para Visão Resumida
            </Button>
          </div>
          <WorkoutDetailView clientWorkout={clientWorkout} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Meu Treino</h1>
                <p className="text-gray-600">Seu plano personalizado de treino</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowDetailView(true)}
              className="flex items-center gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Ver Detalhes Completos
            </Button>
          </div>
        </div>

        {/* Card Resumo do Plano */}
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

            {clientWorkout.notes && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Nota do profissional:</strong> {clientWorkout.notes}
                </p>
              </div>
            )}

            {/* Estatísticas Rápidas */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <p className="text-xl font-bold text-blue-600">{workoutExercises.length}</p>
                <p className="text-xs text-gray-600">Exercícios</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <p className="text-xl font-bold text-green-600">
                  {workoutExercises.reduce((sum, we) => sum + we.sets, 0)}
                </p>
                <p className="text-xs text-gray-600">Séries Totais</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <p className="text-xl font-bold text-purple-600">
                  {clientWorkout.workout.days_per_week || 0}
                </p>
                <p className="text-xs text-gray-600">Dias/Semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prévia dos Exercícios por Dia */}
        {workoutExercises.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-600" />
                Prévia dos Exercícios
              </CardTitle>
              <p className="text-sm text-gray-600">
                Clique em "Ver Detalhes Completos" para ver todos os exercícios com instruções detalhadas
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: Math.min(3, clientWorkout.workout.days_per_week || 3) }, (_, i) => {
                  const dayNumber = i + 1
                  const dayExercises = exercisesByDay[dayNumber] || []
                  
                  return (
                    <div key={dayNumber} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Dia {dayNumber}</h3>
                      <div className="space-y-2">
                        {dayExercises.slice(0, 3).map((workoutExercise, index) => (
                          <div key={workoutExercise.id} className="flex items-center gap-2 text-sm">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 truncate">
                              {workoutExercise.exercise?.name}
                            </span>
                          </div>
                        ))}
                        {dayExercises.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{dayExercises.length - 3} exercícios...
                          </p>
                        )}
                        {dayExercises.length === 0 && (
                          <p className="text-xs text-gray-500">Nenhum exercício</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => setShowDetailView(true)}
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                >
                  <Maximize2 className="h-4 w-4" />
                  Ver Todos os Exercícios Detalhados
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {workoutExercises.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exercício encontrado</h3>
              <p className="text-gray-600 mb-4">
                Seu profissional ainda não adicionou exercícios a este plano.
              </p>
              <Button 
                onClick={() => setShowDetailView(true)}
                variant="outline"
                disabled
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Ver Detalhes (Indisponível)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ClientWorkout