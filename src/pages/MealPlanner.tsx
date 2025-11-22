import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Utensils, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Calendar, 
  Target, 
  Loader2, 
  Search,
  Apple
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
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
  updated_at: string
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

const MealPlanner: React.FC = () => {
  const { user, profile, loading } = useAuth()
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [foods, setFoods] = useState<Food[]>([])
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null)
  
  // Estados para busca e filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [objectiveFilter, setObjectiveFilter] = useState<string>('all')

  // Dialog states
  const [isCreateMealPlanDialogOpen, setIsCreateMealPlanDialogOpen] = useState(false)
  const [isEditMealPlanDialogOpen, setIsEditMealPlanDialogOpen] = useState(false)
  const [isManageMealsSheetOpen, setIsManageMealsSheetOpen] = useState(false)
  const [isAddMealDialogOpen, setIsAddMealDialogOpen] = useState(false)
  const [isEditMealDialogOpen, setIsEditMealDialogOpen] = useState(false)

  // Form states
  const [mealPlanFormData, setMealPlanFormData] = useState({
    name: '',
    description: '',
    objective: '',
    daily_calories_target: 2000,
    daily_protein_target: 150,
    daily_carbs_target: 250,
    daily_fat_target: 65
  })

  const [mealFormData, setMealFormData] = useState({
    food_id: '',
    day_number: 1,
    meal_order: 1,
    meal_name: '',
    quantity: 100,
    notes: ''
  })

  // Estado para edição de item do plano
  const [editingMealItem, setEditingMealItem] = useState<MealPlanItem | null>(null)
  const [editMealFormData, setEditMealFormData] = useState({
    meal_order: 1,
    meal_name: '',
    quantity: 100,
    notes: ''
  })

  // Objetivos comuns para filtro
  const objectives = [
    'Emagrecimento',
    'Hipertrofia',
    'Manutenção',
    'Definição',
    'Ganho de Massa',
    'Performance',
    'Saúde',
    'Outros'
  ]

  // Buscar planos alimentares
  const fetchMealPlans = async () => {
    if (!user) return

    try {
      setPageLoading(true)
      let query = supabase
        .from('meal_plans')
        .select('*')
        .eq('nutritionist_id', user.id)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      if (objectiveFilter !== 'all') {
        query = query.eq('objective', objectiveFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar planos alimentares:', error)
        showError('Erro ao carregar planos alimentares')
        return
      }

      setMealPlans(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao carregar planos alimentares')
    } finally {
      setPageLoading(false)
    }
  }

  // Buscar alimentos disponíveis
  const fetchFoods = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('foods_library')
        .select('*')
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .order('name', { ascending: true })

      if (error) {
        console.error('Erro ao buscar alimentos:', error)
        return
      }

      setFoods(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar itens de um plano específico
  const fetchMealPlanItems = async (mealPlanId: string) => {
    try {
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
        console.error('Erro ao buscar itens do plano:', error)
        return
      }

      // ✅ PROTEGER CONTRA NULL: Filtrar itens com food null
      const filteredData = (data || []).filter(item => item.food !== null)
      setMealPlanItems(filteredData)
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchMealPlans()
      fetchFoods()
    }
  }, [user?.id, loading, searchTerm, objectiveFilter])

  // Resetar formulário de plano alimentar
  const resetMealPlanForm = () => {
    setMealPlanFormData({
      name: '',
      description: '',
      objective: '',
      daily_calories_target: 2000,
      daily_protein_target: 150,
      daily_carbs_target: 250,
      daily_fat_target: 65
    })
  }

  // Resetar formulário de refeição
  const resetMealForm = () => {
    setMealFormData({
      food_id: '',
      day_number: 1,
      meal_order: 1,
      meal_name: '',
      quantity: 100,
      notes: ''
    })
  }

  // Resetar formulário de edição de refeição
  const resetEditMealForm = () => {
    setEditMealFormData({
      meal_order: 1,
      meal_name: '',
      quantity: 100,
      notes: ''
    })
    setEditingMealItem(null)
  }

  // Criar plano alimentar
  const handleCreateMealPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const mealPlanData = {
        name: mealPlanFormData.name,
        description: mealPlanFormData.description || null,
        objective: mealPlanFormData.objective || null,
        daily_calories_target: mealPlanFormData.daily_calories_target,
        daily_protein_target: mealPlanFormData.daily_protein_target,
        daily_carbs_target: mealPlanFormData.daily_carbs_target,
        daily_fat_target: mealPlanFormData.daily_fat_target,
        nutritionist_id: user.id,
        is_template: false
      }

      const { error } = await supabase
        .from('meal_plans')
        .insert(mealPlanData)

      if (error) {
        console.error('Erro ao criar plano alimentar:', error)
        showError('Erro ao criar plano alimentar')
        return
      }

      showSuccess('Plano alimentar criado com sucesso!')
      setIsCreateMealPlanDialogOpen(false)
      resetMealPlanForm()
      fetchMealPlans()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao criar plano alimentar')
    }
  }

  // Editar plano alimentar
  const handleEditMealPlan = (mealPlan: MealPlan) => {
    setSelectedMealPlan(mealPlan)
    setMealPlanFormData({
      name: mealPlan.name,
      description: mealPlan.description || '',
      objective: mealPlan.objective || '',
      daily_calories_target: mealPlan.daily_calories_target || 2000,
      daily_protein_target: mealPlan.daily_protein_target || 150,
      daily_carbs_target: mealPlan.daily_carbs_target || 250,
      daily_fat_target: mealPlan.daily_fat_target || 65
    })
    setIsEditMealPlanDialogOpen(true)
  }

  // Atualizar plano alimentar
  const handleUpdateMealPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedMealPlan) return

    try {
      const mealPlanData = {
        name: mealPlanFormData.name,
        description: mealPlanFormData.description || null,
        objective: mealPlanFormData.objective || null,
        daily_calories_target: mealPlanFormData.daily_calories_target,
        daily_protein_target: mealPlanFormData.daily_protein_target,
        daily_carbs_target: mealPlanFormData.daily_carbs_target,
        daily_fat_target: mealPlanFormData.daily_fat_target
      }

      const { error } = await supabase
        .from('meal_plans')
        .update(mealPlanData)
        .eq('id', selectedMealPlan.id)

      if (error) {
        console.error('Erro ao atualizar plano alimentar:', error)
        showError('Erro ao atualizar plano alimentar')
        return
      }

      showSuccess('Plano alimentar atualizado com sucesso!')
      setIsEditMealPlanDialogOpen(false)
      setSelectedMealPlan(null)
      resetMealPlanForm()
      fetchMealPlans()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao atualizar plano alimentar')
    }
  }

  // Deletar plano alimentar
  const handleDeleteMealPlan = async (mealPlanId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', mealPlanId)

      if (error) {
        console.error('Erro ao deletar plano alimentar:', error)
        showError('Erro ao deletar plano alimentar')
        return
      }

      showSuccess('Plano alimentar deletado com sucesso!')
      fetchMealPlans()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao deletar plano alimentar')
    }
  }

  // Gerenciar refeições de um plano
  const handleManageMeals = async (mealPlan: MealPlan) => {
    setSelectedMealPlan(mealPlan)
    await fetchMealPlanItems(mealPlan.id)
    setIsManageMealsSheetOpen(true)
  }

  // Adicionar refeição ao plano
  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedMealPlan || !mealFormData.food_id) return

    try {
      // Obter o próximo meal_order para este dia
      const dayMeals = mealPlanItems.filter(mi => mi.day_number === mealFormData.day_number)
      const nextMealOrder = dayMeals.length + 1

      const mealItemData = {
        meal_plan_id: selectedMealPlan.id,
        food_id: mealFormData.food_id,
        day_number: mealFormData.day_number,
        meal_order: nextMealOrder,
        meal_name: mealFormData.meal_name || 'Refeição',
        quantity: mealFormData.quantity,
        notes: mealFormData.notes || null
      }

      const { error } = await supabase
        .from('meal_plan_items')
        .insert(mealItemData)

      if (error) {
        console.error('Erro ao adicionar refeição:', error)
        showError('Erro ao adicionar refeição ao plano')
        return
      }

      showSuccess('Refeição adicionada com sucesso!')
      setIsAddMealDialogOpen(false)
      resetMealForm()
      fetchMealPlanItems(selectedMealPlan.id)
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao adicionar refeição')
    }
  }

  // Editar refeição do plano
  const handleEditMealPlanItem = (mealPlanItem: MealPlanItem) => {
    setEditingMealItem(mealPlanItem)
    setEditMealFormData({
      meal_order: mealPlanItem.meal_order,
      meal_name: mealPlanItem.meal_name,
      quantity: mealPlanItem.quantity,
      notes: mealPlanItem.notes || ''
    })
    setIsEditMealDialogOpen(true)
  }

  // Atualizar refeição do plano
  const handleUpdateMealPlanItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMealItem) return

    try {
      const updateData = {
        meal_order: editMealFormData.meal_order,
        meal_name: editMealFormData.meal_name,
        quantity: editMealFormData.quantity,
        notes: editMealFormData.notes || null
      }

      const { error } = await supabase
        .from('meal_plan_items')
        .update(updateData)
        .eq('id', editingMealItem.id)

      if (error) {
        console.error('Erro ao atualizar refeição do plano:', error)
        showError('Erro ao atualizar refeição do plano')
        return
      }

      showSuccess('Refeição atualizada com sucesso!')
      setIsEditMealDialogOpen(false)
      resetEditMealForm()
      if (selectedMealPlan) {
        fetchMealPlanItems(selectedMealPlan.id)
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao atualizar refeição')
    }
  }

  // Deletar refeição do plano
  const handleDeleteMealPlanItem = async (mealPlanItemId: string) => {
    try {
      const { error } = await supabase
        .from('meal_plan_items')
        .delete()
        .eq('id', mealPlanItemId)

      if (error) {
        console.error('Erro ao deletar refeição do plano:', error)
        showError('Erro ao remover refeição do plano')
        return
      }

      showSuccess('Refeição removida com sucesso!')
      if (selectedMealPlan) {
        fetchMealPlanItems(selectedMealPlan.id)
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao remover refeição')
    }
  }

  // Agrupar refeições por dia
  const getMealsByDay = () => {
    const grouped: { [key: number]: MealPlanItem[] } = {}
    mealPlanItems.forEach(mi => {
      if (!grouped[mi.day_number]) {
        grouped[mi.day_number] = []
      }
      grouped[mi.day_number].push(mi)
    })
    return grouped
  }

  const mealsByDay = getMealsByDay()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Utensils className="h-8 w-8 text-green-600" />
                Planos Alimentares
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Crie e gerencie planos alimentares personalizados
              </p>
            </div>
            
            <Dialog open={isCreateMealPlanDialogOpen} onOpenChange={setIsCreateMealPlanDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-card border-gray-200 dark:border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Criar Novo Plano Alimentar</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateMealPlan} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meal-plan-name" className="dark:text-gray-200">Nome do Plano *</Label>
                    <Input
                      id="meal-plan-name"
                      value={mealPlanFormData.name}
                      onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, name: e.target.value })}
                      placeholder="Plano de Emagrecimento"
                      required
                      className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meal-plan-objective" className="dark:text-gray-200">Objetivo</Label>
                    <Textarea
                      id="meal-plan-objective"
                      value={mealPlanFormData.objective}
                      onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, objective: e.target.value })}
                      placeholder="Emagrecimento, hipertrofia, manutenção..."
                      rows={2}
                      className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meal-plan-description" className="dark:text-gray-200">Descrição</Label>
                    <Textarea
                      id="meal-plan-description"
                      value={mealPlanFormData.description}
                      onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, description: e.target.value })}
                      placeholder="Descrição detalhada do plano..."
                      rows={3}
                      className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calories-target" className="dark:text-gray-200">Calorias Diárias</Label>
                      <Input
                        id="calories-target"
                        type="number"
                        min="800"
                        max="5000"
                        value={mealPlanFormData.daily_calories_target}
                        onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, daily_calories_target: parseInt(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protein-target" className="dark:text-gray-200">Proteínas (g)</Label>
                      <Input
                        id="protein-target"
                        type="number"
                        min="20"
                        max="500"
                        value={mealPlanFormData.daily_protein_target}
                        onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, daily_protein_target: parseInt(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="carbs-target" className="dark:text-gray-200">Carboidratos (g)</Label>
                      <Input
                        id="carbs-target"
                        type="number"
                        min="20"
                        max="500"
                        value={mealPlanFormData.daily_carbs_target}
                        onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, daily_carbs_target: parseInt(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fat-target" className="dark:text-gray-200">Gorduras (g)</Label>
                      <Input
                        id="fat-target"
                        type="number"
                        min="10"
                        max="200"
                        value={mealPlanFormData.daily_fat_target}
                        onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, daily_fat_target: parseInt(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateMealPlanDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                      Criar Plano
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar planos alimentares..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
              <SelectTrigger className="bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white">
                <SelectValue placeholder="Objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Objetivos</SelectItem>
                {objectives.map((objective) => (
                  <SelectItem key={objective} value={objective}>
                    {objective}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Planos Alimentares */}
        {pageLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans.map((mealPlan) => (
              <Card key={mealPlan.id} className="relative bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{mealPlan.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleManageMeals(mealPlan)}
                        className="dark:text-gray-400 dark:hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditMealPlan(mealPlan)}
                        className="dark:text-gray-400 dark:hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                              Tem certeza que deseja deletar o plano "{mealPlan.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:border-white/10 dark:text-gray-300">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMealPlan(mealPlan.id)} className="bg-red-600 hover:bg-red-700 text-white">
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {mealPlan.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{mealPlan.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {mealPlan.daily_calories_target && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {mealPlan.daily_calories_target} cal/dia
                        </span>
                      </div>
                    )}

                    {mealPlan.objective && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{mealPlan.objective}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full mt-4 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10" 
                    variant="outline"
                    onClick={() => handleManageMeals(mealPlan)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gerenciar Refeições
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {mealPlans.length === 0 && !pageLoading && (
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum plano encontrado</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Comece criando seu primeiro plano alimentar personalizado.</p>
            <Button onClick={() => setIsCreateMealPlanDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Plano
            </Button>
          </div>
        )}

        {/* Sheet de Gerenciamento de Refeições */}
        <Sheet open={isManageMealsSheetOpen} onOpenChange={setIsManageMealsSheetOpen}>
          <SheetContent className="w-[800px] sm:w-[1000px] bg-white dark:bg-card border-l border-gray-200 dark:border-white/10">
            <SheetHeader>
              <SheetTitle className="text-gray-900 dark:text-white">Gerenciar Refeições - {selectedMealPlan?.name}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Refeições do Plano</h3>
                <Dialog open={isAddMealDialogOpen} onOpenChange={setIsAddMealDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Refeição
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white">Adicionar Refeição ao Plano</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddMeal} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="meal-food-select" className="dark:text-gray-200">Alimento *</Label>
                        <Select 
                          value={mealFormData.food_id} 
                          onValueChange={(value) => setMealFormData({ ...mealFormData, food_id: value })}
                        >
                          <SelectTrigger className="dark:bg-background/50 dark:border-white/10 dark:text-white">
                            <SelectValue placeholder="Selecione um alimento" />
                          </SelectTrigger>
                          <SelectContent>
                            {foods.map((food) => (
                              <SelectItem key={food.id} value={food.id}>
                                {food.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="meal-day-number" className="dark:text-gray-200">Dia *</Label>
                          <Input
                            id="meal-day-number"
                            type="number"
                            min="1"
                            max="7"
                            value={mealFormData.day_number}
                            onChange={(e) => setMealFormData({ ...mealFormData, day_number: parseInt(e.target.value) })}
                            required
                            className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meal-quantity" className="dark:text-gray-200">Quantidade (g) *</Label>
                          <Input
                            id="meal-quantity"
                            type="number"
                            min="1"
                            max="1000"
                            value={mealFormData.quantity}
                            onChange={(e) => setMealFormData({ ...mealFormData, quantity: parseInt(e.target.value) })}
                            required
                            className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meal-name" className="dark:text-gray-200">Nome da Refeição</Label>
                        <Input
                          id="meal-name"
                          value={mealFormData.meal_name}
                          onChange={(e) => setMealFormData({ ...mealFormData, meal_name: e.target.value })}
                          placeholder="Café da manhã, Almoço, Jantar..."
                          className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="meal-notes" className="dark:text-gray-200">Notas</Label>
                        <Textarea
                          id="meal-notes"
                          value={mealFormData.notes}
                          onChange={(e) => setMealFormData({ ...mealFormData, notes: e.target.value })}
                          placeholder="Instruções especiais..."
                          rows={2}
                          className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddMealDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={!mealFormData.food_id} className="bg-green-600 hover:bg-green-700 text-white">
                          Adicionar Refeição
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Refeições por Dia */}
              {mealPlanItems.length > 0 && (
                <Tabs defaultValue="day-1" className="w-full">
                  <TabsList className="grid w-full grid-cols-7 dark:bg-card/50">
                    {Array.from({ length: 7 }, (_, i) => (
                      <TabsTrigger 
                        key={i + 1} 
                        value={`day-${i + 1}`}
                        className="data-[state=active]:dark:bg-primary/20 data-[state=active]:dark:text-primary"
                      >
                        Dia {i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Array.from({ length: 7 }, (_, i) => {
                    const dayNumber = i + 1
                    const dayMeals = mealsByDay[dayNumber] || []
                    
                    return (
                      <TabsContent key={dayNumber} value={`day-${dayNumber}`} className="mt-6">
                        {dayMeals.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>Nenhuma refeição para este dia</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {dayMeals.map((mealPlanItem, index) => (
                              <Card key={mealPlanItem.id} className="bg-white/50 dark:bg-card/20 border border-gray-200 dark:border-white/5">
                                <CardContent className="p-6">
                                  <div className="flex items-start gap-4">
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-200 rounded-full text-sm font-medium">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {mealPlanItem.meal_name}
                                      </h3>
                                      
                                      <div className="flex items-center gap-2 mb-3">
                                        <Apple className="h-4 w-4 text-green-600" />
                                        <span className="font-medium dark:text-white">{mealPlanItem.food?.name}</span>
                                        <Badge variant="outline" className="dark:border-white/20 dark:text-gray-300">
                                          {mealPlanItem.quantity}g
                                        </Badge>
                                      </div>

                                      {mealPlanItem.food && (
                                        <div className="grid grid-cols-4 gap-2 mb-3 text-sm dark:text-gray-300">
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

                                      {mealPlanItem.notes && (
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            <strong>Nota:</strong> {mealPlanItem.notes}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditMealPlanItem(mealPlanItem)}
                                        className="dark:text-gray-400 dark:hover:text-white"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button size="sm" variant="ghost">
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="dark:text-white">Confirmar Exclusão</AlertDialogTitle>
                                            <AlertDialogDescription className="dark:text-gray-400">
                                              Tem certeza que deseja remover "{mealPlanItem.meal_name}" do plano?
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="dark:border-white/10 dark:text-gray-300">Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteMealPlanItem(mealPlanItem.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                              Remover
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    )
                  })}
                </Tabs>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialog de Edição de Refeição */}
        <Dialog open={isEditMealDialogOpen} onOpenChange={setIsEditMealDialogOpen}>
          <DialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Editar Refeição</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateMealPlanItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-meal-name" className="dark:text-gray-200">Nome da Refeição</Label>
                <Input
                  id="edit-meal-name"
                  value={editMealFormData.meal_name}
                  onChange={(e) => setEditMealFormData({ ...editMealFormData, meal_name: e.target.value })}
                  placeholder="Café da manhã, Almoço, Jantar..."
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-meal-quantity" className="dark:text-gray-200">Quantidade (g)</Label>
                <Input
                  id="edit-meal-quantity"
                  type="number"
                  min="1"
                  max="1000"
                  value={editMealFormData.quantity}
                  onChange={(e) => setEditMealFormData({ ...editMealFormData, quantity: parseInt(e.target.value) })}
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-meal-notes" className="dark:text-gray-200">Notas</Label>
                <Textarea
                  id="edit-meal-notes"
                  value={editMealFormData.notes}
                  onChange={(e) => setEditMealFormData({ ...editMealFormData, notes: e.target.value })}
                  placeholder="Instruções especiais..."
                  rows={2}
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditMealDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Atualizar Refeição
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição de Plano Alimentar */}
        <Dialog open={isEditMealPlanDialogOpen} onOpenChange={setIsEditMealPlanDialogOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-card border-gray-200 dark:border-white/10">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Editar Plano Alimentar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateMealPlan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-meal-plan-name" className="dark:text-gray-200">Nome do Plano *</Label>
                <Input
                  id="edit-meal-plan-name"
                  value={mealPlanFormData.name}
                  onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, name: e.target.value })}
                  placeholder="Plano de Emagrecimento"
                  required
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-meal-plan-objective" className="dark:text-gray-200">Objetivo</Label>
                <Textarea
                  id="edit-meal-plan-objective"
                  value={mealPlanFormData.objective}
                  onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, objective: e.target.value })}
                  placeholder="Emagrecimento, hipertrofia, manutenção..."
                  rows={2}
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-meal-plan-description" className="dark:text-gray-200">Descrição</Label>
                <Textarea
                  id="edit-meal-plan-description"
                  value={mealPlanFormData.description}
                  onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, description: e.target.value })}
                  placeholder="Descrição detalhada do plano..."
                  rows={3}
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-calories-target" className="dark:text-gray-200">Calorias Diárias</Label>
                  <Input
                    id="edit-calories-target"
                    type="number"
                    min="800"
                    max="5000"
                    value={mealPlanFormData.daily_calories_target}
                    onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, daily_calories_target: parseInt(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-protein-target" className="dark:text-gray-200">Proteínas (g)</Label>
                  <Input
                    id="edit-protein-target"
                    type="number"
                    min="20"
                    max="500"
                    value={mealPlanFormData.daily_protein_target}
                    onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, daily_protein_target: parseInt(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-carbs-target" className="dark:text-gray-200">Carboidratos (g)</Label>
                  <Input
                    id="edit-carbs-target"
                    type="number"
                    min="20"
                    max="500"
                    value={mealPlanFormData.daily_carbs_target}
                    onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, daily_carbs_target: parseInt(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fat-target" className="dark:text-gray-200">Gorduras (g)</Label>
                  <Input
                    id="edit-fat-target"
                    type="number"
                    min="10"
                    max="200"
                    value={mealPlanFormData.daily_fat_target}
                    onChange={(e) => setMealPlanFormData({ ...mealPlanFormData, daily_fat_target: parseInt(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditMealPlanDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Atualizar Plano
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default MealPlanner