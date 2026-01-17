import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dumbbell, Calendar, Target, Clock, Loader2, CheckCircle,
  AlertCircle, Maximize2
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import WorkoutDetailView from '@/components/client/WorkoutDetailView'
import { useSearchParams } from 'react-router-dom'

const ClientWorkout: React.FC = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [clientWorkout, setClientWorkout] = useState<any>(null)
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // URL-driven state for view
  const showDetailView = searchParams.get('view') === 'detail'

  const openDay = (dayNumber: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('view', 'detail')
      newParams.set('day', `day-${dayNumber}`)
      return newParams
    })
  }

  const closeDetailView = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.delete('view')
      newParams.delete('day')
      return newParams
    })
  }

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: workoutData } = await supabase
          .from('client_workouts')
          .select(`*, workout:workouts(*)`)
          .eq('client_id', user.id)
          .eq('status', 'active')
          .single()

        setClientWorkout(workoutData)

        if (workoutData) {
          const { data: exercisesData } = await supabase
            .from('workout_exercises')
            .select(`*, exercise:exercises_library(*)`)
            .eq('workout_id', workoutData.workout_id)
            .order('day_number').order('order_index')
          setWorkoutExercises((exercisesData || []).filter(i => i.exercise !== null))
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id])

  // Agrupar exercícios por dia
  const exercisesByDay = workoutExercises.reduce((acc: any, curr) => {
    if (!acc[curr.day_number]) acc[curr.day_number] = []
    acc[curr.day_number].push(curr)
    return acc
  }, {})

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  if (!clientWorkout) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="w-full mx-auto px-4 text-center py-12 bg-card rounded-xl border border-border">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sem treino ativo</h2>
          <p className="text-muted-foreground mb-6">Solicite um plano ao seu profissional.</p>
        </div>
      </div>
    )
  }

  if (showDetailView) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="w-full mx-auto px-4">
          <Button variant="outline" onClick={closeDetailView} className="mb-6 border-border text-muted-foreground hover:text-foreground hover:bg-accent">
            ← Voltar ao Resumo
          </Button>
          <WorkoutDetailView clientWorkout={clientWorkout} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
      <div>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg"><Dumbbell className="h-6 w-6 text-blue-500" /></div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Meu Treino</h1>
              <p className="text-muted-foreground">Seu plano personalizado</p>
            </div>
          </div>
          {/* Default to Day 1 if clicked directly */}
          <Button onClick={() => openDay(1)} className="bg-primary text-primary-foreground hover:bg-primary/80 font-semibold">
            <Maximize2 className="h-4 w-4 mr-2" /> Iniciar Treino
          </Button>
        </div>

        {/* Card Resumo */}
        <Card className="mb-8 bg-card border-border backdrop-blur-md">
          <CardHeader><CardTitle className="text-foreground flex gap-2"><Target className="text-primary" /> {clientWorkout.workout.name}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-muted-foreground" /> Início: {new Date(clientWorkout.start_date).toLocaleDateString('pt-BR')}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-muted-foreground" /> Duração: {clientWorkout.workout.duration_weeks} semanas</div>
              <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500" /> Status: <Badge variant="outline" className="ml-2 border-green-500/50 text-green-600 dark:text-green-400">Ativo</Badge></div>
            </div>
            {clientWorkout.notes && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-600 dark:text-yellow-200 text-sm mb-4">
                <strong>Nota:</strong> {clientWorkout.notes}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 p-3 rounded text-center"><p className="text-xl font-bold text-blue-500">{workoutExercises.length}</p><p className="text-xs text-muted-foreground">Exercícios</p></div>
              <div className="bg-muted/50 p-3 rounded text-center"><p className="text-xl font-bold text-green-500">{workoutExercises.reduce((sum, we) => sum + we.sets, 0)}</p><p className="text-xs text-muted-foreground">Séries</p></div>
              <div className="bg-muted/50 p-3 rounded text-center"><p className="text-xl font-bold text-purple-500">{clientWorkout.workout.days_per_week}</p><p className="text-xs text-muted-foreground">Dias/Semana</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Grid dos Dias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: Math.min(3, clientWorkout.workout.days_per_week || 3) }, (_, i) => {
            const dayNumber = i + 1
            const dayExs = exercisesByDay[dayNumber] || []
            return (
              <Card key={dayNumber} className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => openDay(dayNumber)}>
                <CardContent className="p-4">
                  <h3 className="font-bold text-foreground mb-3 flex justify-between">Dia {dayNumber} <Badge variant="secondary" className="bg-muted text-muted-foreground">{dayExs.length} ex</Badge></h3>
                  <div className="space-y-2">
                    {dayExs.slice(0, 3).map((ex: any, idx: number) => (
                      <div key={ex.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="bg-muted w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{idx + 1}</span>
                        <span className="truncate">{ex.exercise?.name}</span>
                      </div>
                    ))}
                    {dayExs.length > 3 && <p className="text-xs text-muted-foreground pl-7">+{dayExs.length - 3} outros...</p>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ClientWorkout