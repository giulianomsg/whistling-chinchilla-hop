import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  Timer,
  Dumbbell
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
  workout?: Workout
}

interface ClientWorkoutHistoryProps {
  clientId: string
}

const ClientWorkoutHistory: React.FC<ClientWorkoutHistoryProps> = ({ clientId }) => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  // Formatar duração para display
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    } else if (minutes > 0) {
      return `${minutes} min`
    } else {
      return '< 1 min'
    }
  }

  // Formatar data para display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Formatar data e hora para display
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Buscar histórico de sessões
  const fetchWorkoutHistory = async () => {
    if (!clientId) return

    try {
      console.log('🔍 [WORKOUT_HISTORY] Buscando histórico do cliente:', clientId)
      setLoading(true)
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout:workouts(name, objective)
        `)
        .eq('client_id', clientId)
        .in('status', ['completed', 'abandoned'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [WORKOUT_HISTORY] Erro ao buscar histórico:', error)
        return
      }

      console.log('✅ [WORKOUT_HISTORY] Histórico carregado:', data?.length || 0, 'sessões')
      setSessions(data || [])
    } catch (error) {
      console.error('❌ [WORKOUT_HISTORY] Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clientId) {
      fetchWorkoutHistory()
    }
  }, [clientId])

  // Calcular estatísticas
  const getStats = () => {
    const completed = sessions.filter(s => s.status === 'completed').length
    const abandoned = sessions.filter(s => s.status === 'abandoned').length
    const totalDuration = sessions
      .filter(s => s.status === 'completed' && s.duration_seconds)
      .reduce((sum, s) => sum + (s.duration_seconds || 0), 0)
    
    return {
      total: sessions.length,
      completed,
      abandoned,
      totalDuration,
      completionRate: sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : 0
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-600" />
            Histórico de Treinos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-gray-600">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-blue-600" />
          Histórico de Treinos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino registrado ainda</h3>
            <p className="text-gray-600">
              Este cliente ainda não realizou nenhuma sessão de treino.
            </p>
          </div>
        ) : (
          <>
            {/* Estatísticas */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Estatísticas Gerais</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-xs text-gray-600">Concluídos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.abandoned}</p>
                  <p className="text-xs text-gray-600">Abandonados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
                  <p className="text-xs text-gray-600">Taxa Conclusão</p>
                </div>
              </div>
              
              {stats.totalDuration > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Tempo total treinado: <strong>{formatDuration(stats.totalDuration)}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Sessões */}
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Ícone de Status */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full">
                      {session.status === 'completed' ? (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                    </div>

                    {/* Informações do Treino */}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {session.workout?.name || 'Treino sem nome'}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(session.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(session.duration_seconds)}</span>
                        </div>
                      </div>
                      {session.workout?.objective && (
                        <p className="text-xs text-gray-500 mt-1">
                          Objetivo: {session.workout.objective}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status e Data/Hora */}
                  <div className="text-right">
                    <Badge
                      variant={session.status === 'completed' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {session.status === 'completed' ? 'Concluído' : 'Abandonado'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(session.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo Final */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Mostrando {sessions.length} sessões</span>
                <span>Última atualização: {formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ClientWorkoutHistory