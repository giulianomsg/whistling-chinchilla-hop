import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, Utensils, ArrowLeft, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'

interface ClientMealPlanData {
  id: string
  status: string
  meal_plan: {
    id: string
    name: string
    description: string | null
    objective: string | null
    daily_calories_target: number | null
    daily_protein_target: number | null
    daily_carbs_target: number | null
    daily_fat_target: number | null
    meal_plan_meals: {
      id: string
      name: string
      time: string | null
      notes: string | null
      order_index: number
      meal_foods: {
        id: string
        quantity: number
        unit: string
        notes: string | null
        food: {
          name: string
          calories_per_serving: number
          protein: number
          carbs: number
          fat: number
          serving_size: number
          serving_unit: string
        }
      }[]
    }[]
  }
}

const ClientMealPlan: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activePlan, setActivePlan] = useState<ClientMealPlanData | null>(null)
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchMealPlan = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('client_meal_plans')
          .select(`
            id, status,
            meal_plan:meal_plans (
              id, name, description, objective,
              daily_calories_target, daily_protein_target, daily_carbs_target, daily_fat_target,
              meal_plan_meals (
                id, name, time, notes, order_index,
                meal_foods (
                  id, quantity, unit, notes,
                  food:foods_library (
                    name, calories_per_serving, protein, carbs, fat, serving_size, serving_unit
                  )
                )
              )
            )
          `)
          .eq('client_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        if (error) throw error
        
        if (data) {
          // Ordenar refeições
          if (data.meal_plan && data.meal_plan.meal_plan_meals) {
            data.meal_plan.meal_plan_meals.sort((a, b) => a.order_index - b.order_index)
            
            // Expandir todas as refeições inicialmente
            const initialExpanded: Record<string, boolean> = {}
            data.meal_plan.meal_plan_meals.forEach(meal => {
              initialExpanded[meal.id] = true
            })
            setExpandedMeals(initialExpanded)
          }
          setActivePlan(data as any)
        }
      } catch (error) {
        console.error('Erro ao buscar plano alimentar:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlan()
  }, [user])

  const toggleMeal = (mealId: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" />
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nenhum plano ativo</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Você ainda não possui um plano alimentar ativo. Entre em contato com seu nutricionista.
          </p>
          <Button onClick={() => navigate('/app/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  const { meal_plan } = activePlan

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-card/20 border-b border-gray-200 dark:border-white/5 px-4 py-6 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app/dashboard')} className="md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{meal_plan.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{meal_plan.objective}</p>
            </div>
          </div>

          {/* Macros Summary */}
          <div className="grid grid-cols-4 gap-2 mt-2">
             <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 text-center border border-orange-100 dark:border-orange-800/30">
               <span className="block text-xs text-orange-600 dark:text-orange-400 font-bold">KCAL</span>
               <span className="text-sm font-bold text-orange-800 dark:text-orange-200">{meal_plan.daily_calories_target || '-'}</span>
             </div>
             <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center border border-blue-100 dark:border-blue-800/30">
               <span className="block text-xs text-blue-600 dark:text-blue-400 font-bold">PROT</span>
               <span className="text-sm font-bold text-blue-800 dark:text-blue-200">{meal_plan.daily_protein_target || '-'}g</span>
             </div>
             <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 text-center border border-yellow-100 dark:border-yellow-800/30">
               <span className="block text-xs text-yellow-600 dark:text-yellow-400 font-bold">CARB</span>
               <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">{meal_plan.daily_carbs_target || '-'}g</span>
             </div>
             <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center border border-red-100 dark:border-red-800/30">
               <span className="block text-xs text-red-600 dark:text-red-400 font-bold">GORD</span>
               <span className="text-sm font-bold text-red-800 dark:text-red-200">{meal_plan.daily_fat_target || '-'}g</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
        {meal_plan.meal_plan_meals.map((meal) => (
          <Card key={meal.id} className="border-none shadow-sm overflow-hidden bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              onClick={() => toggleMeal(meal.id)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{meal.name}</h3>
                  {meal.time && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{meal.time}</span>
                    </div>
                  )}
                </div>
              </div>
              {expandedMeals[meal.id] ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {expandedMeals[meal.id] && (
              <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2">
                <div className="space-y-3 mt-2">
                  {meal.meal_foods.map((item) => {
                    const totalCals = Math.round((item.quantity / item.food.serving_size) * item.food.calories_per_serving)
                    
                    return (
                      <div key={item.id} className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{item.food.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.quantity}{item.unit} • {totalCals} kcal
                          </p>
                          {item.notes && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 italic">
                              Nota: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {meal.notes && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-sm text-gray-600 dark:text-gray-300 italic border border-gray-100 dark:border-white/5">
                      "{meal.notes}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ClientMealPlan