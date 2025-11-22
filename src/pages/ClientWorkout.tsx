import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, Dumbbell, ArrowLeft } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import WorkoutDetailView from '@/components/client/WorkoutDetailView'

interface ClientWorkoutData {
  id: string
  workout_id: string
  status: string
  workout: {
    id: string
    name: string
    description: string | null
    objective: string | null
    duration_weeks: number
    days_per_week: number | null
    workout_exercises: {
      id: string
      day_number: number
      order_index: number
      sets: number
      reps: string | null
      weight: number | null
      rest_time_seconds: number | null
      notes: string | null
      exercise: {
        id: string
        name: string
        description: string | null
        video_url: string | null
        gif_url: string | null
        muscle_groups: string[] | null
      }
    }[]
  }
}

const ClientWorkout: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [clientWorkout, setClientWorkout] = useState<ClientWorkoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActiveWorkout = async () => {
      if (!user) return

      try {
        setLoading(true)
        console.log('🔍 [CLIENT_WORKOUT] Buscando treino ativo para:', user.id)
        
        const { data, error } = await supabase
          .from('client_workouts')
          .select(`
            id,
            workout_id,
            status,
            workout:workouts (
              id,
              name,
              description,
              objective,
              duration_weeks,
              days_per_week,
              workout_exercises (
                id,
                day_number,
                order_index,
                sets,
                reps,
                weight,
                rest_time_seconds,
                notes,
                exercise:exercises_library (
                  id,
                  name,
                  description,
                  video_url,
                  gif_url,
                  muscle_groups
                )
              )
            )
          `)
          .eq('client_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        if (error) throw error

        if (!data) {
          console.log('⚠️ [CLIENT_WORKOUT] Nenhum treino ativo encontrado')
          setClientWorkout(null)
        } else {
          console.log('✅ [CLIENT_WORKOUT] Treino encontrado:', data.workout.name)
          setClientWorkout(data as any)
        }
      } catch (err: any) {
        console.error('❌ [CLIENT_WORKOUT] Erro:', err)
        setError(err.message || 'Erro ao carregar treino')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchActiveWorkout()
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-300">Preparando seu treino...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Ops! Algo deu errado</h3>
            <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/20 dark:text-red-300">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!clientWorkout) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Dumbbell className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nenhum treino ativo</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Parece que você ainda não tem um plano de treino ativo. Entre em contato com seu profissional.
          </p>
          <Button onClick={() => navigate('/app/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-20 transition-colors duration-300">
      <WorkoutDetailView 
        workout={clientWorkout.workout} 
        clientWorkoutId={clientWorkout.id} 
      />
    </div>
  )
}

export default ClientWorkout