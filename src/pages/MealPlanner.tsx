import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import {
  Utensils, Plus, Edit, Trash2, Settings, Target, Loader2, Search, Apple, Flame, X
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const initialPlanState = { name: '', objective: '', kcal: 2000, prot: 150, carb: 250, fat: 65 }
  const [planForm, setPlanForm] = useState(initialPlanState)
  const [newMeal, setNewMeal] = useState({ foodId: '', day: 1, name: 'Refeição', qty: 100, note: '' })

  const fetchData = async () => {
    if (!user) return
    setPageLoading(true)
    const [pRes, fRes] = await Promise.all([
      supabase.from('meal_plans').select('*').eq('nutritionist_id', user.id).order('created_at', { ascending: false }),
      supabase.from('foods_library').select('*').order('name')
    ])
    setMealPlans(pRes.data || [])
    setFoods(fRes.data || [])
    setPageLoading(false)
  }

  useEffect(() => { if (!loading && user) fetchData() }, [user])

  // Resetar form ao abrir criação
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
    const { error } = await supabase.from('meal_plans').delete().eq('id', id)
    if (!error) { showSuccess('Deletado!'); fetchData() }
    else showError('Erro')
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
    if (!error) { showSuccess('Adicionado!'); handleManage(selectedMealPlan); setIsAddMealDialogOpen(false) }
  }

  const handleDeleteItem = async (itemId: string) => {
    await supabase.from('meal_plan_items').delete().eq('id', itemId)
    handleManage(selectedMealPlan)
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

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><Utensils className="text-green-600 dark:text-green-400" /> Planos Alimentares</h1>
          <Button onClick={openCreateDialog} className="bg-green-600 text-white hover:bg-green-500"><Plus className="mr-2 h-4 w-4" /> Novo Plano</Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 bg-card border-border text-foreground"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mealPlans.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(plan => (
            <Card key={plan.id} className="bg-card border-border hover:bg-accent/50 transition-all group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-foreground text-lg">{plan.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleManage(plan)} className="text-muted-foreground hover:text-foreground"><Settings className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)} className="text-muted-foreground hover:text-blue-500"><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border text-foreground">
                        <AlertDialogHeader><AlertDialogTitle>Excluir?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel className="text-foreground">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeletePlan(plan.id)} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm space-y-2">
                <div className="flex gap-2 items-center"><Flame className="h-4 w-4 text-orange-500" /> {plan.daily_calories_target} kcal</div>
                <div className="flex gap-2 items-center"><Target className="h-4 w-4" /> {plan.objective || 'Geral'}</div>
              </CardContent>
            </Card>
          ))}
        </div>

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

        <Sheet open={isManageSheetOpen} onOpenChange={setIsManageSheetOpen}>
          <SheetContent className="bg-card border-l border-border text-foreground w-[90%] sm:w-[600px] sm:max-w-[30rem] overflow-y-auto">
            <SheetHeader><SheetTitle className="text-foreground">Refeições</SheetTitle></SheetHeader>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Itens</h3>
                <Dialog open={isAddMealDialogOpen} onOpenChange={setIsAddMealDialogOpen}>
                  <DialogTrigger asChild><Button size="sm" className="bg-muted text-foreground hover:bg-accent"><Plus className="h-4 w-4 mr-2" /> Add</Button></DialogTrigger>
                  <DialogContent className="bg-card border-border text-foreground">
                    <DialogHeader><DialogTitle>Adicionar Refeição</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Select onValueChange={v => setNewMeal({ ...newMeal, foodId: v })}>
                        <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Alimento..." /></SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          {foods.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div><Label>Nome da Refeição</Label><Input className="bg-muted border-border" value={newMeal.name} onChange={e => setNewMeal({ ...newMeal, name: e.target.value })} /></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label>Dia</Label><Input type="number" className="bg-muted border-border" value={newMeal.day} onChange={e => setNewMeal({ ...newMeal, day: +e.target.value })} /></div>
                        <div><Label>Qtd (g)</Label><Input type="number" className="bg-muted border-border" value={newMeal.qty} onChange={e => setNewMeal({ ...newMeal, qty: +e.target.value })} /></div>
                      </div>
                      <Button onClick={handleAddMeal} className="w-full bg-green-600 hover:bg-green-500 text-white">Confirmar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs defaultValue="day-1">
                <TabsList className="bg-muted w-full justify-start overflow-x-auto">
                  {Array.from({ length: 7 }, (_, i) => <TabsTrigger key={i} value={`day-${i + 1}`} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Dia {i + 1}</TabsTrigger>)}
                </TabsList>
                {Array.from({ length: 7 }, (_, i) => (
                  <TabsContent key={i} value={`day-${i + 1}`} className="space-y-3 mt-4">
                    {mealPlanItems.filter(mi => mi.day_number === i + 1).map(mi => (
                      <Card key={mi.id} className="bg-card border-border p-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Apple className="h-5 w-5 text-green-500" />
                          <div><div className="font-bold text-foreground">{mi.meal_name}</div><div className="text-xs text-muted-foreground">{mi.food.name} - {mi.quantity}g</div></div>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(mi.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                      </Card>
                    ))}
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