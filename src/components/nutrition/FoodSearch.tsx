import { useState, useCallback } from 'react'
import { Search, Loader2, Cloud, Database, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'
import { debounce } from 'lodash' // You might need to install lodash or write a simple debounce

// Simple debounce implementation if lodash is not available or to reduce deps
function useDebounce(effect: Function, delay: number) {
    const callback = useCallback(effect, [effect, delay]) // simplified
    // Actually, let's just do manual debounce in the component for simplicity
}

interface FoodSearchProps {
    onSelect: (food: any) => void
    trigger?: React.ReactNode
}

export function FoodSearch({ onSelect, trigger }: FoodSearchProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [importingId, setImportingId] = useState<string | null>(null)

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }
        setLoading(true)
        try {
            const { data, error } = await supabase.functions.invoke('search-foods', {
                body: { query: searchQuery }
            })
            if (error) throw error
            setResults(data.foods || [])
        } catch (err) {
            console.error(err)
            showError('Erro ao buscar alimentos')
        } finally {
            setLoading(false)
        }
    }

    // Debounced search
    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setQuery(val)

        // Simple debounce timeout
        const timeoutId = setTimeout(() => handleSearch(val), 600)
        return () => clearTimeout(timeoutId)
    }

    const handleSelect = async (food: any) => {
        // If it's already local/saved, just select it
        if (food.saved || food.source === 'local') {
            onSelect(food)
            setOpen(false)
            return
        }

        // Checking if we are already importing this specific item
        if (importingId) return

        // If it's from cloud, import it first
        setImportingId(food.external_fatsecret_id)
        try {
            const { data, error } = await supabase.functions.invoke('import-food', {
                body: { fatsecret_id: food.external_fatsecret_id }
            })

            if (error) throw error

            // Now fetch the full local object to return
            const { data: fullFood } = await supabase
                .from('foods_library')
                .select('*')
                .eq('id', data.id)
                .single()

            if (fullFood) {
                showSuccess('Alimento importado com sucesso')
                onSelect(fullFood)
                setOpen(false)
            }
        } catch (err) {
            console.error(err)
            showError('Erro ao importar alimento')
        } finally {
            setImportingId(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Buscar Alimento</Button>}
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground w-[90%] max-w-md">
                <DialogHeader>
                    <DialogTitle>Buscar Alimento</DialogTitle>
                    <DialogDescription>
                        Busque alimentos da nossa base de dados ou da nuvem.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={async () => {
                            try {
                                try {
                                    const { data } = await supabase.functions.invoke('search-foods', { body: { debug: true, query: 'test' } })
                                    console.log('DEBUG RESULT:', data)
                                    if (data.status === 200) showSuccess('Conexão Proxy OK!')
                                    else showError(`Erro Proxy: ${JSON.stringify(data)}`)
                                } catch (e) { console.error(e); showError('Erro ao testar conexão') }
                            }} className="text-xs h-6 text-muted-foreground">Testar Conexão API</Button>
                    </div>
                    <Input
                        placeholder="Digite o nome do alimento..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            // quick and dirty debounce approach doesn't work well inside render loop 
                            // without ref or proper hook Use a dedicated definition outside:
                        }}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter') handleSearch(query)
                        }}
                        className="bg-muted border-border"
                    />
                    <Button onClick={() => handleSearch(query)} className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Pesquisar'}
                    </Button>

                    <ScrollArea className="h-[300px] border rounded-md p-2 bg-muted/20">
                        {results.length === 0 && !loading && <div className="text-center text-muted-foreground py-8">Nenhum resultado</div>}

                        <div className="space-y-2">
                            {results.map((food, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelect(food)}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium flex items-center gap-2">
                                            {food.name}
                                            {food.saved ? (
                                                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20"><Database className="h-3 w-3 mr-1" /> Salvo</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30"><Cloud className="h-3 w-3 mr-1" /> Nuvem</Badge>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {food.description || `${food.calories_per_serving || 0} kcal - ${food.metric_serving_amount || 100}${food.serving_unit || 'g'}`}
                                        </div>
                                    </div>
                                    {importingId === food.external_fatsecret_id && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
