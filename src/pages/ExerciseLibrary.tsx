import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dumbbell, Plus, Search, Eye, Loader2, Edit, Trash2, Video, List, X } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'

// Helper Component for Static/Hover GIF
const GifThumbnail = ({ src, alt }: { src: string, alt: string }) => {
  const [hovering, setHovering] = useState(false)
  const [staticSrc, setStaticSrc] = useState<string | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!src) return

    // Attempt to generate static frame
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = src
    img.onload = () => {
      // Create a temporary canvas if we don't have a ref (though we do)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        try {
          const dataUrl = canvas.toDataURL()
          setStaticSrc(dataUrl)
        } catch (e) {
          console.warn('Cannot generate static thumbnail (likely CORS)', e)
          // If CORS fails, we just won't have a static src, so we might show loading or just the gif
        }
      }
    }
  }, [src])

  const displaySrc = (hovering || !staticSrc) ? src : staticSrc

  return (
    <div
      className="relative w-full aspect-video bg-muted rounded-md overflow-hidden mb-3 border border-border flex items-center justify-center cursor-pointer group-hover:border-blue-500/50 transition-colors"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {!src ? (
        <span className="text-xs text-muted-foreground">Sem GIF</span>
      ) : (
        <img
          src={displaySrc}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
      {/* Badge to indicate interaction */}
      {!hovering && src && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
          <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
            <span className="text-[10px] text-white font-bold uppercase tracking-widest">GIF</span>
          </div>
        </div>
      )}
    </div>
  )
}

const ExerciseLibrary: React.FC = () => {
  const { user, loading } = useAuth()
  const [exercises, setExercises] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [previewExercise, setPreviewExercise] = useState<any>(null)

  const initialFormState = {
    id: '', name: '', description: '',
    muscles: '', equipment: '',
    difficulty: 'beginner', video_url: '', gif_url: '',
    instructions: '', tips: '',
    is_public: false,
    base_type: 'none'
  }
  const [formData, setFormData] = useState(initialFormState)

  // Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchExercises = async () => {
    if (!user) return
    // Only block full page if it's the very first load or if we want to show a spinner in the grid
    setPageLoading(true)
    try {
      let query = supabase.from('exercises_library').select('*').or(`created_by.eq.${user.id},is_public.eq.true`).order('created_at', { ascending: false })
      if (debouncedSearch) query = query.ilike('name', `%${debouncedSearch}%`)
      if (difficultyFilter !== 'all') query = query.eq('difficulty_level', difficultyFilter)
      const { data } = await query
      setExercises(data || [])
    } catch { showError('Erro ao carregar') }
    finally { setPageLoading(false) }
  }

  useEffect(() => { if (!loading && user) fetchExercises() }, [user, loading, debouncedSearch, difficultyFilter])

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
      created_by: user.id,
      base_type: formData.base_type === 'none' ? null : formData.base_type
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
      is_public: ex.is_public,
      base_type: ex.base_type || 'none'
    })
    setIsEditDialogOpen(true)
  }

  // Auth loading only blocks
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><Dumbbell className="text-blue-500" /> Exercícios</h1>
          <Button onClick={openCreateDialog} className="bg-blue-600 text-white hover:bg-blue-500"><Plus className="mr-2 h-4 w-4" /> Novo</Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-card border-border text-foreground"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-48 bg-card border-border text-foreground"><SelectValue placeholder="Dificuldade" /></SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground"><SelectItem value="all">Todas</SelectItem><SelectItem value="beginner">Iniciante</SelectItem><SelectItem value="intermediate">Intermediário</SelectItem><SelectItem value="advanced">Avançado</SelectItem></SelectContent>
          </Select>
        </div>

        {pageLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exercises.map(ex => (
              <Card key={ex.id} className="bg-card border-border hover:bg-accent/50 transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-foreground text-lg truncate pr-2">{ex.name}</CardTitle>
                    <div className="flex gap-1 shrink-0">
                      {ex.created_by === user?.id && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(ex)} className="text-muted-foreground hover:text-blue-500 h-8 w-8"><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border text-foreground">
                              <AlertDialogHeader><AlertDialogTitle>Excluir?</AlertDialogTitle><AlertDialogDescription>Irreversível.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel className="text-foreground">Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(ex.id)} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* GIF THUMBNAIL */}
                  <GifThumbnail src={ex.gif_url} alt={ex.name} />

                  <div className="flex flex-wrap gap-1 mb-3 h-6 overflow-hidden">
                    {ex.muscle_groups?.map((m: string) => <Badge key={m} variant="secondary" className="bg-muted text-muted-foreground text-[10px]">{m}</Badge>)}
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-2">
                    <Badge variant="outline" className="border-border text-muted-foreground">{ex.difficulty_level}</Badge>
                    <div className="flex gap-2 text-muted-foreground">
                      {ex.video_url && <Video className="h-4 w-4 hover:text-blue-500 cursor-pointer" onClick={() => setPreviewExercise(ex)} />}
                      {(ex.instructions?.length > 0) && <List className="h-4 w-4 hover:text-yellow-500 cursor-pointer" onClick={() => setPreviewExercise(ex)} />}
                      {<Eye className="h-4 w-4 hover:text-green-500 cursor-pointer" onClick={() => setPreviewExercise(ex)} />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialogs (Forms Inline para evitar perda de foco) */}
        {[
          { open: isCreateDialogOpen, change: setIsCreateDialogOpen, title: 'Novo Exercício', mode: 'create' as const },
          { open: isEditDialogOpen, change: setIsEditDialogOpen, title: 'Editar Exercício', mode: 'update' as const }
        ].map((d, i) => (
          <Dialog key={i} open={d.open} onOpenChange={d.change}>
            <DialogContent className="bg-card border-border text-foreground max-w-2xl h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{d.title}</DialogTitle>
                <DialogDescription>Preencha os dados do exercício abaixo.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => handleSave(e, d.mode)} className="space-y-4">
                <div><Label>Nome *</Label><Input className="bg-muted border-border" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Dificuldade</Label>
                    <Select value={formData.difficulty} onValueChange={v => setFormData({ ...formData, difficulty: v })}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground"><SelectItem value="beginner">Iniciante</SelectItem><SelectItem value="intermediate">Intermediário</SelectItem><SelectItem value="advanced">Avançado</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo de Movimento (Powerlifting)</Label>
                    <Select value={formData.base_type} onValueChange={v => setFormData({ ...formData, base_type: v })}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Nenhum (Acessório)" /></SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="none">Nenhum (Acessório)</SelectItem>
                        <SelectItem value="squat">Agachamento (Squat)</SelectItem>
                        <SelectItem value="bench">Supino (Bench Press)</SelectItem>
                        <SelectItem value="deadlift">Levantamento Terra</SelectItem>
                        <SelectItem value="overhead">Desenvolvimento (Overhead)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Músculos</Label><Input className="bg-muted border-border" value={formData.muscles} onChange={e => setFormData({ ...formData, muscles: e.target.value })} /></div>
                <div><Label>Equipamentos</Label><Input className="bg-muted border-border" value={formData.equipment} onChange={e => setFormData({ ...formData, equipment: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Vídeo URL</Label><Input className="bg-muted border-border" value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} /></div>
                  <div><Label>GIF URL</Label><Input className="bg-muted border-border" value={formData.gif_url} onChange={e => setFormData({ ...formData, gif_url: e.target.value })} /></div>
                </div>
                <div><Label>Descrição</Label><Textarea className="bg-muted border-border" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                <div><Label className="text-blue-500">Instruções (uma por linha)</Label><Textarea className="bg-muted border-border font-mono text-xs" rows={4} value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} /></div>
                <div><Label className="text-yellow-500">Dicas (uma por linha)</Label><Textarea className="bg-muted border-border font-mono text-xs" rows={3} value={formData.tips} onChange={e => setFormData({ ...formData, tips: e.target.value })} /></div>
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id={`public-${d.mode}`} checked={formData.is_public} onCheckedChange={(c) => setFormData({ ...formData, is_public: c as boolean })} className="border-muted-foreground data-[state=checked]:bg-blue-600" />
                  <Label htmlFor={`public-${d.mode}`} className="cursor-pointer">Público</Label>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        ))}

        {/* PREVIEW DIALOG */}
        <Dialog open={!!previewExercise} onOpenChange={(open) => !open && setPreviewExercise(null)}>
          <DialogContent className="bg-card border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Dumbbell className="text-primary h-6 w-6" /> {previewExercise?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Media Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {previewExercise?.gif_url ? (
                  <div className="rounded-lg overflow-hidden border border-border shadow-md bg-black/20 flex items-center justify-center min-h-[200px]">
                    <img src={previewExercise.gif_url} alt={previewExercise.name} className="w-full h-auto object-cover" />
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-muted flex items-center justify-center min-h-[200px] text-muted-foreground">
                    Sem GIF disponível
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs uppercase tracking-wider">{previewExercise?.difficulty_level}</Badge>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {previewExercise?.muscle_groups?.map((m: string) => <Badge key={m} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{m}</Badge>)}
                    </div>
                    <p className="text-sm text-muted-foreground">{previewExercise?.description || 'Sem descrição.'}</p>
                  </div>

                  {previewExercise?.video_url && (
                    <Button variant="outline" className="w-full gap-2" onClick={() => window.open(previewExercise.video_url, '_blank')}>
                      <Video className="h-4 w-4" /> Assistir Tutorial (Youtube)
                    </Button>
                  )}
                </div>
              </div>

              {/* Instructions Section */}
              {(previewExercise?.instructions?.length > 0 || previewExercise?.tips?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
                  {previewExercise.instructions?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-500"><List className="h-4 w-4" /> Instruções</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {previewExercise.instructions.map((inst: string, idx: number) => <li key={idx}>{inst}</li>)}
                      </ul>
                    </div>
                  )}
                  {previewExercise.tips?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-500"><Eye className="h-4 w-4" /> Dicas</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {previewExercise.tips.map((tip: string, idx: number) => <li key={idx}>{tip}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div >
  )
}

export default ExerciseLibrary