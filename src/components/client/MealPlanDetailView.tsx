import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Utensils, 
  Calendar, 
  Target,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Apple,
  BarChart3,
  Flame
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface MealPlan {
  id: string
  name: string
  description: string | null
  objective: string | null
  nutritionist_id: string
  daily_calories_target: number | null
  daily_protein_target: number | null
  daily_carbs_target: number | null
  daily_fat_target: number | null
  is_template: boolean
  created_at: string
}

interface Food {
  id: string
  name: string
  brand: string | null
  category: string | null
  serving_size: number
  calories_per_serving: number
  protein: number
  carbs: number
  fat: number
  created_by: string
  is_public: boolean
}

interface MealPlanItem {
  id: string
  meal_plan_id: string
  day_number: number
  meal_order: number
  meal_name: string
  food_id: string | null
  recipe_id: string | null
  quantity: number
  notes: string | null
  food?: Food
}

interface ClientMealPlan {
  id: string
  client_id: string
  meal_plan_id: string
  nutritionist_id: string
  start_date: string
  end_date: string | null
  status: string
  notes: string | null
  meal_plan: MealPlan
}

interface MealPlanDetailViewProps {
  clientMealPlan: ClientMealPlan
}

const MealPlanDetailView: React.FC<MealPlanDetailViewProps> = ({ clientMealPlan }) => {
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar itens do plano
  const fetchMealPlanItems = async () => {
    try {
      console.log('🔍 [MEAL_PLAN_DETAIL] Buscando itens do plano:', clientMealPlan.meal_plan_id)
      setLoading(true)
      
      const { data, error } = await supabase
        .from('meal_plan_items')
        .select(`
          *,
          food:foods_library(*)
        `)
        .eq('meal_plan_id', clientMealPlan.meal_plan_id)
        .order('day_number', { ascending: true })
        .order('meal_order', { ascending: true })

      if (error) {
        console.error('❌ [MEAL_PLAN_DETAIL] Erro ao buscar itens:', error)
        return
      }

      // ✅ PROTEGER CONTRA NULL: Filtrar itens com food null
      const filteredData = (data || []).filter(item => item.food !== null)
      console.log('✅ [MEAL_PLAN_DETAIL] Itens carregados:', filteredData.length)
      setMealPlanItems(filteredData)
    } catch (error) {
      console.error('❌ [MEAL_PLAN_DETAIL] Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clientMealPlan?.meal_plan_id) {
      fetchMealPlanItems()
    }
  }, [clientMealPlan?.meal_plan_id])

  // Agrupar refeições por dia
  const getMealsByDay = () => {
    const grouped: { [key: number]: MealPlanItem[] } = {}
    mealPlanItems.forEach(item => {
      if (!grouped[item.day_number]) {
        grouped[item.day_number] = []
      }
      grouped[item.day_number].push(item)
    })
    return grouped
  }

  const mealsByDay = getMealsByDay()

  // Calcular macros totais do dia
  const calculateDayMacros = (dayMeals: MealPlanItem[]) => {
    return dayMeals.reduce((acc, item) => {
      if (!item.food) return acc
      
      const factor = item.quantity / item.food.serving_size
      return {
        calories: acc.calories + Math.round(item.food.calories_per_serving * factor),
        protein: acc.protein + Math.round(item.food.protein * factor * 10) / 10,
        carbs: acc.carbs + Math.round(item.food.carbs * factor * 10) / 10,
        fat: acc.fat + Math.round(item.food.fat * factor * 10) / 10
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  // Calcular estatísticas do plano
  const getMealPlanStats = () => {
    const totalMeals = mealPlanItems.length
    const totalDays = new Set(mealPlanItems.map(item => item.day_number)).size
    const categories = new Set<string>()
    
    mealPlanItems.forEach(item => {
      if (item.food?.category) {
        categories.add(item.food.category)
      }
    })

    // Calcular macros totais do plano
    const totalMacros = mealPlanItems.reduce((acc, item) => {
      if (!item.food) return acc
      
      const factor = item.quantity / item.food.serving_size
      return {
        calories: acc.calories + Math.round(item.food.calories_per_serving * factor),
        protein: acc.protein + Math.round(item.food.protein * factor * 10) / 10,
        carbs: acc.carbs + Math.round(item.food.carbs * factor * 10) / 10,
        fat: acc.fat + Math.round(item.food.fat * factor * 10) / 10
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })

    return {
      totalMeals,
      totalDays,
      categories: Array.from(categories),
      totalMacros
    }
  }

  const stats = getMealPlanStats()

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-gray-600">Carregando detalhes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Plano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-green-600" />
            {clientMealPlan.meal_plan?.name || 'Plano Alimentar'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientMealPlan.meal_plan?.description && (
            <p className="text-gray-600 mb-4">{clientMealPlan.meal_plan.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Início:</span>
              <span className="text-sm font-medium">
                {new Date(clientMealPlan.start_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant="secondary" className="text-xs">
                Ativo
              </Badge>
            </div>

            {clientMealPlan.meal_plan?.daily_calories_target && (
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">Meta diária:</span>
                <span className="text-sm font-medium">
                  {clientMealPlan.meal_plan.daily_calories_target} cal
                </span>
              </div>
            )}
          </div>

          {/* Targets Nutricionais */}
          {(clientMealPlan.meal_plan?.daily_protein_target || 
            clientMealPlan.meal_plan?.daily_carbs_target || 
            clientMealPlan.meal_plan?.daily_fat_target) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Metas Diárias:</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {clientMealPlan.meal_plan.daily_protein_target && (
                  <div>
                    <span className="text-gray-600">Proteínas:</span>
                    <span className="ml-2 font-medium">{clientMealPlan.meal_plan.daily_protein_target}g</span>
                  </div>
                )}
                {clientMealPlan.meal_plan.daily_carbs_target && (
                  <div>
                    <span className="text-gray-600">Carboidratos:</span>
                    <span className="ml-2 font-medium">{clientMealPlan.meal_plan.daily_carbs_target}g</span>
                  </div>
                )}
                {clientMealPlan.meal_plan.daily_fat_target && (
                  <div>
                    <span className="text-gray-600">Gorduras:</span>
                    <span className="ml-2 font-medium">{clientMealPlan.meal_plan.daily_fat_target}g</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {clientMealPlan.meal_plan?.objective && (
            <div className="mt-4 p-3 bg-green-50 rounded">
              <p className="text-sm font-medium text-green-800">Objetivo:</p>
              <p className="text-sm text-green-700">{clientMealPlan.meal_plan.objective}</p>
            </div>
          )}

          {clientMealPlan.notes && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Nota do profissional:</strong> {clientMealPlan.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas do Plano */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Estatísticas do Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.totalMeals}</p>
              <p className="text-sm text-gray-600">Refeições</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.totalDays}</p>
              <p className="text-sm text-gray-600">Dias</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{Math.round(stats.totalMacros.calories)}</p>
              <p className="text-sm text-gray-600">Cal/Dia</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.categories.length}</p>
              <p className="text-sm text-gray-600">Categorias</p>
            </div>
          </div>
          
          {/* Macros Totais */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Média de Macros por Dia:</p>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-lg text-orange-600">
                  {Math.round(stats.totalMacros.calories / stats.totalDays)}
                </p>
                <p className="text-gray-600">Calorias</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-red-600">
                  {Math.round(stats.totalMacros.protein / stats.totalDays)}g
                </p>
                <p className="text-gray-600">Proteínas</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-blue-600">
                  {Math.round(stats.totalMacros.carbs / stats.totalDays)}g
                </p>
                <p className="text-gray-600">Carboidratos</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-yellow-600">
                  {Math.round(stats.totalMacros.fat / stats.totalDays)}g
                </p>
                <p className="text-gray-600">Gorduras</p>
              </div>
            </div>
          </div>
          
          {stats.categories.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Categorias de Alimentos:</p>
              <div className="flex flex-wrap gap-1">
                {stats.categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refeições por Dia */}
      {mealPlanItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Refeições do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="day-1" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                {Array.from({ length: 7 }, (_, i) => (
                  <TabsTrigger key={i + 1} value={`day-${i + 1}`}>
                    Dia {i + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Array.from({ length: 7 }, (_, i) => {
                const dayNumber = i + 1
                const dayMeals = mealsByDay[dayNumber] || []
                const dayMacros = calculateDayMacros(dayMeals)
                
                return (
                  <TabsContent key={dayNumber} value={`day-${dayNumber}`} className="mt-6">
                    {dayMeals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Nenhuma refeição para este dia</p>
                      </div>
                    ) : (
                      <>
                        {/* Resumo do Dia */}
                        <Card className="mb-6">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Resumo do Dia {dayNumber}</h3>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <p className="text-gray-600">Calorias</p>
                                <p className="font-bold text-lg">{dayMacros.calories}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600">Proteínas</p>
                                <p className="font-bold text-lg">{dayMacros.protein}g</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600">Carboidratos</p>
                                <p className="font-bold text-lg">{dayMacros.carbs}g</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600">Gorduras</p>
                                <p className="font-bold text-lg">{dayMacros.fat}g</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Refeições do Dia */}
                        <div className="space-y-4">
                          {dayMeals.map((mealPlanItem, index) => (
                            <Card key={mealPlanItem.id}>
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                      {mealPlanItem.meal_name}
                                    </h3>
                                  
                                    <div className="flex items-center gap-2 mb-3">
                                      <Apple className="h-4 w-4 text-green-600" />
                                      <span className="font-medium">
                                        {mealPlanItem.food?.name || 'Alimento não encontrado'}
                                      </span>
                                      <Badge variant="outline">
                                        {mealPlanItem.quantity}g
                                      </Badge>
                                    </div>

                                    {mealPlanItem.food && (
                                      <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                                        <div>
                                          <span className="font-medium">Cal:</span> {Math.round(mealPlanItem.food.calories_per_serving * mealPlanItem.quantity / mealPlanItem.food.serving_size)}
                                        </div>
                                        <div>
                                          <span className="font-medium">Prot:</span> {Math.round(mealPlanItem.food.protein * mealPlanItem.quantity / mealPlanItem.food.serving_size)}g
                                        </div>
                                        <div>
                                          <span className="font-medium">Carb:</span> {Math.round(mealPlanItem.food.carbs * mealPlanItem.quantity / mealPlanItem.food.serving_size)}g
                                        </div>
                                        <div>
                                          <span className="font-medium">Gord:</span> {Math.round(mealPlanItem.food.fat * mealPlanItem.quantity / mealPlanItem.food.serving_size)}g
                                        </div>
                                      </div>
                                    )}

                                    {mealPlanItem.food?.category && (
                                      <div className="mb-3">
                                        <Badge variant="secondary" className="text-xs">
                                          {mealPlanItem.food.category}
                                        </Badge>
                                      </div>
                                    )}

                                    {mealPlanItem.notes && (
                                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                        <p className="text-sm text-yellow-800">
                                          <strong>Nota do profissional:</strong> {mealPlanItem.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {mealPlanItems.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma refeição encontrada</h3>
            <p className="text-gray-600">
              Este plano ainda não possui refeições cadastradas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MealPlanDetailView