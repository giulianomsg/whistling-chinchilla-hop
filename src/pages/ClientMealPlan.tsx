import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Maximize2,
  Eye
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import MealPlanDetailView from '@/components/client/MealPlanDetailView'

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
  const [showDetailView, setShowDetailView] = useState(false)
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

      // ✅ PROTEGER CONTRA NULL: Filtrar itens com food null (ainda necessário para foods)
      const filteredData = (data || []).filter(item => item.food !== null)
      console.log('✅ [CLIENT_MEAL_PLAN] Itens do plano carregados:', filteredData.length)
      setMealPlanItems(filteredData)
    } catch (error) {
      console.error('❌ [CLIENT_MEAL_PLAN] Erro inesperado:', error)
    }
  }

  // useEffect simplificado e estável
  useEffect(() => {
    console.log('🔍 [CLIENT_MEAL_PLAN] useEffect chamado', { 
      user: !!user, 
      profile: !!profile,
      userId: user?.id,
      initialized
    })
    
    // Só executar se tiver usuário e ainda não foi inicializado
    if (user && !initialized) {
      console.log('🚀 [CLIENT_MEAL_PLAN] Inicializando busca de plano')
      setInitialized(true)
      fetchClientMealPlan()
    }
  }, [user?.id, profile?.id, initialized])

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

  if (showDetailView) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailView(false)}
              className="mb-4"
            >
              ← Voltar para Visão Resumida
            </Button>
          </div>
          <MealPlanDetailView clientMealPlan={clientMealPlan} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Meu Plano Alimentar</h1>
                <p className="text-gray-600">Seu plano personalizado de nutrição</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowDetailView(true)}
              className="flex items-center gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Ver Detalhes Completos
            </Button>
          </div>
        </div>

        {/* Card Resumo do Plano */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              {/* ✅ PROTEÇÃO SIMPLIFICADA - Agora meal_plan não deve ser null graças à correção RLS */}
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
                  <Target className="h-4 w-4 text-gray-500" />
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
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-700">Objetivo:</p>
                <p className="text-sm text-gray-600">{clientMealPlan.meal_plan.objective}</p>
              </div>
            )}

            {clientMealPlan.notes && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Nota do profissional:</strong> {clientMealPlan.notes}
                </p>
              </div>
            )}

            {/* Estatísticas Rápidas */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded">
                <p className="text-xl font-bold text-green-600">{mealPlanItems.length}</p>
                <p className="text-xs text-gray-600">Refeições</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <p className="text-xl font-bold text-blue-600">
                  {new Set(mealPlanItems.map(item => item.day_number)).size}
                </p>
                <p className="text-xs text-gray-600">Dias</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded">
                <p className="text-xl font-bold text-orange-600">
                  {clientMealPlan.meal_plan?.daily_calories_target || 0}
                </p>
                <p className="text-xs text-gray-600">Cal/Dia</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <p className="text-xl font-bold text-purple-600">
                  {new Set(mealPlanItems.map(item => item.food?.category).filter(Boolean)).size}
                </p>
                <p className="text-xs text-gray-600">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prévia das Refeições */}
        {mealPlanItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-600" />
                Prévia das Refeições
              </CardTitle>
              <p className="text-sm text-gray-600">
                Clique em "Ver Detalhes Completos" para ver todas as refeições com informações nutricionais detalhadas
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: Math.min(3, 7) }, (_, i) => {
                  const dayNumber = i + 1
                  const dayMeals = mealsByDay[dayNumber] || []
                  
                  return (
                    <div key={dayNumber} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Dia {dayNumber}</h3>
                      <div className="space-y-2">
                        {dayMeals.slice(0, 2).map((mealPlanItem, index) => (
                          <div key={mealPlanItem.id} className="flex items-center gap-2 text-sm">
                            <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 truncate">
                              {mealPlanItem.meal_name}
                            </span>
                          </div>
                        ))}
                        {dayMeals.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{dayMeals.length - 2} refeições...
                          </p>
                        )}
                        {dayMeals.length === 0 && (
                          <p className="text-xs text-gray-500">Nenhuma refeição</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => setShowDetailView(true)}
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                >
                  <Maximize2 className="h-4 w-4" />
                  Ver Todas as Refeições Detalhadas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mealPlanItems.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma refeição encontrada</h3>
              <p className="text-gray-600 mb-4">
                Seu profissional ainda não adicionou refeições a este plano.
              </p>
              <Button 
                onClick={() => setShowDetailView(true)}
                variant="outline"
                disabled
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Ver Detalhes (Indisponível)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ClientMealPlan