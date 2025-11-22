import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Dumbbell, 
  Utensils, 
  ChevronRight, 
  Flame, 
  Trophy, 
  Clock,
  Calendar
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface ActiveWorkout {
  id: string
  workout_id: string
  status: string
  workout: {
    name: string
    objective: string | null
    duration_weeks: number
  }
}

interface ActiveSession {
  id: string
  status: 'started' | 'paused'
  started_at: string
}

interface ActiveMealPlan {
  id: string
  meal_plan: {
    name: string
    daily_calories_target: number | null
    daily_protein_target: number | null
    daily_carbs_target: number | null
    daily_fat_target: number | null
  }
}

const ClientDashboard: React.FC = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null)
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [activeMealPlan, setActiveMealPlan] = useState<ActiveMealPlan | null>(null)

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // 1. Buscar Treino Ativo
        const { data: workoutData } = await supabase
          .from('client_workouts')
          .select('*, workout:workouts(name, objective, duration_weeks)')
          .eq('client_id', user.id)
          .eq('status', 'active')
          .single()

        if (workoutData) {
          setActiveWorkout(workoutData)
          
          // 2. Se tem treino, verificar se tem sessão em andamento
          const { data: sessionData } = await supabase
            .from('workout_sessions')
            .select('id, status, started_at')
            .eq('client_workout_id', workoutData.id)
            .in('status', ['started', 'paused'])
            .maybeSingle()
          
          setActiveSession(sessionData)
        }

        // 3. Buscar Plano Alimentar Ativo
        const { data: mealPlanData } = await supabase
          .from('client_meal_plans')
          .select('*, meal_plan:meal_plans(name, daily_calories_target, daily_protein_target, daily_carbs_target, daily_fat_target)')
          .eq('client_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        setActiveMealPlan(mealPlanData)

      } catch (error) {
        console.error('Erro ao carregar dashboard do cliente:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="animate-pulse text-blue-600 dark:text-blue-400 font-medium">Carregando seu painel...</div>
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Atleta'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-20 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-white dark:bg-card/20 border-b border-gray-200 dark:border-white/5 px-4 py-8 md:py-12 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Olá, {firstName} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Pronto para superar seus limites hoje?
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {/* STATUS VAZIO */}
        {!activeWorkout && !activeMealPlan && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto text-blue-300 dark:text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Bem-vindo ao CapiFit!</h3>
              <p className="text-blue-700 dark:text-blue-300 max-w-md mx-auto">
                Seu perfil está pronto, mas você ainda não possui treinos ou planos alimentares. 
                Entre em contato com seu profissional para começar.
              </p>
            </CardContent>
          </Card>
        )}

        {/* CARD DE TREINO (Principal) */}
        {activeWorkout && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl transform translate-y-2 blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <Card className="relative border-none shadow-lg overflow-hidden bg-white dark:bg-card/40 backdrop-blur-md">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Dumbbell className="h-32 w-32 transform rotate-12" />
                </div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-3 backdrop-blur-sm">
                      TREINO DO DIA
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-1">
                      {activeWorkout.workout.name}
                    </h2>
                    <p className="text-blue-100 flex items-center gap-2 text-sm">
                      {activeWorkout.workout.objective && (
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> {activeWorkout.workout.objective}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
                    <Dumbbell className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Duração: {activeWorkout.workout.duration_weeks} semanas</span>
                  </div>
                  {activeSession && (
                    <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 animate-pulse">
                      Em Andamento
                    </Badge>
                  )}
                </div>

                <Button 
                  size="lg" 
                  className={`w-full text-lg h-14 font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    activeSession 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                  onClick={() => navigate('/app/my-workout')}
                >
                  {activeSession ? (
                    <>
                      <Play className="h-5 w-5 mr-2 fill-current" />
                      Retomar Treino
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2 fill-current" />
                      Começar Treino Agora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CARD DE NUTRIÇÃO (Secundário) */}
        {activeMealPlan && (
          <Card 
            className="bg-white/80 dark:bg-card/30 backdrop-blur-md border-gray-200 dark:border-white/10 hover:border-green-200 dark:hover:border-green-800 transition-all cursor-pointer group shadow-sm hover:shadow-md" 
            onClick={() => navigate('/app/my-meal-plan')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                    <Utensils className="h-5 w-5" />
                  </div>
                  Plano Alimentar
                </CardTitle>
                <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{activeMealPlan.meal_plan.name}</h3>
              
              {/* Macros Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 border border-orange-100 dark:border-orange-800/30">
                  <div className="flex justify-center mb-1 text-orange-500">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold text-orange-700 dark:text-orange-300">
                    {activeMealPlan.meal_plan.daily_calories_target || '-'}
                  </div>
                  <div className="text-[10px] text-orange-600 dark:text-orange-400 uppercase font-medium">Kcal</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-100 dark:border-blue-800/30">
                  <div className="text-xs text-blue-500 dark:text-blue-400 mb-1 font-medium">Prot</div>
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {activeMealPlan.meal_plan.daily_protein_target || '-'}g
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 border border-yellow-100 dark:border-yellow-800/30">
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1 font-medium">Carb</div>
                  <div className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                    {activeMealPlan.meal_plan.daily_carbs_target || '-'}g
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 border border-red-100 dark:border-red-800/30">
                  <div className="text-xs text-red-500 dark:text-red-400 mb-1 font-medium">Gord</div>
                  <div className="text-sm font-bold text-red-700 dark:text-red-300">
                    {activeMealPlan.meal_plan.daily_fat_target || '-'}g
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ClientDashboard