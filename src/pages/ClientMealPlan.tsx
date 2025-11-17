import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
  Apple
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

const ClientMealPlan: React.FC = () => {
  const { user, profile } = useAuth()
  const [clientMealPlan, setClientMealPlan] = useState<ClientMealPlan | null>(null)
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Buscar plano ativo do cliente
  const fetchClientMealPlan = async () => {
    if (!user) {
      console.log('❌ [CLIENT_MEAL_PLAN] Usuário null, não buscando plano')
      return
    }

    try {
      console.log('🔍 [CLIENT_MEAL_PLAN] Buscando plano do cliente:', user.id)
      setLoading(true)
      
      const { data, error } = await supabase
        .from('client_meal_plans')
        .select(`
          *,
          meal_plan:meal_plans(*)
        `)
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ [CLIENT_MEAL_PLAN] Erro ao buscar plano do cliente:', error)
        console.error('❌ [CLIENT_MEAL_PLAN] Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details
        })
        return
      }

      console.log('✅ [CLIENT_MEAL_PLAN] Plano encontrado:', data)
      setClientMealPlan(data)
      
      // Se encontrou um plano, buscar os itens
      if (data) {
        await fetchMealPlanItems(data.meal_plan_id)
      }
    } catch (error) {
      console.error('❌ [CLIENT_MEAL_PLAN] Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar itens do plano
  const fetchMealPlanItems = async (mealPlanId: string) => {
    try {
      console.log('🔍 [CLIENT_MEAL_PLAN] Buscando itens do plano:', mealPlanId)
      
      const { data, error } = await supabase
        .from('meal_plan_items')
        .select(`
          *,
          food:foods_library(*)
        `)
        .eq('meal_plan_id', mealPlanId)
        .order('day_number', { ascending: true })
        .order('meal_order', { ascending: true })

      if (error) {
        console.error('❌ [CLIENT_MEAL_PLAN] Erro ao buscar itens do plano:', error)
        return
      }

      // ✅ PROTEGER CONTRA NULL: Filtrar itens com food null
      const filteredData = (data || []).filter(item => item.food !== null)
      console.log('✅ [CLIENT_MEAL_PLAN] Itens do plano carregados:', filteredData.length)
      setMealPlanItems(filteredData)
    } catch (error) {
      console.error('❌ [CLIENT_MEAL_PLAN] Erro inesperado:', error)
    }
  }

  // 🔧 CORREÇÃO: useEffect simplificado e estável
  useEffect(() => {
    console.log('🔍 [CLIENT_MEAL_PLAN] useEffect chamado', { 
      user: !!user, 
      profile: !!profile,
      userId: user?.id,
      initialized
    })
    
    // 🔧 CORREÇÃO: Só executar se tiver usuário e ainda não foi inicializado
    if (user && !initialized) {
      console.log('🚀 [CLIENT_MEAL_PLAN] Inicializando busca de plano')
      setInitialized(true)
      fetchClientMealPlan()
    }
  }, [user?.id, profile?.id, initialized]) // 🔧 DEPENDÊNCIAS ESTÁVEIS

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

  // 🔧 CORREÇÃO: Calcular macros totais do dia com proteção contra null
  const calculateDayMacros = (dayMeals: MealPlanItem[]) => {
    return dayMeals.reduce((acc, item) => {
      // ✅ PROTEÇÃO MÁXIMA CONTRA NULL
      if (!item.food) {
        console.warn('⚠️ [CLIENT_MEAL_PLAN] Item sem food encontrado, ignorando no cálculo:', item)
        return acc
      }
      
      const factor = item.quantity / item.food.serving_size
      return {
        calories: acc.calories + Math.round(item.food.calories_per_serving * factor),
        protein: acc.protein + Math.round(item.food.protein * factor * 10) / 10,
        carbs: acc.carbs + Math.round(item.food.carbs * factor * 10) / 10,
        fat: acc.fat + Math.round(item.food.fat * factor * 10) / 10
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando seu plano alimentar...</p>
        </div>
      </div>
    )
  }

  if (!clientMealPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Você ainda não tem um plano alimentar ativo
            </h2>
            <p className="text-gray-600 mb-6">
              Entre em contato com seu profissional para receber um plano alimentar personalizado.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-green-800">
                <strong>Próximos passos:</strong><br />
                1. Fale com seu profissional de nutrição<br />
                2. Solicite um plano alimentar<br />
                3. Volte aqui para visualizar suas refeições
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meu Plano Alimentar</h1>
              <p className="text-gray-600">Seu plano personalizado de nutrição</p>
            </div>
          </div>
        </div>

        {/* Informações do Plano */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              {clientMealPlan.meal_plan.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientMealPlan.meal_plan.description && (
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

              {clientMealPlan.meal_plan.daily_calories_target && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Meta diária:</span>
                  <span className="text-sm font-medium">
                    {clientMealPlan.meal_plan.daily_calories_target} cal
                  </span>
                </div>
              )}
            </div>

            {/* Targets Nutricionais */}
            {(clientMealPlan.meal_plan.daily_protein_target || 
              clientMealPlan.meal_plan.daily_carbs_target || 
              clientMealPlan.meal_plan.daily_fat_target) && (
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

            {clientMealPlan.meal_plan.objective && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-700">Objetivo:</p>
                <p className="text-sm text-gray-600">{clientMealPlan.meal_plan.objective}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refeições por Dia */}
        {mealPlanItems.length > 0 && (
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
                                    {/* ✅ PROTEÇÃO MÁXIMA CONTRA NULL */}
                                    <span className="font-medium">
                                      {mealPlanItem.food?.name || 'Alimento não encontrado'}
                                    </span>
                                    <Badge variant="outline">
                                      {mealPlanItem.quantity}g
                                    </Badge>
                                  </div>

                                  {/* ✅ PROTEÇÃO CONTRA NULL - Só renderizar macros se food existir */}
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

                                  {/* ✅ PROTEÇÃO CONTRA NULL - Só renderizar categoria se food existir */}
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
        )}
      </div>
    </div>
  )
}

export default ClientMealPlan