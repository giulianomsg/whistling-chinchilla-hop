import React, { useState, useEffect } from 'react'
import { Search, Loader2, Database, Info, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'

interface UnifiedFoodSearchProps {
    onSelect: (food: any) => void
    trigger?: React.ReactNode
}

export function UnifiedFoodSearch({ onSelect, trigger }: UnifiedFoodSearchProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [importingId, setImportingId] = useState<string | null>(null)

    const handleSearch = async (val: string) => {
        if (!val.trim()) {
            setResults([])
            return
        }
        setLoading(true)
        try {
            // Search in the Unified View
            const { data, error } = await supabase
                .from('unified_foods_view')
                .select('*')
                .ilike('name', `%${val}%`)
                .limit(50)

            if (error) throw error
            setResults(data || [])
        } catch (err) {
            console.error(err)
            showError('Erro ao buscar alimentos')
        } finally {
            setLoading(false)
        }
    }

    // Debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query) handleSearch(query)
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [query])

    const handleSelect = async (food: any) => {
        // If it's a Custom food (already has UUID and presumably in foods_library)
        if (food.origin === 'custom') {
            onSelect(food) // It's a valid usable food
            setOpen(false)
            return
        }

        // If it's a TACO food (id starts with 'taco_'), we need to "materialize" it into foods_library
        // to get a UUID for relational integrity (meal_plan_items -> foods_library)
        if (food.origin === 'taco') {
            const tacoId = food.id.replace('taco_', '')
            if (importingId) return
            setImportingId(food.id)

            try {
                // We use the existing import-food function which handles TACO Import logic
                // It expects 'fatsecret_id' but logic inside maps it to taco.json id if needed.
                const { data, error } = await supabase.functions.invoke('import-food', {
                    body: { fatsecret_id: tacoId }
                })

                if (error) throw error

                // Fetch the newly created food from foods_library to pass full object
                const { data: newFood, error: fetchError } = await supabase
                    .from('foods_library')
                    .select('*')
                    .eq('id', data.id)
                    .single()

                if (fetchError) throw fetchError

                onSelect(newFood)
                setOpen(false)
                showSuccess('Alimento adicionado à biblioteca')

            } catch (err) {
                console.error(err)
                showError('Erro ao importar alimento da TACO')
            } finally {
                setImportingId(null)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Adicionar Alimento</Button>}
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground w-[90%] max-w-md">
                <DialogHeader>
                    <DialogTitle>Buscar Alimento</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Nome do alimento..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="bg-muted border-border"
                        autoFocus
                    />

                    <ScrollArea className="h-[300px] border rounded-md p-2 bg-muted/20">
                        {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
                        {!loading && results.length === 0 && query && <div className="text-center text-muted-foreground p-4">Nenhum resultado</div>}

                        <div className="space-y-2">
                            {results.map((food) => (
                                <div
                                    key={food.id}
                                    onClick={() => handleSelect(food)}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium flex items-center gap-2">
                                            {food.name}
                                            {food.origin === 'taco' && <Badge variant="secondary" className="text-[10px] h-5">TACO</Badge>}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                                            <span className="text-green-500">{food.calories} kcal</span>
                                            <span>P: {food.protein}g</span>
                                            <span>C: {food.carbs}g</span>
                                            <span>G: {food.fats}g</span>
                                            <span className="text-muted-foreground/50">Por {food.serving_base}g</span>
                                        </div>
                                    </div>
                                    {importingId === food.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    ) : (
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
