import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ExerciseHistoryModal } from '@/components/modals/ExerciseHistoryModal'
import { sanitizeAlpha, sanitizeFloatInput, sanitizeNumeric } from '@/utils/masks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFeedback } from '@/components/ui/CapiFitFeedback'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dumbbell, Plus, Search, Eye, Loader2, Edit, Trash2, Video, List, X, Upload, Image as ImageIcon, Film, User as UserIcon, Clock } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Model from 'react-body-highlighter'
import { MultiSelect } from '@/components/ui/multi-select'

const VALID_MUSCLES = [
  { value: 'trapezius', label: 'Trapézio' },
  { value: 'upper-back', label: 'Costas Superior' },
  { value: 'lower-back', label: 'Lombar' },
  { value: 'chest', label: 'Peitoral' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'forearm', label: 'Antebraço' },
  { value: 'back-deltoids', label: 'Deltoide Posterior' },
  { value: 'front-deltoids', label: 'Deltoide Anterior' },
  { value: 'abs', label: 'Abdômen' },
  { value: 'obliques', label: 'Oblíquos' },
  { value: 'adductor', label: 'Adutores' },
  { value: 'hamstring', label: 'Isquiotibiais' },
  { value: 'quadriceps', label: 'Quadríceps' },
  { value: 'abductors', label: 'Abdutores' },
  { value: 'calves', label: 'Panturrilhas' },
  { value: 'gluteal', label: 'Glúteos' },
  { value: 'head', label: 'Cabeça' },
  { value: 'neck', label: 'Pescoço' }
]

// Component for Exercise Media (GIF or Video)
const ExerciseMediaThumbnail = ({
  src,
  type,
  alt,
  poster
}: {
  src: string | null,
  type: 'video' | 'gif' | null,
  alt: string,
  poster?: string
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hovering, setHovering] = useState(false)

  // Autoplay video on hover
  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      if (hovering) {
        videoRef.current.play().catch(() => { })
      } else {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }, [hovering, type])

  if (!src) {
    return (
      <div className="w-full aspect-video bg-muted rounded-md mb-3 border border-border flex items-center justify-center text-muted-foreground">
        <Dumbbell className="h-8 w-8 opacity-20" />
      </div>
    )
  }

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-md overflow-hidden mb-3 border border-border group-hover:border-blue-500/50 transition-colors"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {type === 'video' ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster} // Optional: could be a generated thumb
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata" // Lazy load-ish
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Type Badge */}
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white uppercase flex items-center gap-1">
        {type === 'video' ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
        <span>{type === 'video' ? 'Vídeo' : 'GIF'}</span>
      </div>
    </div>
  )
}

const ExerciseLibrary: React.FC = () => {
  const { user, profile, loading } = useAuth()
  const { confirm } = useFeedback()
  const [exercises, setExercises] = useState<any[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [previewExercise, setPreviewExercise] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  // Permission Check: Admins and Professionals can edit
  const canEdit = profile?.role === 'admin' || profile?.role === 'professional'

  // State definitions
  interface ExerciseForm {
    id: string
    name: string
    description: string
    muscle_groups: string[] // Multi-select array
    equipment: string
    difficulty: string
    instructions: string
    tips: string
    is_public: boolean
    base_type: string
    // Media
    demo_type: 'video' | 'gif' | null
    demo_url: string | null
    // Legacy support
    video_url: string
  }

  const initialFormState: ExerciseForm = {
    id: '', name: '', description: '',
    muscle_groups: [], equipment: '',
    difficulty: 'beginner',
    instructions: '', tips: '',
    is_public: false,
    base_type: 'none',
    demo_type: null,
    demo_url: null,
    video_url: ''
  }

  const [formData, setFormData] = useState<ExerciseForm>(initialFormState)
  const [demoFile, setDemoFile] = useState<File | null>(null)
  const [demoPreview, setDemoPreview] = useState<string | null>(null)

  // Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchExercises = async () => {
    if (!user) return
    setPageLoading(true)
    try {
      // Changed Logic: Fetch all accessible exercises (RLS handles visibility).
      // Join with profiles to get Creator and Updater names.
      let query = supabase
        .from('exercises_library')
        .select(`
          *,
          created_by_profile:created_by(full_name),
          updated_by_profile:updated_by(full_name)
        `)
        .order('created_at', { ascending: false })

      if (debouncedSearch) query = query.ilike('name', `%${debouncedSearch}%`)
      if (difficultyFilter !== 'all') query = query.eq('difficulty_level', difficultyFilter)

      const { data, error } = await query

      if (error) throw error
      setExercises(data || [])
    } catch (err) {
      console.error(err)
      showError('Erro ao carregar exercícios')
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => { if (!loading && user) fetchExercises() }, [user, loading, debouncedSearch, difficultyFilter])

  const openCreateDialog = () => {
    setFormData(initialFormState)
    setDemoFile(null)
    setDemoPreview(null)
    setIsCreateDialogOpen(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'gif') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validation
      if (type === 'video') {
        if (file.size > 50 * 1024 * 1024) { // 50MB
          showError('O vídeo deve ter no máximo 50MB.')
          return
        }
        if (!file.type.startsWith('video/')) {
          showError('Arquivo inválido. Selecione um vídeo.')
          return
        }
      } else {
        if (!file.type.includes('gif')) {
          showError('Arquivo inválido. Selecione um GIF.')
          return
        }
      }

      setDemoFile(file)
      setFormData(prev => ({ ...prev, demo_type: type }))

      // Preview
      const objectUrl = URL.createObjectURL(file)
      setDemoPreview(objectUrl)
    }
  }

  const clearMedia = () => {
    setDemoFile(null)
    setDemoPreview(null)
    setFormData(prev => ({ ...prev, demo_type: null, demo_url: null }))
  }

  const handleSave = async (e: React.FormEvent, mode: 'create' | 'update') => {
    e.preventDefault()
    if (!user) return

    setUploading(true)
    let finalDemoUrl = formData.demo_url

    // Upload Logic
    if (demoFile && formData.demo_type) {
      try {
        const fileExt = demoFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('exercise-demos')
          .upload(fileName, demoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('exercise-demos')
          .getPublicUrl(fileName)

        finalDemoUrl = publicUrl
      } catch (err: any) {
        console.error(err)
        showError('Erro ao fazer upload da mídia.')
        setUploading(false)
        return
      }
    }

    const payload: any = {
      name: formData.name,
      description: formData.description,
      muscle_groups: formData.muscle_groups, // ARRAY
      muscle_group: formData.muscle_groups[0] || null, // PRIMARY (First selected)
      equipment_needed: formData.equipment.split(',').map(s => s.trim()).filter(Boolean),
      difficulty_level: formData.difficulty,
      instructions: formData.instructions.split('\n').filter(Boolean),
      tips: formData.tips.split('\n').filter(Boolean),
      is_public: formData.is_public,
      base_type: formData.base_type === 'none' ? null : formData.base_type,
      demo_url: finalDemoUrl,
      demo_type: formData.demo_type,
      video_url: formData.video_url
    }

    if (mode === 'create') {
      payload.created_by = user.id
    }

    let error
    if (mode === 'create') {
      const res = await supabase.from('exercises_library').insert(payload)
      error = res.error
    } else {
      // updated_by is handled by Database Trigger (or we could send it here, but trigger is safer)
      const res = await supabase.from('exercises_library').update(payload).eq('id', formData.id)
      error = res.error
    }

    setUploading(false)

    if (!error) {
      showSuccess(mode === 'create' ? 'Criado!' : 'Atualizado!')
      setIsCreateDialogOpen(false)
      setIsEditDialogOpen(false)
      fetchExercises()
    } else {
      console.error(error)
      showError('Erro ao salvar')
    }
  }

  /* Delete Logic with new Feedback */
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Excluir Exercício?',
      description: 'Esta ação é irreversível e removerá o exercício da biblioteca.',
      variant: 'destructive',
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    })
    if (!confirmed) return

    const { error } = await supabase.from('exercises_library').delete().eq('id', id)
    if (!error) {
      showSuccess('Deletado!')
      fetchExercises()
    }
    else showError('Erro ao deletar')
  }

  const openEdit = (ex: any) => {
    setFormData({
      id: ex.id,
      name: ex.name,
      description: ex.description || '',
      muscle_groups: ex.muscle_groups || [], // Load Array
      equipment: (ex.equipment_needed || []).join(', '),
      difficulty: ex.difficulty_level,
      video_url: ex.video_url || '',
      instructions: (ex.instructions || []).join('\n'),
      tips: (ex.tips || []).join('\n'),
      is_public: ex.is_public,
      base_type: ex.base_type || 'none',
      demo_type: ex.demo_type || (ex.gif_url ? 'gif' : null),
      demo_url: ex.demo_url || ex.gif_url || null
    })
    setDemoFile(null)
    setDemoPreview(ex.demo_url || ex.gif_url || null)
    setIsEditDialogOpen(true)
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><Dumbbell className="text-blue-500" /> Exercícios</h1>
          {canEdit && (
            <Button onClick={openCreateDialog} className="bg-blue-600 text-white hover:bg-blue-500"><Plus className="mr-2 h-4 w-4" /> Novo</Button>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercício..."
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
              <Card key={ex.id} className="bg-card border-border hover:bg-accent/50 transition-all group overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-foreground text-lg truncate pr-2">{ex.name}</CardTitle>
                    <div className="flex gap-1 shrink-0">
                      {canEdit && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(ex)} className="text-muted-foreground hover:text-blue-500 h-8 w-8"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(ex.id)} className="text-muted-foreground hover:text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* MEDIA DISPLAY */}
                  <ExerciseMediaThumbnail
                    src={ex.demo_url || ex.gif_url}
                    type={ex.demo_type || (ex.gif_url ? 'gif' : null)}
                    alt={ex.name}
                  />

                  <div className="flex flex-wrap gap-1 mb-3 h-6 overflow-hidden">
                    {ex.muscle_groups?.map((m: string) => <Badge key={m} variant="secondary" className="bg-muted text-muted-foreground text-[10px]">{m}</Badge>)}
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center border-t border-border pt-2 mb-2">
                      <Badge variant="outline" className="border-border text-muted-foreground">{ex.difficulty_level}</Badge>
                      <div className="flex gap-2 text-muted-foreground">
                        {ex.video_url && <Video className="h-4 w-4 hover:text-blue-500 cursor-pointer" onClick={() => setPreviewExercise(ex)} />}
                        {(ex.instructions?.length > 0) && <List className="h-4 w-4 hover:text-yellow-500 cursor-pointer" onClick={() => setPreviewExercise(ex)} />}
                        <Eye className="h-4 w-4 hover:text-green-500 cursor-pointer" onClick={() => setPreviewExercise(ex)} />
                      </div>
                    </div>

                    {/* Created/Updated By Info */}
                    <div className="text-[10px] text-muted-foreground border-t border-border pt-2 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        <span>Criado por: <span className="font-medium text-foreground">{ex.created_by_profile?.full_name || 'Desconhecido'}</span></span>
                      </div>
                      {ex.updated_by_profile && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Atualizado por: <span className="font-medium text-foreground">{ex.updated_by_profile.full_name}</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        {[
          { open: isCreateDialogOpen, change: setIsCreateDialogOpen, title: 'Novo Exercício', mode: 'create' as const },
          { open: isEditDialogOpen, change: setIsEditDialogOpen, title: 'Editar Exercício', mode: 'update' as const }
        ].map((d, i) => (
          <Dialog key={i} open={d.open} onOpenChange={d.change}>
            <DialogContent className="bg-card border-border text-foreground max-w-2xl h-[90vh] overflow-y-auto">
              {/* ... Same Form Content as before ... */}
              <DialogHeader>
                <DialogTitle>{d.title}</DialogTitle>
                <DialogDescription>Preencha os dados do exercício abaixo.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => handleSave(e, d.mode)} className="space-y-4">
                <div><Label>Nome *</Label><Input className="bg-muted border-border" required value={formData.name} onChange={e => setFormData({ ...formData, name: sanitizeAlpha(e.target.value) })} /></div>

                {/* MEDIA UPLOAD SECTION */}
                <div className="space-y-2 border border-border rounded-md p-4 bg-muted/30">
                  <Label className="font-semibold flex items-center gap-2">Mídia Demonstrativa</Label>
                  <Tabs
                    defaultValue="none"
                    value={formData.demo_type ? (formData.demo_type === 'gif' ? 'gif' : 'video') : 'none'}
                    onValueChange={(val) => {
                      if (val === 'none') clearMedia()
                      else {
                        setFormData(prev => ({ ...prev, demo_type: val as 'gif' | 'video' }))
                        if ((val === 'gif' && formData.demo_type === 'video') || (val === 'video' && formData.demo_type === 'gif')) {
                          setDemoFile(null)
                          setDemoPreview(null)
                          setFormData(p => ({ ...p, demo_url: null }))
                        }
                      }
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="none">Nenhum</TabsTrigger>
                      <TabsTrigger value="gif">GIF Animado</TabsTrigger>
                      <TabsTrigger value="video">Vídeo (MP4)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="none" className="text-xs text-muted-foreground p-2 text-center">
                      Nenhuma mídia selecionada.
                    </TabsContent>

                    <TabsContent value="gif" className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" className="w-full relative overflow-hidden" disabled={uploading}>
                          <Upload className="mr-2 h-4 w-4" /> Selecionar GIF
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/gif"
                            onChange={(e) => handleFileSelect(e, 'gif')}
                          />
                        </Button>
                      </div>
                      {demoPreview && formData.demo_type === 'gif' && (
                        <div className="relative w-full aspect-video bg-black rounded overflow-hidden">
                          <img src={demoPreview} alt="Preview" className="w-full h-full object-contain" />
                          <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-6 w-6" onClick={clearMedia}><X className="h-3 w-3" /></Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="video" className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Button type="button" variant="outline" className="w-full relative overflow-hidden" disabled={uploading}>
                          <Upload className="mr-2 h-4 w-4" /> Selecionar Vídeo (max 50MB)
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="video/mp4,video/webm"
                            onChange={(e) => handleFileSelect(e, 'video')}
                          />
                        </Button>
                      </div>
                      {demoPreview && formData.demo_type === 'video' && (
                        <div className="relative w-full aspect-video bg-black rounded overflow-hidden">
                          <video src={demoPreview} className="w-full h-full object-contain" controls />
                          <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-6 w-6" onClick={clearMedia}><X className="h-3 w-3" /></Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

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
                <div>
                  <Label>Músculos Alvo (Selecione todos que se aplicam)</Label>
                  <MultiSelect
                    options={VALID_MUSCLES}
                    selected={formData.muscle_groups}
                    onChange={(val) => setFormData({ ...formData, muscle_groups: val })}
                    placeholder="Buscar músculos..."
                  />
                </div>
                <div><Label>Equipamentos</Label><Input className="bg-muted border-border" value={formData.equipment} onChange={e => setFormData({ ...formData, equipment: e.target.value })} /></div>
                <div><Label>URL de Tutorial (Youtube - Opcional)</Label><Input className="bg-muted border-border" value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} /></div>
                <div><Label>Descrição</Label><Textarea className="bg-muted border-border" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                <div><Label className="text-blue-500">Instruções (uma por linha)</Label><Textarea className="bg-muted border-border font-mono text-xs" rows={4} value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} /></div>
                <div><Label className="text-yellow-500">Dicas (uma por linha)</Label><Textarea className="bg-muted border-border font-mono text-xs" rows={3} value={formData.tips} onChange={e => setFormData({ ...formData, tips: e.target.value })} /></div>
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id={`public-${d.mode}`} checked={formData.is_public} onCheckedChange={(c) => setFormData({ ...formData, is_public: c as boolean })} className="border-muted-foreground data-[state=checked]:bg-blue-600" />
                  <Label htmlFor={`public-${d.mode}`} className="cursor-pointer">Público</Label>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  {uploading ? 'Salvando...' : 'Salvar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        ))}

        {/* PREVIEW DIALOG DETAILED */}
        <Dialog open={!!previewExercise} onOpenChange={(open) => !open && setPreviewExercise(null)}>
          <DialogContent className="bg-card border-border text-foreground max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Dumbbell className="text-primary h-6 w-6" /> {previewExercise?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* LARGE PREVIEW */}
                <div className="rounded-lg overflow-hidden border border-border shadow-md bg-black flex items-center justify-center min-h-[200px]">
                  {(previewExercise?.demo_url || previewExercise?.gif_url) ? (
                    (previewExercise?.demo_type === 'video') ? (
                      <video src={previewExercise.demo_url} className="w-full h-auto max-h-[400px]" controls autoPlay muted loop />
                    ) : (
                      <img src={previewExercise?.demo_url || previewExercise?.gif_url} alt={previewExercise?.name} className="w-full h-auto object-contain" />
                    )
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center">
                      <Dumbbell className="h-12 w-12 mb-2 opacity-50" />
                      Sem demonstração visual
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs uppercase tracking-wider">{previewExercise?.difficulty_level}</Badge>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {previewExercise?.muscle_groups?.map((m: string) => <Badge key={m} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{m}</Badge>)}
                    </div>
                    <p className="text-sm text-muted-foreground">{previewExercise?.description || 'Sem descrição.'}</p>
                    {/* CREATION INFO IN PREVIEW */}
                    <div className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                      Criado por: {previewExercise?.created_by_profile?.full_name || 'Desconhecido'}
                      {previewExercise?.updated_by_profile && (
                        <span> | Atualizado por: {previewExercise?.updated_by_profile.full_name}</span>
                      )}
                    </div>
                  </div>

                  {previewExercise?.video_url && (
                    <Button variant="outline" className="w-full gap-2" onClick={() => window.open(previewExercise.video_url, '_blank')}>
                      <Video className="h-4 w-4" /> Assistir Tutorial (Youtube)
                    </Button>
                  )}
                </div>
              </div>

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