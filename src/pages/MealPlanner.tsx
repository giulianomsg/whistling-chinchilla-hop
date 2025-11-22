import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Utensils, Plus, Edit, Trash2, Settings, Calendar, Target, Loader2, Search, Apple, Flame
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'

const MealPlanner: React.FC = () => {
  const { user, loading } = useAuth()
  const [mealPlans, setMealPlans] = useState<any[]>([])
  const [foods, setFoods] = useState<any[]>([])
  const [mealPlanItems, setMealPlanItems] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null)
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isManageSheetOpen, setIsManageSheetOpen] = useState(false)
  const [isAddMealDialogOpen, setIsAddMealDialogOpen] = useState(false)

  // States simplificados para o exemplo
  const [newPlan, setNewPlan] = useState({ name: '', objective: '', kcal: 2000, prot: 150, carb: 250, fat: 65 })
  const [newMeal, setNewMeal] = useState({ foodId: '', day: 1, name: 'Refeição', qty: 100, note: '' })

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setPageLoading(true)
      const [pRes, fRes] = await Promise.all([
        supabase.from('meal_plans').select('*').eq('nutritionist_id', user.id).order('created_at', { ascending: false }),
        supabase.from('foods_library').select('*').order('name')
      ])
      setMealPlans(pRes.data || [])
      setFoods(fRes.data || [])
      setPageLoading(false)
    }
    fetchData()
  }, [user])

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { error } = await supabase.from('meal_plans').insert({
      name: newPlan.name, objective: newPlan.objective,
      daily_calories_target: newPlan.kcal, daily_protein_target: newPlan.prot,
      daily_carbs_target: newPlan.carb, daily_fat_target: newPlan.fat,
      nutritionist_id: user.id, is_template: false
    })
    if (!error) { showSuccess('Plano criado!'); setIsCreateDialogOpen(false); window.location.reload() }
    else showError('Erro ao criar plano')
  }

  const handleManage = async (plan: any) => {
    setSelectedMealPlan(plan)
    const { data } = await supabase.from('meal_plan_items').select(`*, food:foods_library(*)`).eq('meal_plan_id', plan.id).order('day_number').order('meal_order')
    setMealPlanItems((data || []).filter(i => i.food !== null))
    setIsManageSheetOpen(true)
  }

  const handleAddMeal = async () => {
    if (!selectedMealPlan || !newMeal.foodId) return
    const { error } = await supabase.from('meal_plan_items').insert({
      meal_plan_id: selectedMealPlan.id, food_id: newMeal.foodId,
      day_number: newMeal.day, meal_name: newMeal.name, quantity: newMeal.qty, notes: newMeal.note,
      meal_order: 99
    })
    if (!error) { showSuccess('Refeição adicionada!'); handleManage(selectedMealPlan); setIsAddMealDialogOpen(false) }
  }

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Utensils className="text-green-400"/> Planos Alimentares</h1>
            <p className="text-gray-400 mt-1">Crie e gerencie dietas.</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-500 text-white"><Plus className="mr-2 h-4 w-4"/> Novo Plano</Button></DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
              <DialogHeader><DialogTitle>Criar Plano</DialogTitle></DialogHeader>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div><Label>Nome</Label><Input value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} className="bg-black/20 border-white/10"/></div>
                <div><Label>Objetivo</Label><Input value={newPlan.objective} onChange={e => setNewPlan({...newPlan, objective: e.target.value})} className="bg-black/20 border-white/10"/></div>
                <div className="grid grid-cols-4 gap-2">
                  <div><Label>Kcal</Label><Input type="number" value={newPlan.kcal} onChange={e => setNewPlan({...newPlan, kcal: +e.target.value})} className="bg-black/20 border-white/10"/></div>
                  <div><Label>Prot</Label><Input type="number" value={newPlan.prot} onChange={e => setNewPlan({...newPlan, prot: +e.target.value})} className="bg-black/20 border-white/10"/></div>
                  <div><Label>Carb</Label><Input type="number" value={newPlan.carb} onChange={e => setNewPlan({...newPlan, carb: +e.target.value})} className="bg-black/20 border-white/10"/></div>
                  <div><Label>Gord</Label><Input type="number" value={newPlan.fat} onChange={e => setNewPlan({...newPlan, fat: +e.target.value})} className="bg-black/20 border-white/10"/></div>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input placeholder="Buscar planos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mealPlans.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(plan => (
            <Card key={plan.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group">
              <CardHeader>
                <CardTitle className="text-white text-lg flex justify-between">{plan.name} 
                  <Button variant="ghost" size="icon" onClick={() => handleManage(plan)} className="text-gray-400 hover:text-white"><Settings className="h-4 w-4"/></Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400 text-sm space-y-2">
                <div className="flex gap-2 items-center"><Flame className="h-4 w-4 text-orange-400"/> {plan.daily_calories_target} kcal</div>
                <div className="flex gap-2 items-center"><Target className="h-4 w-4"/> {plan.objective || 'Geral'}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sheet de Gerenciamento */}
        <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
          <SheetContent className="bg-slate-900 border-l border-white/10 text-white w-[90%] sm:w-[600px] overflow-y-auto">
            <SheetHeader><SheetTitle className="text-white">Refeições: {selectedMealPlan?.name}</SheetTitle></SheetHeader>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Refeições</h3>
                <Dialog open={isAddMealDialogOpen} onOpenChange={setIsAddMealDialogOpen}>
                  <DialogTrigger asChild><Button size="sm" className="bg-white/10 hover:bg-white/20 text-white"><Plus className="h-4 w-4 mr-2"/> Add</Button></DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader><DialogTitle>Adicionar Refeição</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <Select onValueChange={v => setNewMeal({...newMeal, foodId: v})}>
                        <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Alimento..."/></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/10 text-white">
                          {foods.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div><Label>Nome da Refeição</Label><Input className="bg-black/20 border-white/10" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>Dia</Label><Input type="number" className="bg-black/20 border-white/10" value={newMeal.day} onChange={e => setNewMeal({...newMeal, day: +e.target.value})}/></div>
                        <div><Label>Qtd (g)</Label><Input type="number" className="bg-black/20 border-white/10" value={newMeal.qty} onChange={e => setNewMeal({...newMeal, qty: +e.target.value})}/></div>
                      </div>
                      <Button onClick={handleAddMeal} className="w-full bg-green-600 text-white">Confirmar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs defaultValue="day-1">
                <TabsList className="bg-white/5 w-full justify-start overflow-x-auto">
                  {Array.from({length: 7}, (_, i) => (
                    <TabsTrigger key={i} value={`day-${i+1}`} className="data-[state=active]:bg-green-500 data-[state=active]:text-black">Dia {i+1}</TabsTrigger>
                  ))}
                </TabsList>
                {Array.from({length: 7}, (_, i) => (
                  <TabsContent key={i} value={`day-${i+1}`} className="space-y-3 mt-4">
                    {mealPlanItems.filter(mi => mi.day_number === i+1).map(mi => (
                      <Card key={mi.id} className="bg-white/5 border-white/10 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Apple className="h-5 w-5 text-green-400"/>
                          <div>
                            <div className="font-bold">{mi.meal_name}</div>
                            <div className="text-xs text-gray-400">{mi.food.name} - {mi.quantity}g</div>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-900/20"><Trash2 className="h-4 w-4"/></Button>
                      </Card>
                    ))}
                    {mealPlanItems.filter(mi => mi.day_number === i+1).length === 0 && <div className="text-center text-gray-500 text-sm py-4">Vazio</div>}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default MealPlanner