import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Search, Edit2, Trash2, Plus, AlertCircle } from 'lucide-react'
import { FoodSearch } from './FoodSearch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { showSuccess, showError } from '@/utils/toast'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MyFoodsTab() {
    const { user } = useAuth()
    const [foods, setFoods] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [editingFood, setEditingFood] = useState<any>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    // Load foods
    const loadFoods = async () => {
        setLoading(true)
        // Fetch system foods and user created foods
        // Using a simple OR query is tricky in Supabase JS basic client sometimes if logic is complex, 
        // but here: created_by = user.id OR is_public = true

        // We will just fetch user foods for "Meus Alimentos" logic explicitly, 
        // or maybe everything the user can see?
        // "filtra foods_library onde created_by == auth.uid() OU onde o usuário marcou como favorito"
        // Let's stick to created_by first as favorites table wasn't implemented/requested in detail yet.

        const { data, error } = await supabase
            .from('foods_library')
            .select('*')
            .or(`created_by.eq.${user?.id},is_public.eq.true`) // Show public/system foods too? Prompt says "created_by == auth.id OR favorite". 
            // I'll assume they want to manage THEIR foods. 
            // But wait, "Permita que o usuário edite alimentos importados (ex: ajustar a marca), mas salve como uma cópia"
            // This implies they can see imported foods.
            .order('name')

        if (!error) {
            // Client side filter for search
            setFoods(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        if (user) loadFoods()
    }, [user])

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingFood) return

        const isSystemFood = editingFood.is_public && editingFood.created_by !== user?.id

        if (isSystemFood) {
            // Create Copy
            const { id, created_at, ...foodData } = editingFood
            const newFood = {
                ...foodData,
                name: `${editingFood.name} (Editado)`,
                created_by: user?.id,
                is_public: false,
                source_type: 'manual', // customized
                external_fatsecret_id: null // detached
            }

            const { error } = await supabase.from('foods_library').insert(newFood)
            if (!error) {
                showSuccess('Cópia criada com sucesso!')
                setIsEditDialogOpen(false)
                loadFoods()
            } else {
                showError('Erro ao criar cópia')
            }
        } else {
            // Update existing
            const { error } = await supabase
                .from('foods_library')
                .update({
                    name: editingFood.name,
                    calories_per_serving: editingFood.calories_per_serving,
                    protein: editingFood.protein,
                    carbs: editingFood.carbs,
                    fat: editingFood.fat,
                    serving_size: editingFood.serving_size,
                    serving_unit: editingFood.serving_unit
                })
                .eq('id', editingFood.id)

            if (!error) {
                showSuccess('Alimento atualizado!')
                setIsEditDialogOpen(false)
                loadFoods()
            } else {
                showError('Erro ao atualizar')
            }
        }
    }

    const handleDelete = async (id: string) => {
        // Only delete if created_by user
        const { error } = await supabase.from('foods_library').delete().eq('id', id).eq('created_by', user?.id)
        if (!error) {
            showSuccess('Alimento removido')
            loadFoods()
        } else {
            showError('Não é possível remover este alimento')
        }
    }

    const filteredFoods = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filtrar meus alimentos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 bg-muted border-border"
                    />
                </div>
                <FoodSearch
                    onSelect={(food) => {
                        showSuccess(`Selecionado: ${food.name}`)
                        loadFoods() // Reload to show if it was imported
                    }}
                    trigger={<Button className="bg-green-600 hover:bg-green-500 text-white"><Plus className="mr-2 h-4 w-4" /> Importar/Novo</Button>}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <Loader2 className="animate-spin text-primary mx-auto col-span-full" /> : filteredFoods.map(food => (
                    <Card key={food.id} className="bg-card border-border hover:bg-accent/50 transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base text-foreground truncate" title={food.name}>{food.name}</CardTitle>
                                {food.created_by === user?.id ? (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingFood(food); setIsEditDialogOpen(true) }} className="h-6 w-6 text-blue-400 hover:text-blue-300"><Edit2 className="h-3 w-3" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(food.id)} className="h-6 w-6 text-red-400 hover:text-red-300"><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                ) : (
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingFood(food); setIsEditDialogOpen(true) }} className="h-6 w-6 text-yellow-400 hover:text-yellow-300" title="Personalizar Cópia"><Edit2 className="h-3 w-3" /></Button>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {food.source_type === 'fatsecret_api' ? 'Importado (FatSecret)' : food.is_public ? 'Sistema' : 'Manual'}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-2 text-center text-xs text-gray-400 bg-black/20 p-2 rounded">
                                <div><div className="font-bold text-white">{food.calories_per_serving}</div>Kcal</div>
                                <div><div className="font-bold text-white">{food.protein}g</div>P</div>
                                <div><div className="font-bold text-white">{food.carbs}g</div>C</div>
                                <div><div className="font-bold text-white">{food.fat}g</div>G</div>
                            </div>
                            <div className="mt-2 text-xs text-center text-muted-foreground">Porção: {food.serving_size}{food.serving_unit || 'g'}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-card border-border text-foreground">
                    <DialogHeader>
                        <DialogTitle>{editingFood?.created_by === user?.id ? 'Editar Alimento' : 'Personalizar Alimento (Criar Cópia)'}</DialogTitle>
                    </DialogHeader>

                    {editingFood?.created_by !== user?.id && (
                        <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-500">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Atenção</AlertTitle>
                            <AlertDescription>Você está editando um item do sistema. Uma cópia pessoal será criada.</AlertDescription>
                        </Alert>
                    )}

                    {editingFood && (
                        <form onSubmit={handleEditSave} className="space-y-4 py-4">
                            <div>
                                <Label>Nome</Label>
                                <Input value={editingFood.name} onChange={e => setEditingFood({ ...editingFood, name: e.target.value })} className="bg-muted border-border" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Porção ({editingFood.serving_unit})</Label><Input type="number" value={editingFood.serving_size} onChange={e => setEditingFood({ ...editingFood, serving_size: e.target.value })} className="bg-muted border-border" /></div>
                                <div><Label>Kcal</Label><Input type="number" value={editingFood.calories_per_serving} onChange={e => setEditingFood({ ...editingFood, calories_per_serving: e.target.value })} className="bg-muted border-border" /></div>
                                <div><Label>Proteína</Label><Input type="number" value={editingFood.protein} onChange={e => setEditingFood({ ...editingFood, protein: e.target.value })} className="bg-muted border-border" /></div>
                                <div><Label>Carbo</Label><Input type="number" value={editingFood.carbs} onChange={e => setEditingFood({ ...editingFood, carbs: e.target.value })} className="bg-muted border-border" /></div>
                                <div><Label>Gordura</Label><Input type="number" value={editingFood.fat} onChange={e => setEditingFood({ ...editingFood, fat: e.target.value })} className="bg-muted border-border" /></div>
                            </div>
                            <Button type="submit" className="w-full bg-primary text-primary-foreground">Salvar</Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
