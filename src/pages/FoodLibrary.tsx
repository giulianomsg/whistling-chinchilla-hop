import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Apple, Plus, Search, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'

const FoodLibrary: React.FC = () => {
  const { user, loading } = useAuth()
  const [foods, setFoods] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const initialFormState = { 
    id: '', name: '', brand: '', category: '',
    serving_size: 100, serving_unit: 'g',
    kcal: 0, prot: 0, carb: 0, fat: 0,
    fiber: 0, sugar: 0, sodium: 0,
    is_public: false
  }
  const [formData, setFormData] = useState(initialFormState)

  // ... fetchFoods igual ...
  const fetchFoods = async () => {
    if (!user) return
    setPageLoading(true)
    try {
      let query = supabase.from('foods_library').select('*').or(`created_by.eq.${user.id},is_public.eq.true`).order('created_at', { ascending: false })
      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`)
      const { data } = await query
      setFoods(data || [])
    } catch { showError('Erro ao carregar') }
    finally { setPageLoading(false) }
  }

  useEffect(() => { if (!loading && user) fetchFoods() }, [user, loading, searchTerm])

  // FUNÇÃO DE RESET CORRIGIDA
  const openCreateDialog = () => {
    setFormData(initialFormState)
    setIsCreateDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent, mode: 'create' | 'update') => {
    e.preventDefault()
    if (!user) return

    const payload = {
      name: formData.name, brand: formData.brand,
      category: formData.category,
      serving_size: formData.serving_size, serving_unit: formData.serving_unit,
      calories_per_serving: formData.kcal, protein: formData.prot, carbs: formData.carb, fat: formData.fat,
      fiber: formData.fiber, sugar: formData.sugar, sodium: formData.sodium,
      is_public: formData.is_public,
      created_by: user.id
    }

    let error
    if (mode === 'create') {
      const res = await supabase.from('foods_library').insert(payload)
      error = res.error
    } else {
      const res = await supabase.from('foods_library').update(payload).eq('id', formData.id)
      error = res.error
    }

    if (!error) { 
      showSuccess(mode === 'create' ? 'Alimento criado!' : 'Atualizado!')
      setIsCreateDialogOpen(false)
      setIsEditDialogOpen(false)
      fetchFoods() 
    } else {
      showError('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('foods_library').delete().eq('id', id)
    if (!error) { showSuccess('Deletado!'); fetchFoods() }
    else showError('Erro ao deletar')
  }

  const openEdit = (food: any) => {
    setFormData({
      id: food.id, name: food.name, brand: food.brand || '', category: food.category || '',
      serving_size: food.serving_size || 100, serving_unit: food.serving_unit || 'g',
      kcal: food.calories_per_serving, prot: food.protein, carb: food.carbs, fat: food.fat,
      fiber: food.fiber || 0, sugar: food.sugar || 0, sodium: food.sodium || 0,
      is_public: food.is_public
    })
    setIsEditDialogOpen(true)
  }

  // ... FoodForm igual ...
  const FoodForm = ({ mode }: { mode: 'create' | 'update' }) => (
    <form onSubmit={(e) => handleSave(e, mode)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Nome *</Label><Input className="bg-black/20 border-white/10" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/></div>
        <div><Label>Marca</Label><Input className="bg-black/20 border-white/10" value={formData.brand} onChange={e=>setFormData({...formData, brand: e.target.value})}/></div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div><Label>Porção</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.serving_size} onChange={e=>setFormData({...formData, serving_size: +e.target.value})}/></div>
        <div><Label>Unidade</Label><Input className="bg-black/20 border-white/10" value={formData.serving_unit} onChange={e=>setFormData({...formData, serving_unit: e.target.value})}/></div>
        <div><Label>Categoria</Label><Input className="bg-black/20 border-white/10" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}/></div>
      </div>

      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
        <Label className="text-green-400 mb-2 block">Macronutrientes</Label>
        <div className="grid grid-cols-4 gap-2">
          <div><Label>Kcal</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.kcal} onChange={e=>setFormData({...formData, kcal: +e.target.value})}/></div>
          <div><Label>Prot</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.prot} onChange={e=>setFormData({...formData, prot: +e.target.value})}/></div>
          <div><Label>Carb</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.carb} onChange={e=>setFormData({...formData, carb: +e.target.value})}/></div>
          <div><Label>Gord</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.fat} onChange={e=>setFormData({...formData, fat: +e.target.value})}/></div>
        </div>
      </div>

      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
        <Label className="text-blue-400 mb-2 block">Micronutrientes (Opcional)</Label>
        <div className="grid grid-cols-3 gap-2">
          <div><Label>Fibras (g)</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.fiber} onChange={e=>setFormData({...formData, fiber: +e.target.value})}/></div>
          <div><Label>Açúcar (g)</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.sugar} onChange={e=>setFormData({...formData, sugar: +e.target.value})}/></div>
          <div><Label>Sódio (mg)</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.sodium} onChange={e=>setFormData({...formData, sodium: +e.target.value})}/></div>
        </div>
      </div>

      <div className="flex items-center space-x-2 py-2">
        <Checkbox id="public" checked={formData.is_public} onCheckedChange={(c) => setFormData({...formData, is_public: c as boolean})} className="border-white/30 data-[state=checked]:bg-green-500" />
        <Label htmlFor="public" className="cursor-pointer">Tornar público</Label>
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold">Salvar Alimento</Button>
    </form>
  )

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary"/></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Apple className="text-green-400"/> Alimentos</h1>
          {/* BOTÃO DE CRIAÇÃO CORRIGIDO */}
          <Button onClick={openCreateDialog} className="bg-green-600 text-white hover:bg-green-500">
            <Plus className="mr-2 h-4 w-4"/> Novo
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
              <DialogHeader><DialogTitle>Novo Alimento</DialogTitle></DialogHeader>
              <FoodForm mode="create" />
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {foods.map(food => (
            <Card key={food.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">{food.name}</CardTitle>
                    <p className="text-sm text-gray-400">{food.brand} • {food.serving_size}{food.serving_unit}</p>
                  </div>
                  <div className="flex gap-1">
                    {food.created_by === user?.id && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(food)} className="text-gray-400 hover:text-green-400 h-8 w-8"><Edit className="h-4 w-4"/></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400 h-8 w-8"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                            <AlertDialogHeader><AlertDialogTitle>Excluir?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel className="text-black">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(food.id)} className="bg-red-600">Excluir</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-1 text-center text-xs mb-2">
                  <div className="bg-orange-500/20 p-1 rounded text-orange-300 font-bold">{food.calories_per_serving}</div>
                  <div className="bg-blue-500/20 p-1 rounded text-blue-300">{food.protein}P</div>
                  <div className="bg-yellow-500/20 p-1 rounded text-yellow-300">{food.carbs}C</div>
                  <div className="bg-red-500/20 p-1 rounded text-red-300">{food.fat}G</div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 border-t border-white/5 pt-2">
                  <span>Fib: {food.fiber || 0}g • Açú: {food.sugar || 0}g • Sód: {food.sodium || 0}mg</span>
                  {food.is_public && <Eye className="h-3 w-3 text-green-500" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
            <DialogHeader><DialogTitle>Editar Alimento</DialogTitle></DialogHeader>
            <FoodForm mode="update" />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default FoodLibrary