import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
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
  BarChart3,
  PlayCircle,
  Youtube,
  Play,
  Pause,
  Square,
  RotateCcw
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'

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
  video_url: string | null
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

interface WorkoutSession {
  id: string
  client_id: string
  professional_id: string
  workout_id: string
  client_workout_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  status: 'started' | 'paused' | 'completed' | 'abandoned'
  created_at: string
  updated_at: string
}

interface WorkoutDetailViewProps {
  clientWorkout: ClientWorkout
}

const WorkoutDetailView: React.FC<WorkoutDetailViewProps> = ({ clientWorkout }) => {
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)
  
  // Estados da sessão de treino
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'started' | 'paused' | 'completed'>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionLoading, setSessionLoading] = useState(false)

  // Função helper para converter URLs do YouTube em embed
  const getEmbedUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        const videoId = urlObj.searchParams.get('v')
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null
      }
      if (urlObj.hostname === 'youtu.be') {
        return `https://www.youtube.com/embed/${urlObj.pathname.substring(1)}`
      }
      return url
    } catch (e) {
      console.error('URL de vídeo inválida:', e)
      return null
    }
  }

  // Formatar tempo para display HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Verificar sessão existente ao montar componente
  const checkExistingSession = async () => {
    try {
      console.log('🔍 [WORKOUT_SESSION] Verificando sessão existente...')
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('client_workout_id', clientWorkout.id)
        .in('status', ['started', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [WORKOUT_SESSION] Erro ao verificar sessão:', error)
        return
      }

      if (data) {
        console.log('✅ [WORKOUT_SESSION] Sessão existente encontrada:', data)
        setSessionId(data.id)
        setSessionStatus(data.status)
        setIsSessionActive(true)
        
        // Calcular tempo decorrido
        if (data.status === 'started') {
          const startedAt = new Date(data.started_at)
          const now = new Date()
          const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
          setElapsedTime(elapsed)
        } else if (data.status === 'paused' && data.duration_seconds) {
          setElapsedTime(data.duration_seconds)
        }
      }
    } catch (error) {
      console.error('❌ [WORKOUT_SESSION] Erro inesperado:', error)
    }
  }

  // Iniciar treino
  const handleStartWorkout = async () => {
    if (!clientWorkout) return

    try {
      setSessionLoading(true)
      console.log('🚀 [WORKOUT_SESSION] Iniciando nova sessão...')

      const sessionData = {
        client_id: clientWorkout.client_id,
        professional_id: clientWorkout.professional_id,
        workout_id: clientWorkout.workout_id,
        client_workout_id: clientWorkout.id,
        status: 'started' as const
      }

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) {
        console.error('❌ [WORKOUT_SESSION] Erro ao iniciar sessão:', error)
        showError('Erro ao iniciar treino')
        return
      }

      console.log('✅ [WORKOUT_SESSION] Sessão iniciada:', data)
      setSessionId(data.id)
      setSessionStatus('started')
      setIsSessionActive(true)
      setElapsedTime(0)
      showSuccess('Treino iniciado com sucesso!')
    } catch (error) {
      console.error('❌ [WORKOUT_SESSION] Erro inesperado:', error)
      showError('Erro inesperado ao iniciar treino')
    } finally {
      setSessionLoading(false)
    }
  }

  // Pausar treino
  const handlePauseWorkout = async () => {
    if (!sessionId) return

    try {
      setSessionLoading(true)
      console.log('⏸️ [WORKOUT_SESSION] Pausando sessão...')

      const { error } = await supabase
        .from('workout_sessions')
        .update({ 
          status: 'paused',
          duration_seconds: elapsedTime
        })
        .eq('id', sessionId)

      if (error) {
        console.error('❌ [WORKOUT_SESSION] Erro ao pausar sessão:', error)
        showError('Erro ao pausar treino')
        return
      }

      console.log('✅ [WORKOUT_SESSION] Sessão pausada')
      setSessionStatus('paused')
      showSuccess('Treino pausado')
    } catch (error) {
      console.error('❌ [WORKOUT_SESSION] Erro inesperado:', error)
      showError('Erro inesperado ao pausar treino')
    } finally {
      setSessionLoading(false)
    }
  }

  // Retomar treino
  const handleResumeWorkout = async () => {
    if (!sessionId) return

    try {
      setSessionLoading(true)
      console.log('▶️ [WORKOUT_SESSION] Retomando sessão...')

      const { error } = await supabase
        .from('workout_sessions')
        .update({ status: 'started' })
        .eq('id', sessionId)

      if (error) {
        console.error('❌ [WORKOUT_SESSION] Erro ao retomar sessão:', error)
        showError('Erro ao retomar treino')
        return
      }

      console.log('✅ [WORKOUT_SESSION] Sessão retomada')
      setSessionStatus('started')
      showSuccess('Treino retomado')
    } catch (error) {
      console.error('❌ [WORKOUT_SESSION] Erro inesperado:', error)
      showError('Erro inesperado ao retomar treino')
    } finally {
      setSessionLoading(false)
    }
  }

  // Finalizar treino
  const handleFinishWorkout = async () => {
    if (!sessionId) return

    try {
      setSessionLoading(true)
      console.log('🏁 [WORKOUT_SESSION] Finalizando sessão...')

      const { error } = await supabase
        .from('workout_sessions')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) {
        console.error('❌ [WORKOUT_SESSION] Erro ao finalizar sessão:', error)
        showError('Erro ao finalizar treino')
        return
      }

      console.log('✅ [WORKOUT_SESSION] Sessão finalizada')
      setSessionStatus('completed')
      setIsSessionActive(false)
      showSuccess(`Parabéns! Treino finalizado em ${formatTime(elapsedTime)}`)
      
      // Resetar estados após 3 segundos
      setTimeout(() => {
        setSessionId(null)
        setElapsedTime(0)
        setSessionStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('❌ [WORKOUT_SESSION] Erro inesperado:', error)
      showError('Erro inesperado ao finalizar treino')
    } finally {
      setSessionLoading(false)
    }
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (sessionStatus === 'started') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [sessionStatus])

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
      checkExistingSession()
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
    <div className="space-y-6 pb-24">
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
                {isSessionActive ? 'Em Andamento' : 'Ativo'}
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
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-3">
                                      <p className="text-sm text-yellow-800">
                                        <strong>Nota do profissional:</strong> {workoutExercise.notes}
                                      </p>
                                    </div>
                                  )}

                                  {/* Botão de Vídeo */}
                                  {workoutExercise.exercise?.video_url && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-4"
                                      onClick={() => setOpenVideoId(
                                        openVideoId === workoutExercise.id ? null : workoutExercise.id
                                      )}
                                    >
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      {openVideoId === workoutExercise.id ? 'Fechar Vídeo' : 'Ver Vídeo de Execução'}
                                    </Button>
                                  )}

                                  {/* Player de Vídeo (Embed) */}
                                  {openVideoId === workoutExercise.id && workoutExercise.exercise?.video_url && (
                                    <div className="mt-4 aspect-video rounded-lg overflow-hidden border">
                                      <iframe
                                        width="100%"
                                        height="100%"
                                        src={getEmbedUrl(workoutExercise.exercise.video_url) || ''}
                                        title={`Vídeo para ${workoutExercise.exercise.name}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      ></iframe>
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

      {/* Barra Fixa de Controle da Sessão */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Timer */}
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-blue-600" />
              <div className="text-center">
                <p className="text-sm text-gray-600">Tempo de Treino</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">
                  {formatTime(elapsedTime)}
                </p>
              </div>
            </div>

            {/* Botões de Controle */}
            <div className="flex items-center gap-3">
              {!isSessionActive ? (
                <Button
                  onClick={handleStartWorkout}
                  disabled={sessionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {sessionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Iniciar Treino
                </Button>
              ) : (
                <>
                  {sessionStatus === 'started' ? (
                    <Button
                      onClick={handlePauseWorkout}
                      disabled={sessionLoading}
                      variant="outline"
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                      size="lg"
                    >
                      {sessionLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Pause className="h-4 w-4 mr-2" />
                      )}
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      onClick={handleResumeWorkout}
                      disabled={sessionLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      {sessionLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Retomar
                    </Button>
                  )}

                  <Button
                    onClick={handleFinishWorkout}
                    disabled={sessionLoading}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    size="lg"
                  >
                    {sessionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="h-4 w-4 mr-2" />
                    )}
                    Finalizar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkoutDetailView