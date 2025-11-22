import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Apple, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  Search,
  Filter
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'

interface Food {
  id: string
  name: string
  brand: string | null
  category: string | null
  serving_size: number
  serving_unit: string
  calories_per_serving: number
  protein: number
  carbs: number
  fat: number
  created_by: string
  is_public: boolean
  created_at: string
  updated_at: string
}

const FoodLibrary: React.FC = () => {
  const { user, profile, loading } = useAuth()
  const [foods, setFoods] = useState<Food[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  
  // Estados para busca e filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    serving_size: 100,
    serving_unit: 'g',
    calories_per_serving: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    is_public: false
  })

  // Categorias para filtro
  const categories = [
    'Proteínas',
    'Carboidratos',
    'Gorduras',
    'Vegetais',
    'Frutas',
    'Laticínios',
    'Suplementos',
    'Bebidas',
    'Outros'
  ]

  // Buscar alimentos
  const fetchFoods = async () => {
    if (!user) return

    try {
      setPageLoading(true)
      let query = supabase
        .from('foods_library')
        .select('*')
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar alimentos:', error)
        showError('Erro ao carregar alimentos')
        return
      }

      setFoods(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao carregar alimentos')
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchFoods()
    }
  }, [user?.id, loading, searchTerm, categoryFilter])

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      serving_size: 100,
      serving_unit: 'g',
      calories_per_serving: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      is_public: false
    })
  }

  // Criar alimento
  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const foodData = {
        name: formData.name,
        brand: formData.brand || null,
        category: formData.category || null,
        serving_size: formData.serving_size,
        serving_unit: formData.serving_unit,
        calories_per_serving: formData.calories_per_serving,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        created_by: user.id,
        is_public: formData.is_public
      }

      const { error } = await supabase
        .from('foods_library')
        .insert(foodData)

      if (error) {
        console.error('Erro ao criar alimento:', error)
        showError('Erro ao criar alimento')
        return
      }

      showSuccess('Alimento criado com sucesso!')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchFoods()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao criar alimento')
    }
  }

  // Editar alimento
  const handleEditFood = (food: Food) => {
    setEditingFood(food)
    setFormData({
      name: food.name,
      brand: food.brand || '',
      category: food.category || '',
      serving_size: food.serving_size,
      serving_unit: food.serving_unit,
      calories_per_serving: food.calories_per_serving,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      is_public: food.is_public
    })
    setIsEditSheetOpen(true)
  }

  // Atualizar alimento
  const handleUpdateFood = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingFood) return

    try {
      const foodData = {
        name: formData.name,
        brand: formData.brand || null,
        category: formData.category || null,
        serving_size: formData.serving_size,
        serving_unit: formData.serving_unit,
        calories_per_serving: formData.calories_per_serving,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        is_public: formData.is_public
      }

      const { error } = await supabase
        .from('foods_library')
        .update(foodData)
        .eq('id', editingFood.id)

      if (error) {
        console.error('Erro ao atualizar alimento:', error)
        showError('Erro ao atualizar alimento')
        return
      }

      showSuccess('Alimento atualizado com sucesso!')
      setIsEditSheetOpen(false)
      setEditingFood(null)
      resetForm()
      fetchFoods()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao atualizar alimento')
    }
  }

  // Deletar alimento
  const handleDeleteFood = async (foodId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('foods_library')
        .delete()
        .eq('id', foodId)

      if (error) {
        console.error('Erro ao deletar alimento:', error)
        showError('Erro ao deletar alimento')
        return
      }

      showSuccess('Alimento deletado com sucesso!')
      fetchFoods()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao deletar alimento')
    }
  }

  // Verificar se usuário pode editar/deletar
  const canEditFood = (food: Food) => {
    return food.created_by === user?.id
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Apple className="h-8 w-8 text-green-600 dark:text-green-400" />
                Biblioteca de Alimentos
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Gerencie sua biblioteca pessoal de alimentos
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Alimento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-card border-gray-200 dark:border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Criar Novo Alimento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFood} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="dark:text-gray-200">Nome do Alimento *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Peito de Frango"
                        required
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="dark:text-gray-200">Marca</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Sadia"
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="dark:text-gray-200">Categoria</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 border rounded-md dark:bg-background/50 dark:border-white/10 dark:text-white"
                      >
                        <option value="">Selecione...</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="serving_size" className="dark:text-gray-200">Porção</Label>
                          <Input
                            id="serving_size"
                            type="number"
                            value={formData.serving_size}
                            onChange={(e) => setFormData({ ...formData, serving_size: parseFloat(e.target.value) })}
                            className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="serving_unit" className="dark:text-gray-200">Unidade</Label>
                          <select
                            id="serving_unit"
                            value={formData.serving_unit}
                            onChange={(e) => setFormData({ ...formData, serving_unit: e.target.value })}
                            className="w-full p-2 border rounded-md dark:bg-background/50 dark:border-white/10 dark:text-white h-10"
                          >
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="un">un</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calories" className="dark:text-gray-200">Kcal</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={formData.calories_per_serving}
                        onChange={(e) => setFormData({ ...formData, calories_per_serving: parseFloat(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protein" className="dark:text-gray-200">Prot (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carbs" className="dark:text-gray-200">Carb (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fat" className="dark:text-gray-200">Gord (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="public"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
                      className="dark:border-white/30"
                    />
                    <Label htmlFor="public" className="dark:text-gray-200">Tornar este alimento público</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                      Criar Alimento
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
                placeholder="Buscar alimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Alimentos */}
        {pageLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <Card key={food.id} className="relative bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{food.name}</CardTitle>
                      {food.brand && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{food.brand}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {food.is_public ? (
                        <Eye className="h-4 w-4 text-green-600 dark:text-green-400" title="Público" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" title="Privado" />
                      )}
                      {canEditFood(food) && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditFood(food)}
                            className="dark:text-gray-400 dark:hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="dark:text-gray-400 dark:hover:text-white">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-white">Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-gray-400">
                                  Tem certeza que deseja deletar o alimento "{food.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:border-white/10 dark:text-gray-300">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteFood(food.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-center mb-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <p className="text-xs text-orange-600 font-bold">{food.calories_per_serving}</p>
                      <p className="text-[10px] text-orange-500">Kcal</p>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-xs text-blue-600 font-bold">{food.protein}g</p>
                      <p className="text-[10px] text-blue-500">Prot</p>
                    </div>
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <p className="text-xs text-yellow-600 font-bold">{food.carbs}g</p>
                      <p className="text-[10px] text-yellow-500">Carb</p>
                    </div>
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <p className="text-xs text-red-600 font-bold">{food.fat}g</p>
                      <p className="text-[10px] text-red-500">Gord</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/10 pt-3">
                    <span>Porção: {food.serving_size}{food.serving_unit}</span>
                    <span>{food.category || 'Sem categoria'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {foods.length === 0 && !pageLoading && (
          <div className="text-center py-12">
            <Apple className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum alimento encontrado</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Comece criando seu primeiro alimento personalizado.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Alimento
            </Button>
          </div>
        )}

        {/* Sheet de Edição */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent className="w-[400px] sm:w-[540px] bg-white dark:bg-card border-l border-gray-200 dark:border-white/10">
            <SheetHeader>
              <SheetTitle className="text-gray-900 dark:text-white">Editar Alimento</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleUpdateFood} className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="dark:text-gray-200">Nome do Alimento *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Peito de Frango"
                    required
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-brand" className="dark:text-gray-200">Marca</Label>
                  <Input
                    id="edit-brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Sadia"
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category" className="dark:text-gray-200">Categoria</Label>
                  <select
                    id="edit-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border rounded-md dark:bg-background/50 dark:border-white/10 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="edit-serving_size" className="dark:text-gray-200">Porção</Label>
                      <Input
                        id="edit-serving_size"
                        type="number"
                        value={formData.serving_size}
                        onChange={(e) => setFormData({ ...formData, serving_size: parseFloat(e.target.value) })}
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-serving_unit" className="dark:text-gray-200">Unidade</Label>
                      <select
                        id="edit-serving_unit"
                        value={formData.serving_unit}
                        onChange={(e) => setFormData({ ...formData, serving_unit: e.target.value })}
                        className="w-full p-2 border rounded-md dark:bg-background/50 dark:border-white/10 dark:text-white h-10"
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="un">un</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-calories" className="dark:text-gray-200">Kcal</Label>
                  <Input
                    id="edit-calories"
                    type="number"
                    value={formData.calories_per_serving}
                    onChange={(e) => setFormData({ ...formData, calories_per_serving: parseFloat(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-protein" className="dark:text-gray-200">Prot (g)</Label>
                  <Input
                    id="edit-protein"
                    type="number"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-carbs" className="dark:text-gray-200">Carb (g)</Label>
                  <Input
                    id="edit-carbs"
                    type="number"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fat" className="dark:text-gray-200">Gord (g)</Label>
                  <Input
                    id="edit-fat"
                    type="number"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) })}
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
                  className="dark:border-white/30"
                />
                <Label htmlFor="edit-public" className="dark:text-gray-200">Tornar este alimento público</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditSheetOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Atualizar Alimento
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default FoodLibrary