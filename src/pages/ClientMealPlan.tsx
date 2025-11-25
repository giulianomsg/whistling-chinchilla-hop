import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Utensils, Calendar, Target, Loader2, CheckCircle, AlertCircle, Maximize2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import MealPlanDetailView from '@/components/client/MealPlanDetailView'

const ClientMealPlan: React.FC = () => {
  const { user } = useAuth()
  const [clientMealPlan, setClientMealPlan] = useState<any>(null)
  const [mealPlanItems, setMealPlanItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetailView, setShowDetailView] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: planData } = await supabase
          .from('client_meal_plans')
          .select(`*, meal_plan:meal_plans(*)`)
          .eq('client_id', user.id).eq('status', 'active').single()

        setClientMealPlan(planData)
        if (planData) {
          const { data: items } = await supabase
            .from('meal_plan_items')
            .select(`*, food:foods_library(*)`)
            .eq('meal_plan_id', planData.meal_plan_id)
            .order('day_number').order('meal_order')
          setMealPlanItems((items || []).filter(i => i.food !== null))
        }
      } catch (error) { console.error(error) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  if (!clientMealPlan) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 text-center py-12 bg-card rounded-xl border border-border">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sem dieta ativa</h2>
          <p className="text-muted-foreground mb-6">Solicite um plano alimentar ao seu nutricionista.</p>
        </div>
      </div>
    )
  }

  if (showDetailView) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Button variant="outline" onClick={() => setShowDetailView(false)} className="mb-6 border-border text-muted-foreground hover:text-foreground hover:bg-accent">
            ← Voltar ao Resumo
          </Button>
          <MealPlanDetailView clientMealPlan={clientMealPlan} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg"><Utensils className="h-6 w-6 text-green-500" /></div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Minha Dieta</h1>
              <p className="text-muted-foreground">Seu plano nutricional</p>
            </div>
          </div>
          <Button onClick={() => setShowDetailView(true)} className="bg-green-600 text-white hover:bg-green-500 font-semibold">
            <Maximize2 className="h-4 w-4 mr-2" /> Ver Detalhes
          </Button>
        </div>

        <Card className="mb-8 bg-card border-border backdrop-blur-md">
          <CardHeader><CardTitle className="text-foreground flex gap-2"><Target className="text-green-500" /> {clientMealPlan.meal_plan.name}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-muted-foreground" /> Início: {new Date(clientMealPlan.start_date).toLocaleDateString('pt-BR')}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Target className="h-4 w-4 text-muted-foreground" /> Meta: {clientMealPlan.meal_plan.daily_calories_target} kcal</div>
              <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500" /> Status: <Badge variant="outline" className="ml-2 border-green-500/50 text-green-600 dark:text-green-400">Ativo</Badge></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-muted/50 p-3 rounded text-center"><p className="text-xl font-bold text-orange-500">{clientMealPlan.meal_plan.daily_calories_target}</p><p className="text-xs text-muted-foreground">Kcal</p></div>
              <div className="bg-muted/50 p-3 rounded text-center"><p className="text-xl font-bold text-blue-500">{clientMealPlan.meal_plan.daily_protein_target}g</p><p className="text-xs text-muted-foreground">Prot</p></div>
              <div className="bg-muted/50 p-3 rounded text-center"><p className="text-xl font-bold text-yellow-500">{clientMealPlan.meal_plan.daily_carbs_target}g</p><p className="text-xs text-muted-foreground">Carb</p></div>
              <div className="bg-muted/50 p-3 rounded text-center"><p className="text-xl font-bold text-red-500">{clientMealPlan.meal_plan.daily_fat_target}g</p><p className="text-xs text-muted-foreground">Gord</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ClientMealPlan