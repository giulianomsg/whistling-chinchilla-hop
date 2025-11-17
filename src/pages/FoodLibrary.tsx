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
import { 
  Apple, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  Search,
  Filter,
  Utensils
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'

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
  fiber: number | null
  sugar: number | null
  sodium: number | null
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    serving_size: 100,
    calories_per_serving: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    is_public: false
  })

  // Categorias comuns
  const categories = [
    'Frutas',
    'Vegetais',
    'Carnes',
    'Peixes',
    'Laticínios',
    'Grãos',
    'Leguminosas',
    'Nozes e Sementes',
    'Óleos e Gorduras',
    'Bebidas',
    'Doces',
    'Processados',
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

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
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
  }, [user?.id, loading, searchTerm, selectedCategory])

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      serving_size: 100,
      calories_per_serving: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
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
        calories_per_serving: formData.calories_per_serving,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        fiber: formData.fiber || null,
        sugar: formData.sugar || null,
        sodium: formData.sodium || null,
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
      calories_per_serving: food.calories_per_serving,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0,
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
        calories_per_serving: formData.calories_per_serving,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        fiber: formData.fiber || null,
        sugar: formData.sugar || null,
        sodium: formData.sodium || null,
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

  // Calcular macros por 100g
  const getMacrosPer100g = (food: Food) => {
    const factor = 100 / food.serving_size
    return {
      calories: Math.round(food.calories_per_serving * factor),
      protein: Math.round(food.protein * factor * 10) / 10,
      carbs: Math.round(food.carbs * factor * 10) / 10,
      fat: Math.round(food.fat * factor * 10) / 10
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Apple className="h-8 w-8 text-green-600" />
                Biblioteca de Alimentos
              </h1>
              <p className="mt-2 text-gray-600">
                Gerencie sua biblioteca pessoal de alimentos e informações nutricionais
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Alimento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Alimento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFood} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Alimento *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Arroz Branco"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Tio João"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serving_size">Porção (gramas) *</Label>
                      <Input
                        id="serving_size"
                        type="number"
                        min="1"
                        value={formData.serving_size}
                        onChange={(e) => setFormData({ ...formData, serving_size: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calories">Calorias *</Label>
                      <Input
                        id="calories"
                        type="number"
                        min="0"
                        value={formData.calories_per_serving}
                        onChange={(e) => setFormData({ ...formData, calories_per_serving: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protein">Proteínas (g) *</Label>
                      <Input
                        id="protein"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="carbs">Carboidratos (g) *</Label>
                      <Input
                        id="carbs"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fat">Gorduras (g) *</Label>
                      <Input
                        id="fat"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fiber">Fibras (g)</Label>
                      <Input
                        id="fiber"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.fiber}
                        onChange={(e) => setFormData({ ...formData, fiber: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sugar">Açúcares (g)</Label>
                      <Input
                        id="sugar"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.sugar}
                        onChange={(e) => setFormData({ ...formData, sugar: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sodium">Sódio (mg)</Label>
                      <Input
                        id="sodium"
                        type="number"
                        min="0"
                        value={formData.sodium}
                        onChange={(e) => setFormData({ ...formData, sodium: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="public"
                      checked={formData.is_public}
                      onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    />
                    <Label htmlFor="public">Tornar este alimento público</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
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
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Alimentos */}
        {pageLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => {
              const macros100g = getMacrosPer100g(food)
              return (
                <Card key={food.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{food.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {food.is_public ? (
                          <Eye className="h-4 w-4 text-green-600" title="Público" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" title="Privado" />
                        )}
                        {canEditFood(food) && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditFood(food)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja deletar o alimento "{food.name}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteFood(food.id)}>
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
                    {food.brand && (
                      <p className="text-sm text-gray-600 mb-2">Marca: {food.brand}</p>
                    )}
                    
                    {food.category && (
                      <div className="mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {food.category}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Porção:</span> {food.serving_size}g
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Cal:</span> {food.calories_per_serving}
                        </div>
                        <div>
                          <span className="font-medium">Prot:</span> {food.protein}g
                        </div>
                        <div>
                          <span className="font-medium">Carb:</span> {food.carbs}g
                        </div>
                        <div>
                          <span className="font-medium">Gord:</span> {food.fat}g
                        </div>
                      </div>

                      <div className="pt-2 border-t text-xs text-gray-500">
                        <span className="font-medium">Por 100g:</span> {macros100g.calories} cal | 
                        P: {macros100g.protein}g | C: {macros100g.carbs}g | G: {macros100g.fat}g
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-400">
                        {canEditFood(food) ? 'Seu alimento' : 'Alimento público'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Sheet de Edição */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Editar Alimento</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleUpdateFood} className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Alimento *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Arroz Branco"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-brand">Marca</Label>
                  <Input
                    id="edit-brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Tio João"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-serving_size">Porção (gramas) *</Label>
                  <Input
                    id="edit-serving_size"
                    type="number"
                    min="1"
                    value={formData.serving_size}
                    onChange={(e) => setFormData({ ...formData, serving_size: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-calories">Calorias *</Label>
                  <Input
                    id="edit-calories"
                    type="number"
                    min="0"
                    value={formData.calories_per_serving}
                    onChange={(e) => setFormData({ ...formData, calories_per_serving: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-protein">Proteínas (g) *</Label>
                  <Input
                    id="edit-protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-carbs">Carboidratos (g) *</Label>
                  <Input
                    id="edit-carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fat">Gorduras (g) *</Label>
                  <Input
                    id="edit-fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-fiber">Fibras (g)</Label>
                  <Input
                    id="edit-fiber"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sugar">Açúcares (g)</Label>
                  <Input
                    id="edit-sugar"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.sugar}
                    onChange={(e) => setFormData({ ...formData, sugar: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sodium">Sódio (mg)</Label>
                  <Input
                    id="edit-sodium"
                    type="number"
                    min="0"
                    value={formData.sodium}
                    onChange={(e) => setFormData({ ...formData, sodium: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                />
                <Label htmlFor="edit-public">Tornar este alimento público</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditSheetOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Atualizar Alimento
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        {foods.length === 0 && !pageLoading && (
          <div className="text-center py-12">
            <Apple className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alimento encontrado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro alimento personalizado.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Alimento
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodLibrary