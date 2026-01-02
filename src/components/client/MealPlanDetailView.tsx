import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Utensils, Apple, BarChart3, Flame } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

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

  const calculateItemMacros = (item: any) => {
    const base = item.food.metric_serving_amount || item.food.serving_size || 100
    const ratio = item.quantity / base
    return {
      kcal: (item.food.calories_per_serving || 0) * ratio,
      prot: (item.food.protein || 0) * ratio,
      carb: (item.food.carbs || 0) * ratio,
      fat: (item.food.fat || 0) * ratio
    }
  }

  // Dashboard calculations (Day 1 Representative)
  const day1Items = mealPlanItems.filter(i => i.day_number === 1)
  const totals = day1Items.reduce((acc, item) => {
    const m = calculateItemMacros(item)
    return {
      kcal: acc.kcal + m.kcal,
      prot: acc.prot + m.prot,
      carb: acc.carb + m.carb,
      fat: acc.fat + m.fat
    }
  }, { kcal: 0, prot: 0, carb: 0, fat: 0 })

  const chartData = [
    { name: 'Proteína', value: totals.prot, fill: '#8884d8' }, // Purple
    { name: 'Carb', value: totals.carb, fill: '#82ca9d' },    // Green
    { name: 'Gordura', value: totals.fat, fill: '#ffc658' }   // Yellow
  ]

  const targets = {
    kcal: clientMealPlan.meal_plan.daily_calories_target,
    prot: clientMealPlan.meal_plan.daily_protein_target,
    carb: clientMealPlan.meal_plan.daily_carbs_target,
    fat: clientMealPlan.meal_plan.daily_fat_target
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando refeições...</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Macro Distribution Donut */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Distribuição Calórica (Dia Modelo)</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-2xl font-bold">{Math.round(totals.kcal)}</div>
              <div className="text-xs text-muted-foreground">kcal</div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bars */}
        <Card className="col-span-1 md:col-span-2 bg-card border-border shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Metas Diárias</CardTitle></CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Calorias (Meta: {targets.kcal})</span>
                <span className={totals.kcal > targets.kcal ? "text-destructive" : "text-green-500 font-bold"}>{Math.round(totals.kcal)} kcal</span>
              </div>
              <Progress value={Math.min((totals.kcal / targets.kcal) * 100, 100)} className="h-3 bg-muted" />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span>Prot ({targets.prot}g)</span> <span className="text-purple-500 font-bold">{Math.round(totals.prot)}g</span></div>
                <Progress value={Math.min((totals.prot / targets.prot) * 100, 100)} className="h-2 [&>div]:bg-[#8884d8] bg-muted" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span>Carb ({targets.carb}g)</span> <span className="text-green-500 font-bold">{Math.round(totals.carb)}g</span></div>
                <Progress value={Math.min((totals.carb / targets.carb) * 100, 100)} className="h-2 [&>div]:bg-[#82ca9d] bg-muted" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span>Gord ({targets.fat}g)</span> <span className="text-yellow-500 font-bold">{Math.round(totals.fat)}g</span></div>
                <Progress value={Math.min((totals.fat / targets.fat) * 100, 100)} className="h-2 [&>div]:bg-[#ffc658] bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals Lists by Day */}
      <Card className="bg-card border-border backdrop-blur-md">
        <CardHeader><CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5 text-primary" /> Cardápio Diário</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="day-1" className="w-full">
            <TabsList className="bg-muted w-full justify-start overflow-x-auto p-1 mb-6 hide-scrollbar">
              {Array.from({ length: 7 }, (_, i) => i + 1).map(day => (
                <TabsTrigger key={day} value={`day-${day}`} className="min-w-[80px]">
                  Dia {day}
                </TabsTrigger>
              ))}
            </TabsList>

            {Array.from({ length: 7 }, (_, i) => i + 1).map(day => {
              const dayItems = mealPlanItems.filter(i => i.day_number === day);
              // Group by Meal Name
              const meals = dayItems.reduce((acc: any, item: any) => {
                if (!acc[item.meal_name]) acc[item.meal_name] = [];
                acc[item.meal_name].push(item);
                return acc;
              }, {});

              return (
                <TabsContent key={day} value={`day-${day}`} className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                  {Object.keys(meals).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50 border-2 border-dashed border-border rounded-lg">
                      <Utensils className="h-8 w-8 mb-2" />
                      <p>Dia livre ou sem refeições planejadas</p>
                    </div>
                  )}

                  {Object.entries(meals).map(([mealName, items]: [string, any]) => (
                    <div key={mealName} className="rounded-xl border border-border overflow-hidden bg-card/50 shadow-sm">
                      <div className="bg-muted/40 px-4 py-3 border-b border-border flex justify-between items-center backdrop-blur-sm">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                          {mealName}
                        </h3>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {Math.round(items.reduce((sum: number, x: any) => sum + calculateItemMacros(x).kcal, 0))} kcal
                        </Badge>
                      </div>
                      <div className="divide-y divide-border">
                        {items.map((meal: any) => {
                          const macros = calculateItemMacros(meal)
                          return (
                            <div key={meal.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/5 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-green-500/10 rounded-full">
                                  <Apple className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">{meal.food.name}</div>
                                  <div className="text-sm text-muted-foreground mt-0.5">
                                    {meal.quantity}g
                                  </div>
                                  {meal.notes && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 italic">Note: {meal.notes}</p>}
                                </div>
                              </div>

                              <div className="flex gap-4 sm:gap-6 text-sm">
                                <div className="text-center min-w-[3rem]">
                                  <span className="block font-bold text-orange-500">{Math.round(macros.kcal)}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase">Kcal</span>
                                </div>
                                <div className="text-center min-w-[2.5rem]">
                                  <span className="block font-bold text-[#8884d8]">{Math.round(macros.prot)}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase">Prot</span>
                                </div>
                                <div className="text-center min-w-[2.5rem]">
                                  <span className="block font-bold text-[#82ca9d]">{Math.round(macros.carb)}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase">Carb</span>
                                </div>
                                <div className="text-center min-w-[2.5rem]">
                                  <span className="block font-bold text-[#ffc658]">{Math.round(macros.fat)}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase">Gord</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default MealPlanDetailView