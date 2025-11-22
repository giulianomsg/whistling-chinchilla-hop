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

const FoodLibrary: React.FC = () => {
  const { user, loading } = useAuth()
  const [foods, setFoods] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ id: '', name: '', brand: '', kcal: 0, prot: 0, carb: 0, fat: 0 })

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { error } = await supabase.from('foods_library').insert({
      name: formData.name, brand: formData.brand,
      calories_per_serving: formData.kcal, protein: formData.prot, carbs: formData.carb, fat: formData.fat,
      serving_size: 100, serving_unit: 'g', created_by: user.id, is_public: false
    })
    if (!error) { showSuccess('Criado!'); setIsCreateDialogOpen(false); fetchFoods() }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('foods_library').update({
      name: formData.name, brand: formData.brand,
      calories_per_serving: formData.kcal, protein: formData.prot, carbs: formData.carb, fat: formData.fat
    }).eq('id', formData.id)
    if (!error) { showSuccess('Atualizado!'); setIsEditDialogOpen(false); fetchFoods() }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('foods_library').delete().eq('id', id)
    if (!error) { showSuccess('Deletado!'); fetchFoods() }
    else showError('Erro ao deletar')
  }

  const openEdit = (food: any) => {
    setFormData({
      id: food.id, name: food.name, brand: food.brand || '',
      kcal: food.calories_per_serving, prot: food.protein, carb: food.carbs, fat: food.fat
    })
    setIsEditDialogOpen(true)
  }

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary"/></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Apple className="text-green-400"/> Alimentos</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild><Button className="bg-green-600 text-white"><Plus className="mr-2 h-4 w-4"/> Novo</Button></DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
              <DialogHeader><DialogTitle>Novo Alimento (por 100g)</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><Label>Nome</Label><Input className="bg-black/20 border-white/10" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/></div>
                <div><Label>Marca</Label><Input className="bg-black/20 border-white/10" value={formData.brand} onChange={e=>setFormData({...formData, brand: e.target.value})}/></div>
                <div className="grid grid-cols-4 gap-2">
                  <div><Label>Kcal</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.kcal} onChange={e=>setFormData({...formData, kcal: +e.target.value})}/></div>
                  <div><Label>Prot</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.prot} onChange={e=>setFormData({...formData, prot: +e.target.value})}/></div>
                  <div><Label>Carb</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.carb} onChange={e=>setFormData({...formData, carb: +e.target.value})}/></div>
                  <div><Label>Gord</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.fat} onChange={e=>setFormData({...formData, fat: +e.target.value})}/></div>
                </div>
                <Button type="submit" className="w-full bg-green-600">Salvar</Button>
              </form>
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
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{food.name} <span className="text-sm text-gray-500 font-normal block">{food.brand}</span></CardTitle>
                  <div className="flex gap-1">
                    {food.created_by === user?.id && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(food)} className="text-gray-400 hover:text-green-400"><Edit className="h-4 w-4"/></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                            <AlertDialogHeader><AlertDialogTitle>Excluir?</AlertDialogTitle><AlertDialogDescription>Irreversível.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel className="text-black">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(food.id)} className="bg-red-600">Excluir</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-1 text-center text-xs">
                  <div className="bg-orange-500/20 p-1 rounded text-orange-300">{food.calories_per_serving}</div>
                  <div className="bg-blue-500/20 p-1 rounded text-blue-300">{food.protein}P</div>
                  <div className="bg-yellow-500/20 p-1 rounded text-yellow-300">{food.carbs}C</div>
                  <div className="bg-red-500/20 p-1 rounded text-red-300">{food.fat}G</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-white">
            <DialogHeader><DialogTitle>Editar Alimento</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div><Label>Nome</Label><Input className="bg-black/20 border-white/10" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/></div>
              <div><Label>Marca</Label><Input className="bg-black/20 border-white/10" value={formData.brand} onChange={e=>setFormData({...formData, brand: e.target.value})}/></div>
              <div className="grid grid-cols-4 gap-2">
                <div><Label>Kcal</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.kcal} onChange={e=>setFormData({...formData, kcal: +e.target.value})}/></div>
                <div><Label>Prot</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.prot} onChange={e=>setFormData({...formData, prot: +e.target.value})}/></div>
                <div><Label>Carb</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.carb} onChange={e=>setFormData({...formData, carb: +e.target.value})}/></div>
                <div><Label>Gord</Label><Input type="number" className="bg-black/20 border-white/10" value={formData.fat} onChange={e=>setFormData({...formData, fat: +e.target.value})}/></div>
              </div>
              <Button type="submit" className="w-full bg-green-600">Atualizar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default FoodLibrary