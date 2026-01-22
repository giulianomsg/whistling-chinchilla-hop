```
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { sanitizeAlpha, sanitizeFloatInput, sanitizeNumeric } from '@/utils/masks'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useFeedback } from '@/components/ui/CapiFitFeedback'
import { Apple, Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'

const FoodLibrary: React.FC = () => {
  const { user, loading } = useAuth()
  const { confirm } = useFeedback()
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

  const fetchFoods = async () => {
    if (!user) return
    setPageLoading(true)
    try {
      const filterString = 'created_by.eq.' + user.id + ',is_public.eq.true'
      let query = supabase.from('foods_library').select('*').or(filterString).order('created_at', { ascending: false })
      if (searchTerm) query = query.ilike('name', '%' + searchTerm + '%')
      const { data } = await query
      setFoods(data || [])
    } catch { showError('Erro ao carregar') }
    finally { setPageLoading(false) }
  }

  useEffect(() => { if (!loading && user) fetchFoods() }, [user, loading, searchTerm])

  // Resetar antes de abrir
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
      showSuccess(mode === 'create' ? 'Criado!' : 'Atualizado!')
      setIsCreateDialogOpen(false)
      setIsEditDialogOpen(false)
      fetchFoods()
    } else {
      showError('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!await confirm({ title: "Excluir Alimento?", description: "Esta ação é irreversível.", variant: "destructive", confirmText: "Excluir", cancelText: "Cancelar" })) return

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

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><Apple className="text-green-600 dark:text-green-400" /> Alimentos</h1>
          <Button onClick={openCreateDialog} className="bg-green-600 text-white hover:bg-green-500"><Plus className="mr-2 h-4 w-4" /> Novo</Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-card border-border text-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {foods.map(food => (
            <Card key={food.id} className="bg-card border-border hover:bg-accent/50 transition-all group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div><CardTitle className="text-foreground text-lg">{food.name}</CardTitle><p className="text-sm text-muted-foreground">{food.brand}</p></div>
                  <div className="flex gap-1">
                    {food.created_by === user?.id && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(food)} className="text-muted-foreground hover:text-green-500 h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(food.id)} className="text-muted-foreground hover:text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-1 text-center text-xs mb-2">
                  <div className="bg-orange-500/20 p-1 rounded text-orange-700 dark:text-orange-300 font-bold">{food.calories_per_serving}</div>
                  <div className="bg-blue-500/20 p-1 rounded text-blue-700 dark:text-blue-300">{food.protein}P</div>
                  <div className="bg-yellow-500/20 p-1 rounded text-yellow-700 dark:text-yellow-300">{food.carbs}C</div>
                  <div className="bg-red-500/20 p-1 rounded text-red-700 dark:text-red-300">{food.fat}G</div>
                </div>
                {food.is_public && <div className="text-right"><Eye className="h-3 w-3 text-green-500 inline" /></div>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DIALOGS COM FORM INLINE PARA EVITAR PERDA DE FOCO */}
        {[
          { open: isCreateDialogOpen, change: setIsCreateDialogOpen, title: 'Novo Alimento', mode: 'create' as const },
          { open: isEditDialogOpen, change: setIsEditDialogOpen, title: 'Editar Alimento', mode: 'update' as const }
        ].map((d, i) => (
          <Dialog key={i} open={d.open} onOpenChange={d.change}>
            <DialogContent className="bg-card border-border text-foreground max-w-lg">
              <DialogHeader><DialogTitle>{d.title}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => handleSave(e, d.mode)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Nome *</Label><Input className="bg-muted border-border" required value={formData.name} onChange={e => setFormData({ ...formData, name: sanitizeAlpha(e.target.value) })} /></div>
                  <div><Label>Marca</Label><Input className="bg-muted border-border" value={formData.brand} onChange={e => setFormData({ ...formData, brand: sanitizeAlpha(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>Porção</Label><Input type="text" inputMode="decimal" className="bg-muted border-border" value={formData.serving_size} onChange={e => setFormData({ ...formData, serving_size: sanitizeFloatInput(e.target.value) })} /></div>
                  <div><Label>Unidade</Label><Input className="bg-muted border-border" value={formData.serving_unit} onChange={e => setFormData({ ...formData, serving_unit: sanitizeAlpha(e.target.value) })} /></div>
                  <div><Label>Categoria</Label><Input className="bg-muted border-border" value={formData.category} onChange={e => setFormData({ ...formData, category: sanitizeAlpha(e.target.value) })} /></div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <Label className="text-green-600 dark:text-green-400 mb-2 block">Macronutrientes</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <div><Label>Kcal</Label><Input type="text" inputMode="decimal" className="bg-muted border-border" value={formData.kcal} onChange={e => setFormData({ ...formData, kcal: sanitizeFloatInput(e.target.value) })} /></div>
                    <div><Label>Prot</Label><Input type="text" inputMode="decimal" className="bg-muted border-border" value={formData.prot} onChange={e => setFormData({ ...formData, prot: sanitizeFloatInput(e.target.value) })} /></div>
                    <div><Label>Carb</Label><Input type="text" inputMode="decimal" className="bg-muted border-border" value={formData.carb} onChange={e => setFormData({ ...formData, carb: sanitizeFloatInput(e.target.value) })} /></div>
                    <div><Label>Gord</Label><Input type="text" inputMode="decimal" className="bg-muted border-border" value={formData.fat} onChange={e => setFormData({ ...formData, fat: sanitizeFloatInput(e.target.value) })} /></div>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <Label className="text-blue-600 dark:text-blue-400 mb-2 block">Micronutrientes</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div><Label>Fibras</Label><Input type="text" inputMode="decimal" className="bg-muted border-border" value={formData.fiber} onChange={e => setFormData({ ...formData, fiber: sanitizeFloatInput(e.target.value) })} /></div>
                    <div><Label>Açúcar</Label><Input type="text" inputMode="decimal" className="bg-muted border-border" value={formData.sugar} onChange={e => setFormData({ ...formData, sugar: sanitizeFloatInput(e.target.value) })} /></div>
                    <div><Label>Sódio</Label><Input type="text" inputMode="decimal" className="bg-muted border-border" value={formData.sodium} onChange={e => setFormData({ ...formData, sodium: sanitizeFloatInput(e.target.value) })} /></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id={`public - ${ d.mode } `} checked={formData.is_public} onCheckedChange={(c) => setFormData({ ...formData, is_public: c as boolean })} className="border-muted-foreground data-[state=checked]:bg-green-600" />
                  <Label htmlFor={`public - ${ d.mode } `} className="cursor-pointer">Público</Label>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}

export default FoodLibrary