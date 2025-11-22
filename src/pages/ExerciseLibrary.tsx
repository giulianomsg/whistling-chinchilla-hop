import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dumbbell, Plus, Search, Eye, EyeOff, Loader2, Edit, Trash2 } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'

const ExerciseLibrary: React.FC = () => {
  const { user, loading } = useAuth()
  const [exercises, setExercises] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', muscles: '', difficulty: 'beginner' })

  const fetchExercises = async () => {
    if (!user) return
    setPageLoading(true)
    try {
      let query = supabase.from('exercises_library').select('*').or(`created_by.eq.${user.id},is_public.eq.true`).order('created_at', { ascending: false })
      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`)
      if (difficultyFilter !== 'all') query = query.eq('difficulty_level', difficultyFilter)
      const { data } = await query
      setExercises(data || [])
    } catch { showError('Erro ao carregar') }
    finally { setPageLoading(false) }
  }

  useEffect(() => { if (!loading && user) fetchExercises() }, [user, loading, searchTerm, difficultyFilter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { error } = await supabase.from('exercises_library').insert({
      name: formData.name, muscle_groups: formData.muscles.split(','),
      difficulty_level: formData.difficulty, created_by: user.id, is_public: false
    })
    if (!error) { showSuccess('Criado!'); setIsCreateDialogOpen(false); fetchExercises() }
  }

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary"/></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Dumbbell className="text-blue-400"/> Exercícios</h1>
            <p className="text-gray-400">Biblioteca global e pessoal.</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild><Button className="bg-blue-600 text-white"><Plus className="mr-2 h-4 w-4"/> Novo</Button></DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
              <DialogHeader><DialogTitle>Novo Exercício</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><Label>Nome</Label><Input className="bg-black/20 border-white/10" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/></div>
                <div><Label>Músculos (separar por vírgula)</Label><Input className="bg-black/20 border-white/10" value={formData.muscles} onChange={e=>setFormData({...formData, muscles: e.target.value})}/></div>
                <Button type="submit" className="w-full bg-blue-600">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white"/>
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Dificuldade"/></SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="beginner">Iniciante</SelectItem>
              <SelectItem value="intermediate">Intermediário</SelectItem>
              <SelectItem value="advanced">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exercises.map(ex => (
            <Card key={ex.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-white text-lg">{ex.name}</CardTitle>
                  {ex.is_public ? <Eye className="h-4 w-4 text-green-400"/> : <EyeOff className="h-4 w-4 text-gray-500"/>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {ex.muscle_groups?.map((m: string) => <Badge key={m} variant="secondary" className="bg-white/10 text-gray-300">{m}</Badge>)}
                </div>
                <Badge variant="outline" className="border-white/20 text-gray-400">{ex.difficulty_level}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExerciseLibrary