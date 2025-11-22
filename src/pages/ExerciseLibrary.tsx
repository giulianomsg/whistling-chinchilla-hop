import React, { useState, useEffect } from 'react'
// ... imports ...
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dumbbell, Plus, Search, Eye, EyeOff, Loader2, Edit, Trash2, Video, List } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'

const ExerciseLibrary: React.FC = () => {
  const { user, loading } = useAuth()
  const [exercises, setExercises] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const initialFormState = { 
    id: '', name: '', description: '', 
    muscles: '', equipment: '', 
    difficulty: 'beginner', video_url: '', gif_url: '',
    instructions: '', tips: '',
    is_public: false
  }
  const [formData, setFormData] = useState(initialFormState)

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

  // RESET CORRETO AO ABRIR DIALOG
  const openCreateDialog = () => {
    setFormData(initialFormState)
    setIsCreateDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent, mode: 'create' | 'update') => {
    e.preventDefault()
    if (!user) return

    const payload = {
      name: formData.name, 
      description: formData.description,
      muscle_groups: formData.muscles.split(',').map(s => s.trim()).filter(Boolean),
      equipment_needed: formData.equipment.split(',').map(s => s.trim()).filter(Boolean),
      difficulty_level: formData.difficulty,
      video_url: formData.video_url,
      gif_url: formData.gif_url,
      instructions: formData.instructions.split('\n').filter(Boolean),
      tips: formData.tips.split('\n').filter(Boolean),
      is_public: formData.is_public,
      created_by: user.id
    }

    let error
    if (mode === 'create') {
      const res = await supabase.from('exercises_library').insert(payload)
      error = res.error
    } else {
      const res = await supabase.from('exercises_library').update(payload).eq('id', formData.id)
      error = res.error
    }

    if (!error) { 
      showSuccess(mode === 'create' ? 'Criado!' : 'Atualizado!')
      setIsCreateDialogOpen(false)
      setIsEditDialogOpen(false)
      fetchExercises() 
    } else {
      showError('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('exercises_library').delete().eq('id', id)
    if (!error) { showSuccess('Deletado!'); fetchExercises() }
    else showError('Erro ao deletar')
  }

  const openEdit = (ex: any) => {
    setFormData({ 
      id: ex.id, name: ex.name, description: ex.description || '',
      muscles: (ex.muscle_groups || []).join(', '),
      equipment: (ex.equipment_needed || []).join(', '),
      difficulty: ex.difficulty_level,
      video_url: ex.video_url || '', gif_url: ex.gif_url || '',
      instructions: (ex.instructions || []).join('\n'),
      tips: (ex.tips || []).join('\n'),
      is_public: ex.is_public
    })
    setIsEditDialogOpen(true)
  }

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary"/></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Dumbbell className="text-blue-400"/> Exercícios</h1>
          {/* CHAMADA DO RESET */}
          <Button onClick={openCreateDialog} className="bg-blue-600 text-white hover:bg-blue-500"><Plus className="mr-2 h-4 w-4"/> Novo</Button>
        </div>

        {/* Busca e Filtro (igual) */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white"/></div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Dificuldade"/></SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10 text-white"><SelectItem value="all">Todas</SelectItem><SelectItem value="beginner">Iniciante</SelectItem><SelectItem value="intermediate">Intermediário</SelectItem><SelectItem value="advanced">Avançado</SelectItem></SelectContent>
          </Select>
        </div>

        {/* Lista de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exercises.map(ex => (
            <Card key={ex.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg truncate pr-2">{ex.name}</CardTitle>
                  <div className="flex gap-1 shrink-0">
                    {ex.created_by === user?.id && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(ex)} className="text-gray-400 hover:text-blue-400 h-8 w-8"><Edit className="h-4 w-4"/></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400 h-8 w-8"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                            <AlertDialogHeader><AlertDialogTitle>Excluir?</AlertDialogTitle><AlertDialogDescription>Irreversível.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel className="text-black">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(ex.id)} className="bg-red-600">Excluir</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3 h-6 overflow-hidden">
                  {ex.muscle_groups?.map((m: string) => <Badge key={m} variant="secondary" className="bg-white/10 text-gray-300 text-[10px]">{m}</Badge>)}
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-2">
                  <Badge variant="outline" className="border-white/20 text-gray-400">{ex.difficulty_level}</Badge>
                  <div className="flex gap-2 text-gray-500">
                    {ex.video_url && <Video className="h-4 w-4 hover:text-blue-400" />}
                    {(ex.instructions?.length > 0) && <List className="h-4 w-4 hover:text-yellow-400" />}
                    {ex.is_public && <Eye className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialogs (Forms Inline para evitar perda de foco) */}
        {[
          { open: isCreateDialogOpen, change: setIsCreateDialogOpen, title: 'Novo Exercício', mode: 'create' as const },
          { open: isEditDialogOpen, change: setIsEditDialogOpen, title: 'Editar Exercício', mode: 'update' as const }
        ].map((d, i) => (
          <Dialog key={i} open={d.open} onOpenChange={d.change}>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{d.title}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => handleSave(e, d.mode)} className="space-y-4">
                <div><Label>Nome *</Label><Input className="bg-black/20 border-white/10" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Dificuldade</Label>
                    <Select value={formData.difficulty} onValueChange={v => setFormData({...formData, difficulty: v})}>
                      <SelectTrigger className="bg-black/20 border-white/10"><SelectValue/></SelectTrigger>
                      <SelectContent className="bg-slate-800 text-white"><SelectItem value="beginner">Iniciante</SelectItem><SelectItem value="intermediate">Intermediário</SelectItem><SelectItem value="advanced">Avançado</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Músculos</Label><Input className="bg-black/20 border-white/10" value={formData.muscles} onChange={e=>setFormData({...formData, muscles: e.target.value})}/></div>
                </div>
                <div><Label>Equipamentos</Label><Input className="bg-black/20 border-white/10" value={formData.equipment} onChange={e=>setFormData({...formData, equipment: e.target.value})}/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Vídeo URL</Label><Input className="bg-black/20 border-white/10" value={formData.video_url} onChange={e=>setFormData({...formData, video_url: e.target.value})}/></div>
                  <div><Label>GIF URL</Label><Input className="bg-black/20 border-white/10" value={formData.gif_url} onChange={e=>setFormData({...formData, gif_url: e.target.value})}/></div>
                </div>
                <div><Label>Descrição</Label><Textarea className="bg-black/20 border-white/10" rows={2} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}/></div>
                <div><Label className="text-blue-400">Instruções (uma por linha)</Label><Textarea className="bg-black/20 border-white/10 font-mono text-xs" rows={4} value={formData.instructions} onChange={e=>setFormData({...formData, instructions: e.target.value})}/></div>
                <div><Label className="text-yellow-400">Dicas (uma por linha)</Label><Textarea className="bg-black/20 border-white/10 font-mono text-xs" rows={3} value={formData.tips} onChange={e=>setFormData({...formData, tips: e.target.value})}/></div>
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id={`public-${d.mode}`} checked={formData.is_public} onCheckedChange={(c) => setFormData({...formData, is_public: c as boolean})} className="border-white/30 data-[state=checked]:bg-blue-500" />
                  <Label htmlFor={`public-${d.mode}`} className="cursor-pointer">Público</Label>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}

export default ExerciseLibrary