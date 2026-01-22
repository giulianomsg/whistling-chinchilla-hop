import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFeedback } from '@/components/ui/CapiFitFeedback'
import { Progress } from '@/components/ui/progress'
import {
  Utensils, Plus, Edit, Trash2, Settings, Target, Loader2, Search, Apple, Flame, X
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'
import { UnifiedFoodSearch } from '@/components/nutrition/UnifiedFoodSearch'
import { MyFoodsTab } from '@/components/nutrition/MyFoodsTab'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

const MealPlanner: React.FC = () => {
  const { user, loading } = useAuth()
  const { confirm } = useFeedback()
  const [mealPlans, setMealPlans] = useState<any[]>([])
  const [mealPlanItems, setMealPlanItems] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isManageSheetOpen, setIsManageSheetOpen] = useState(false)
  const [isAddMealDialogOpen, setIsAddMealDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const initialPlanState = { name: '', objective: '', kcal: 2000, prot: 150, carb: 250, fat: 65 }
  const [planForm, setPlanForm] = useState(initialPlanState)

  // New Meal State
  const [pendingFood, setPendingFood] = useState<any>(null) // Food selected from Unified Search
  const [newMealQty, setNewMealQty] = useState(100)
  const [newMealName, setNewMealName] = useState('Refeição') // Or specific like 'Café da Manhã'
  const [selectedDays, setSelectedDays] = useState<number[]>([1])

  const fetchData = async () => {
    if (!user) return
    setPageLoading(true)
    const { data } = await supabase.from('meal_plans').select('*').eq('nutritionist_id', user.id).order('created_at', { ascending: false })
    setMealPlans(data || [])
    setPageLoading(false)
  }

  useEffect(() => { if (!loading && user) fetchData() }, [user])

  const openCreateDialog = () => {
    setPlanForm(initialPlanState)
    setIsCreateDialogOpen(true)
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { error } = await supabase.from('meal_plans').insert({
      name: planForm.name, objective: planForm.objective,
      daily_calories_target: planForm.kcal, daily_protein_target: planForm.prot,
      daily_carbs_target: planForm.carb, daily_fat_target: planForm.fat,
      nutritionist_id: user.id, is_template: false
    })
    if (!error) { showSuccess('Criado!'); setIsCreateDialogOpen(false); fetchData() }
    else showError('Erro ao criar')
  }

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMealPlan) return
    const { error } = await supabase.from('meal_plans').update({
      name: planForm.name, objective: planForm.objective,
      daily_calories_target: planForm.kcal, daily_protein_target: planForm.prot,
      daily_carbs_target: planForm.carb, daily_fat_target: planForm.fat
    }).eq('id', selectedMealPlan.id)
    if (!error) { showSuccess('Atualizado!'); setIsEditDialogOpen(false); fetchData() }
    else showError('Erro ao atualizar')
  }

  const handleDeletePlan = async (id: string) => {
    if (!await confirm({ title: "Excluir Plano?", description: "Esta ação não pode ser desfeita.", variant: "destructive", confirmText: "Excluir", cancelText: "Cancelar" })) return

    const { error } = await supabase.from('meal_plans').delete().eq('id', id)
    if (!error) { showSuccess('Deletado!'); fetchData() }
    else showError('Erro')
  }

  const handleManage = async (plan: any) => {
    setSelectedMealPlan(plan)
    const { data } = await supabase
      .from('meal_plan_items')
      .select(`*, food:foods_library(*)`)
      .eq('meal_plan_id', plan.id)
      .order('day_number')
      .order('meal_order')

    setMealPlanItems((data || []).filter(i => i.food !== null))
    setIsManageSheetOpen(true)
  }

  const handleAddMeal = async () => {
    if (!selectedMealPlan || !pendingFood || selectedDays.length === 0) return

    // Prepare batch inserts for all selected days
    const itemsToInsert = selectedDays.map(day => ({
      meal_plan_id: selectedMealPlan.id,
      food_id: pendingFood.id,
      day_number: day,
      meal_name: newMealName,
      quantity: newMealQty,
      meal_order: 99
    }))

    const { error } = await supabase.from('meal_plan_items').insert(itemsToInsert)

    if (!error) {
      showSuccess('Item adicionado!');
      // Refresh items to update Dashboard
      handleManage(selectedMealPlan);
      setIsAddMealDialogOpen(false);
      setPendingFood(null);
      setNewMealQty(100);
    } else {
      showError('Erro ao adicionar item');
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!await confirm({ title: "Remover Item?", description: "Remover este item da refeição?", variant: "destructive", confirmText: "Remover", cancelText: "Cancelar" })) return

    await supabase.from('meal_plan_items').delete().eq('id', itemId)
    handleManage(selectedMealPlan) // Refresh
  }

  const openEditDialog = (plan: any) => {
    setSelectedMealPlan(plan)
    setPlanForm({
      name: plan.name, objective: plan.objective || '',
      kcal: plan.daily_calories_target, prot: plan.daily_protein_target,
      carb: plan.daily_carbs_target, fat: plan.daily_fat_target
    })
    setIsEditDialogOpen(true)
  }

  const calculateItemMacros = (item: any) => {
    const base = item.food.metric_serving_amount || 100
    const ratio = item.quantity / base
    return {
      kcal: (item.food.calories_per_serving || 0) * ratio,
      prot: (item.food.protein || 0) * ratio,
      carb: (item.food.carbs || 0) * ratio,
      fat: (item.food.fat || 0) * ratio
    }
  }

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><Utensils className="text-green-600 dark:text-green-400" /> Planejador de Dietas</h1>
        </div>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="plans">Meus Planos</TabsTrigger>
            <TabsTrigger value="foods">Meus Alimentos</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar planos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 bg-card border-border text-foreground"
                />
              </div>
              <Button onClick={openCreateDialog} className="bg-green-600 text-white hover:bg-green-500 ml-4"><Plus className="mr-2 h-4 w-4" /> Novo Plano</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mealPlans.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(plan => (
                <Card key={plan.id} className="bg-card border-border hover:bg-accent/50 transition-all group cursor-pointer" onClick={() => handleManage(plan)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-foreground text-lg">{plan.name}</CardTitle>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)} className="text-muted-foreground hover:text-blue-500"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm space-y-2">
                    <div className="flex gap-2 items-center"><Flame className="h-4 w-4 text-orange-500" /> {plan.daily_calories_target} kcal/dia</div>
                    <div className="flex gap-2 items-center"><Target className="h-4 w-4" /> {plan.objective || 'Geral'}</div>
                    <div className="pt-2">
                      <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20" onClick={(e) => {
                        e.stopPropagation();
                        handleManage(plan);
                      }}>
                        <Utensils className="mr-2 h-4 w-4" /> Gerenciar Dieta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="foods">
            <MyFoodsTab />
          </TabsContent>
        </Tabs>

        {/* Create/Edit Plan Dialogs */}
        {[
          { open: isCreateDialogOpen, change: setIsCreateDialogOpen, title: 'Novo Plano', handler: handleCreatePlan },
          { open: isEditDialogOpen, change: setIsEditDialogOpen, title: 'Editar Plano', handler: handleUpdatePlan }
        ].map((d, i) => (
          <Dialog key={i} open={d.open} onOpenChange={d.change}>
            <DialogContent className="bg-card border-border text-foreground">
              <DialogHeader><DialogTitle>{d.title}</DialogTitle></DialogHeader>
              <form onSubmit={d.handler} className="space-y-4">
                <div><Label>Nome</Label><Input value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} className="bg-muted border-border" /></div>
                <div><Label>Objetivo</Label><Input value={planForm.objective} onChange={e => setPlanForm({ ...planForm, objective: e.target.value })} className="bg-muted border-border" /></div>
                <div className="grid grid-cols-4 gap-2">
                  <div><Label>Kcal</Label><Input type="number" value={planForm.kcal} onChange={e => setPlanForm({ ...planForm, kcal: +e.target.value })} className="bg-muted border-border" /></div>
                  <div><Label>Prot</Label><Input type="number" value={planForm.prot} onChange={e => setPlanForm({ ...planForm, prot: +e.target.value })} className="bg-muted border-border" /></div>
                  <div><Label>Carb</Label><Input type="number" value={planForm.carb} onChange={e => setPlanForm({ ...planForm, carb: +e.target.value })} className="bg-muted border-border" /></div>
                  <div><Label>Gord</Label><Input type="number" value={planForm.fat} onChange={e => setPlanForm({ ...planForm, fat: +e.target.value })} className="bg-muted border-border" /></div>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        ))}

        {/* Manage Plan Sheet (Main Interface) */}
        <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
          <SheetContent className="bg-card border-l border-border text-foreground w-[95%] sm:w-[1000px] sm:max-w-[90vw] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <Utensils className="h-6 w-6" /> {selectedMealPlan?.name}
              </SheetTitle>
            </SheetHeader>

            {selectedMealPlan && (
              <Dashboard
                items={mealPlanItems}
                targets={{
                  kcal: selectedMealPlan.daily_calories_target,
                  prot: selectedMealPlan.daily_protein_target,
                  carb: selectedMealPlan.daily_carbs_target,
                  fat: selectedMealPlan.daily_fat_target
                }}
                calc={calculateItemMacros}
              />
            )}

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Diário Alimentar</h3>
                <div className="flex gap-2">
                  <UnifiedFoodSearch
                    trigger={<Button size="sm" className="bg-green-600 hover:bg-green-500 text-white"><Plus className="h-4 w-4 mr-2" /> Adicionar Alimento</Button>}
                    onSelect={(food) => {
                      setPendingFood(food);
                      // Open the configuration dialog immediately after selection
                      setIsAddMealDialogOpen(true);
                    }}
                  />
                </div>

                {/* Configuration Dialog - Now opens AFTER selection */}
                <Dialog open={isAddMealDialogOpen} onOpenChange={(open) => {
                  setIsAddMealDialogOpen(open);
                  if (!open) setPendingFood(null); // Reset if closed without adding
                }}>
                  <DialogContent className="bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle>Configurar Refeição</DialogTitle></DialogHeader>

                    {pendingFood && (
                      <div className="space-y-4 mt-2">
                        <div className="p-3 bg-muted rounded-md flex justify-between items-center">
                          <div>
                            <div className="font-bold">{pendingFood.name}</div>
                            <div className="text-xs text-muted-foreground">{pendingFood.calories} kcal / {pendingFood.serving_base}g</div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => { setPendingFood(null); setIsAddMealDialogOpen(false); }}><X className="h-4 w-4" /></Button>
                        </div>

                        <div><Label>Refeição</Label><Input value={newMealName} onChange={e => setNewMealName(e.target.value)} placeholder="Ex: Café" /></div>

                        <div>
                          <Label className="mb-2 block">Dias</Label>
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 7 }, (_, i) => i + 1).map(day => (
                              <div
                                key={day}
                                onClick={() => {
                                  setSelectedDays(prev => prev.includes(day)
                                    ? prev.length > 1 ? prev.filter(d => d !== day) : prev
                                    : [...prev, day].sort()
                                  )
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-all ${selectedDays.includes(day)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                  }`}
                              >
                                {day}
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto text-xs"
                              onClick={() => setSelectedDays([1, 2, 3, 4, 5, 6, 7])}
                            >
                              Todos
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label>Quantidade (gramas)</Label>
                          <Input type="number" value={newMealQty} onChange={e => setNewMealQty(+e.target.value)} className="text-lg font-bold" />
                        </div>

                        <div className="p-3 bg-green-500/10 rounded-md border border-green-500/20 text-sm">
                          <div className="font-semibold text-green-700 dark:text-green-400 mb-1">Calculado ({selectedDays.length} {selectedDays.length === 1 ? 'dia' : 'dias'}):</div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div><span className="block font-bold">{Math.round((pendingFood.calories || 0) * (newMealQty / 100))}</span> Kcal</div>
                            <div><span className="block font-bold">{Math.round((pendingFood.protein || 0) * (newMealQty / 100))}</span> P</div>
                            <div><span className="block font-bold">{Math.round((pendingFood.carbs || 0) * (newMealQty / 100))}</span> C</div>
                            <div><span className="block font-bold">{Math.round((pendingFood.fats || 0) * (newMealQty / 100))}</span> G</div>
                          </div>
                        </div>

                        <Button onClick={handleAddMeal} className="w-full bg-green-600">
                          Adicionar aos Dias Selecionados
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs defaultValue="day-1" className="w-full">
                <TabsList className="bg-muted w-full justify-start overflow-x-auto p-1 mb-4 hide-scrollbar">
                  {Array.from({ length: 7 }, (_, i) => <TabsTrigger key={i} value={`day-${i + 1}`} className="min-w-[80px]">Dia {i + 1}</TabsTrigger>)}
                </TabsList>
                {Array.from({ length: 7 }, (_, i) => {
                  const dayNum = i + 1;
                  const itemsDay = mealPlanItems.filter(mi => mi.day_number === dayNum);

                  // Group by Meal Name
                  const meals = itemsDay.reduce((acc: any, item: any) => {
                    if (!acc[item.meal_name]) acc[item.meal_name] = [];
                    acc[item.meal_name].push(item);
                    return acc;
                  }, {});

                  return (
                    <TabsContent key={i} value={`day-${dayNum}`} className="space-y-4">
                      {Object.keys(meals).length === 0 && <div className="text-center text-muted-foreground py-10 opacity-50">Nenhuma refeição neste dia</div>}

                      {Object.entries(meals).map(([mealName, items]: [string, any]) => (
                        <div key={mealName} className="bg-card border border-border rounded-lg overflow-hidden">
                          <div className="bg-muted/30 px-4 py-2 border-b border-border flex justify-between items-center">
                            <h4 className="font-bold text-primary">{mealName}</h4>
                            <div className="text-xs text-muted-foreground font-mono">
                              {Math.round(items.reduce((sum: number, x: any) => sum + calculateItemMacros(x).kcal, 0))} kcal
                            </div>
                          </div>
                          <div className="divide-y divide-border">
                            {(items as any[]).map(item => {
                              const macros = calculateItemMacros(item)
                              return (
                                <div key={item.id} className="p-3 flex items-center justify-between hover:bg-muted/10">
                                  <div className="flex-1">
                                    <div className="font-medium">{item.food.name}</div>
                                    <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                                      <span>{item.quantity}g</span>
                                      <span className="text-green-600">{Math.round(macros.kcal)} kcal</span>
                                      <span>P: {Math.round(macros.prot)}</span>
                                      <span>C: {Math.round(macros.carb)}</span>
                                      <span>G: {Math.round(macros.fat)}</span>
                                    </div>
                                  </div>
                                  <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8 text-destructive opacity-50 hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

// Sub-component for Dashboard
const Dashboard = ({ items, targets, calc }: { items: any[], targets: any, calc: (i: any) => any }) => {
  // Current totals (Plan Average or Total? prompt implies Day, usually Day 1 is representative)
  // We will sum ALL items then divide by number of active days? Or just sum for Day 1?
  // Let's sum Day 1 for now as a "Representative Day".
  const day1Items = items.filter(i => i.day_number === 1)
  const totals = day1Items.reduce((acc, item) => {
    const m = calc(item)
    return {
      kcal: acc.kcal + m.kcal,
      prot: acc.prot + m.prot,
      carb: acc.carb + m.carb,
      fat: acc.fat + m.fat
    }
  }, { kcal: 0, prot: 0, carb: 0, fat: 0 })

  const data = [
    { name: 'Proteína', value: totals.prot, fill: '#8884d8' },
    { name: 'Carb', value: totals.carb, fill: '#82ca9d' },
    { name: 'Gordura', value: totals.fat, fill: '#ffc658' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Macro Distribution Donut */}
      <Card className="bg-muted/10 border-none shadow-none">
        <CardContent className="p-4 flex flex-col items-center justify-center relative h-[180px]">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground absolute top-2 left-4">Distribuição (Dia 1)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-[45%] text-center text-xs text-muted-foreground pointer-events-none">
            <div>{Math.round(totals.kcal)}</div>
            <div>kcal</div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bars */}
      <Card className="col-span-2 bg-muted/10 border-none shadow-none">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Calorias (Meta: {targets.kcal})</span>
              <span className={totals.kcal > targets.kcal ? "text-red-500" : "text-green-500"}>{Math.round(totals.kcal)} kcal</span>
            </div>
            <Progress value={Math.min((totals.kcal / targets.kcal) * 100, 100)} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span>Prot ({targets.prot}g)</span> <span>{Math.round(totals.prot)}g</span></div>
              <Progress value={Math.min((totals.prot / targets.prot) * 100, 100)} className="h-1.5 [&>div]:bg-purple-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span>Carb ({targets.carb}g)</span> <span>{Math.round(totals.carb)}g</span></div>
              <Progress value={Math.min((totals.carb / targets.carb) * 100, 100)} className="h-1.5 [&>div]:bg-green-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span>Gord ({targets.fat}g)</span> <span>{Math.round(totals.fat)}g</span></div>
              <Progress value={Math.min((totals.fat / targets.fat) * 100, 100)} className="h-1.5 [&>div]:bg-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MealPlanner