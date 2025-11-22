import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Dumbbell, Calendar, Target, Clock, Loader2, CheckCircle, 
  AlertCircle, Eye, Maximize2
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import WorkoutDetailView from '@/components/client/WorkoutDetailView'

const ClientWorkout: React.FC = () => {
  const { user } = useAuth()
  const [clientWorkout, setClientWorkout] = useState<any>(null)
  const [workoutExercises, setWorkoutExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetailView, setShowDetailView] = useState(false)

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
  }, [user])

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
        <div className="max-w-4xl mx-auto px-4 text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sem treino ativo</h2>
          <p className="text-gray-400 mb-6">Solicite um plano ao seu profissional.</p>
        </div>
      </div>
    )
  }

  if (showDetailView) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Button variant="outline" onClick={() => setShowDetailView(false)} className="mb-6 border-white/10 text-gray-300 hover:text-white hover:bg-white/10">
            ← Voltar ao Resumo
          </Button>
          <WorkoutDetailView clientWorkout={clientWorkout} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg"><Dumbbell className="h-6 w-6 text-blue-400" /></div>
            <div>
              <h1 className="text-3xl font-bold text-white">Meu Treino</h1>
              <p className="text-gray-400">Seu plano personalizado</p>
            </div>
          </div>
          <Button onClick={() => setShowDetailView(true)} className="bg-primary text-black hover:bg-primary/80 font-semibold">
            <Maximize2 className="h-4 w-4 mr-2" /> Iniciar Treino
          </Button>
        </div>

        {/* Card Resumo */}
        <Card className="mb-8 bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader><CardTitle className="text-white flex gap-2"><Target className="text-primary"/> {clientWorkout.workout.name}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-300"><Calendar className="h-4 w-4 text-gray-500"/> Início: {new Date(clientWorkout.start_date).toLocaleDateString('pt-BR')}</div>
              <div className="flex items-center gap-2 text-gray-300"><Clock className="h-4 w-4 text-gray-500"/> Duração: {clientWorkout.workout.duration_weeks} semanas</div>
              <div className="flex items-center gap-2 text-gray-300"><CheckCircle className="h-4 w-4 text-green-500"/> Status: <Badge variant="outline" className="ml-2 border-green-500/50 text-green-400">Ativo</Badge></div>
            </div>
            {clientWorkout.notes && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-200 text-sm mb-4">
                <strong>Nota:</strong> {clientWorkout.notes}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/20 p-3 rounded text-center"><p className="text-xl font-bold text-blue-400">{workoutExercises.length}</p><p className="text-xs text-gray-500">Exercícios</p></div>
              <div className="bg-black/20 p-3 rounded text-center"><p className="text-xl font-bold text-green-400">{workoutExercises.reduce((sum, we) => sum + we.sets, 0)}</p><p className="text-xs text-gray-500">Séries</p></div>
              <div className="bg-black/20 p-3 rounded text-center"><p className="text-xl font-bold text-purple-400">{clientWorkout.workout.days_per_week}</p><p className="text-xs text-gray-500">Dias/Semana</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Grid dos Dias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: Math.min(3, clientWorkout.workout.days_per_week || 3) }, (_, i) => {
            const dayNumber = i + 1
            const dayExs = exercisesByDay[dayNumber] || []
            return (
              <Card key={dayNumber} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setShowDetailView(true)}>
                <CardContent className="p-4">
                  <h3 className="font-bold text-white mb-3 flex justify-between">Dia {dayNumber} <Badge variant="secondary" className="bg-white/10 text-gray-300">{dayExs.length} ex</Badge></h3>
                  <div className="space-y-2">
                    {dayExs.slice(0, 3).map((ex: any, idx: number) => (
                      <div key={ex.id} className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="bg-white/10 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{idx + 1}</span>
                        <span className="truncate">{ex.exercise?.name}</span>
                      </div>
                    ))}
                    {dayExs.length > 3 && <p className="text-xs text-gray-600 pl-7">+{dayExs.length - 3} outros...</p>}
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