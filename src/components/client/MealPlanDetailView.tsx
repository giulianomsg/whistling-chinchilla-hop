import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Utensils, Apple, BarChart3, Flame } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface MealPlanDetailViewProps {
  clientMealPlan: any
}

const MealPlanDetailView: React.FC<MealPlanDetailViewProps> = ({ clientMealPlan }) => {
  const [mealPlanItems, setMealPlanItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('meal_plan_items')
        .select(`*, food:foods_library(*)`)
        .eq('meal_plan_id', clientMealPlan.meal_plan_id)
        .order('day_number').order('meal_order')
      
      setMealPlanItems((data || []).filter(i => i.food !== null))
      setLoading(false)
    }
    loadItems()
  }, [clientMealPlan])

  const mealsByDay = mealPlanItems.reduce((acc: any, curr) => {
    if (!acc[curr.day_number]) acc[curr.day_number] = []
    acc[curr.day_number].push(curr)
    return acc
  }, {})

  if (loading) return <div className="text-center py-8 text-gray-400">Carregando refeições...</div>

  return (
    <div className="space-y-6">
      {/* Macros Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader><CardTitle className="text-white flex gap-2"><BarChart3 className="text-purple-400"/> Distribuição</CardTitle></CardHeader>
          <CardContent className="flex justify-around text-center">
            <div><p className="text-2xl font-bold text-blue-400">{clientMealPlan.meal_plan.daily_protein_target}g</p><p className="text-xs text-gray-400">Proteína</p></div>
            <div><p className="text-2xl font-bold text-yellow-400">{clientMealPlan.meal_plan.daily_carbs_target}g</p><p className="text-xs text-gray-400">Carbo</p></div>
            <div><p className="text-2xl font-bold text-red-400">{clientMealPlan.meal_plan.daily_fat_target}g</p><p className="text-xs text-gray-400">Gordura</p></div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader><CardTitle className="text-white flex gap-2"><Flame className="text-orange-400"/> Calorias</CardTitle></CardHeader>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-white">{clientMealPlan.meal_plan.daily_calories_target}</p>
            <p className="text-sm text-gray-400">Kcal por dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader><CardTitle className="text-white">Refeições</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="day-1">
            <TabsList className="bg-black/20 w-full justify-start overflow-x-auto">
              {Object.keys(mealsByDay).map(day => (
                <TabsTrigger key={day} value={`day-${day}`} className="data-[state=active]:bg-green-500 data-[state=active]:text-black text-gray-400">
                  Dia {day}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.keys(mealsByDay).map(day => (
              <TabsContent key={day} value={`day-${day}`} className="space-y-4 mt-4">
                {mealsByDay[day].map((meal: any, idx: number) => (
                  <div key={meal.id} className="bg-black/20 border border-white/5 rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center justify-center min-w-[3rem]">
                        <span className="bg-green-500/20 text-green-400 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-1">{meal.meal_name}</h4>
                        <div className="flex items-center gap-2 mb-2 text-gray-300">
                          <Apple className="h-4 w-4 text-green-400"/>
                          <span>{meal.food.name}</span>
                          <Badge variant="outline" className="border-white/20 text-gray-300 ml-2">{meal.quantity}{meal.food.serving_unit || 'g'}</Badge>
                        </div>
                        
                        {/* Macros do item */}
                        <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 bg-white/5 p-2 rounded">
                          <div className="text-center"><span className="block font-bold text-orange-400">{Math.round(meal.food.calories_per_serving * (meal.quantity / meal.food.serving_size))}</span>Kcal</div>
                          <div className="text-center"><span className="block font-bold text-blue-400">{Math.round(meal.food.protein * (meal.quantity / meal.food.serving_size))}g</span>P</div>
                          <div className="text-center"><span className="block font-bold text-yellow-400">{Math.round(meal.food.carbs * (meal.quantity / meal.food.serving_size))}g</span>C</div>
                          <div className="text-center"><span className="block font-bold text-red-400">{Math.round(meal.food.fat * (meal.quantity / meal.food.serving_size))}g</span>G</div>
                        </div>

                        {meal.notes && <p className="mt-2 text-sm text-yellow-200/80 italic">"{meal.notes}"</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default MealPlanDetailView