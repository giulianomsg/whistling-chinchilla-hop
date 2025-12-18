import React, { useState, useEffect } from 'react'
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
import { Dumbbell, Plus, Search, Eye, Loader2, Edit, Trash2, Video, List } from 'lucide-react'
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
    // ... existing code ...

    // ... map ...
    < Card key = { ex.id } className = "bg-card border-border hover:bg-accent/50 transition-all group" >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-foreground text-lg truncate pr-2">{ex.name}</CardTitle>
// ... existing buttons ...
        </div>
      </div>
              </CardHeader >
  <CardContent>
    {/* GIF THUMBNAIL */}
    <GifThumbnail src={ex.gif_url} alt={ex.name} />

    <div className="flex flex-wrap gap-1 mb-3 h-6 overflow-hidden">
// ... existing badges ...

      {/* Dialogs (Forms Inline para evitar perda de foco) */}
      {[
        { open: isCreateDialogOpen, change: setIsCreateDialogOpen, title: 'Novo Exercício', mode: 'create' as const },
        { open: isEditDialogOpen, change: setIsEditDialogOpen, title: 'Editar Exercício', mode: 'update' as const }
      ].map((d, i) => (
        <Dialog key={i} open={d.open} onOpenChange={d.change}>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{d.title}</DialogTitle></DialogHeader>
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
                <div><Label>Músculos</Label><Input className="bg-muted border-border" value={formData.muscles} onChange={e => setFormData({ ...formData, muscles: e.target.value })} /></div>
              </div>
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
  </div>
  )
}

export default ExerciseLibrary