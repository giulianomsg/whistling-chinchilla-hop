import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dumbbell, Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'

interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_groups: string[] | null
  equipment_needed: string[] | null
  difficulty_level: string | null
  video_url: string | null
  gif_url: string | null
  instructions: string[] | null
  tips: string[] | null
  created_by: string
  is_public: boolean
  created_at: string
  updated_at: string
}

const ExerciseLibrary: React.FC = () => {
  const { user, profile } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscle_groups: '',
    equipment_needed: '',
    difficulty_level: 'beginner',
    video_url: '',
    is_public: false
  })

  // Buscar exercícios
  const fetchExercises = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar exercícios:', error)
        showError('Erro ao carregar exercícios')
        return
      }

      setExercises(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao carregar exercícios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExercises()
  }, [user])

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      muscle_groups: '',
      equipment_needed: '',
      difficulty_level: 'beginner',
      video_url: '',
      is_public: false
    })
  }

  // Criar exercício
  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const exerciseData = {
        name: formData.name,
        description: formData.description || null,
        muscle_groups: formData.muscle_groups ? formData.muscle_groups.split(',').map(g => g.trim()) : [],
        equipment_needed: formData.equipment_needed ? formData.equipment_needed.split(',').map(e => e.trim()) : [],
        difficulty_level: formData.difficulty_level,
        video_url: formData.video_url || null,
        created_by: user.id,
        is_public: formData.is_public
      }

      const { error } = await supabase
        .from('exercises_library')
        .insert(exerciseData)

      if (error) {
        console.error('Erro ao criar exercício:', error)
        showError('Erro ao criar exercício')
        return
      }

      showSuccess('Exercício criado com sucesso!')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchExercises()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao criar exercício')
    }
  }

  // Editar exercício
  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      muscle_groups: exercise.muscle_groups?.join(', ') || '',
      equipment_needed: exercise.equipment_needed?.join(', ') || '',
      difficulty_level: exercise.difficulty_level || 'beginner',
      video_url: exercise.video_url || '',
      is_public: exercise.is_public
    })
    setIsEditSheetOpen(true)
  }

  // Atualizar exercício
  const handleUpdateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingExercise) return

    try {
      const exerciseData = {
        name: formData.name,
        description: formData.description || null,
        muscle_groups: formData.muscle_groups ? formData.muscle_groups.split(',').map(g => g.trim()) : [],
        equipment_needed: formData.equipment_needed ? formData.equipment_needed.split(',').map(e => e.trim()) : [],
        difficulty_level: formData.difficulty_level,
        video_url: formData.video_url || null,
        is_public: formData.is_public
      }

      const { error } = await supabase
        .from('exercises_library')
        .update(exerciseData)
        .eq('id', editingExercise.id)

      if (error) {
        console.error('Erro ao atualizar exercício:', error)
        showError('Erro ao atualizar exercício')
        return
      }

      showSuccess('Exercício atualizado com sucesso!')
      setIsEditSheetOpen(false)
      setEditingExercise(null)
      resetForm()
      fetchExercises()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao atualizar exercício')
    }
  }

  // Deletar exercício
  const handleDeleteExercise = async (exerciseId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('exercises_library')
        .delete()
        .eq('id', exerciseId)

      if (error) {
        console.error('Erro ao deletar exercício:', error)
        showError('Erro ao deletar exercício')
        return
      }

      showSuccess('Exercício deletado com sucesso!')
      fetchExercises()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao deletar exercício')
    }
  }

  // Verificar se usuário pode editar/deletar
  const canEditExercise = (exercise: Exercise) => {
    return exercise.created_by === user?.id
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Dumbbell className="h-8 w-8 text-blue-600" />
                Biblioteca de Exercícios
              </h1>
              <p className="mt-2 text-gray-600">
                Gerencie sua biblioteca pessoal de exercícios
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Exercício
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Exercício</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateExercise} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Exercício *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Supino Reto"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                      <select
                        id="difficulty"
                        value={formData.difficulty_level}
                        onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="beginner">Iniciante</option>
                        <option value="intermediate">Intermediário</option>
                        <option value="advanced">Avançado</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva como realizar o exercício..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="muscles">Grupos Musculares</Label>
                      <Input
                        id="muscles"
                        value={formData.muscle_groups}
                        onChange={(e) => setFormData({ ...formData, muscle_groups: e.target.value })}
                        placeholder="Peito, Ombros, Tríceps"
                      />
                      <p className="text-xs text-gray-500">Separe com vírgula</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipment">Equipamentos</Label>
                      <Input
                        id="equipment"
                        value={formData.equipment_needed}
                        onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
                        placeholder="Barra, Halteres, Banco"
                      />
                      <p className="text-xs text-gray-500">Separe com vírgula</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video">URL do Vídeo</Label>
                    <Input
                      id="video"
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="public"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
                    />
                    <Label htmlFor="public">Tornar este exercício público</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Criar Exercício
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lista de Exercícios */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {exercise.is_public ? (
                        <Eye className="h-4 w-4 text-green-600" title="Público" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" title="Privado" />
                      )}
                      {canEditExercise(exercise) && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditExercise(exercise)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar o exercício "{exercise.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteExercise(exercise.id)}>
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {exercise.description && (
                    <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Músculos:</p>
                        <div className="flex flex-wrap gap-1">
                          {exercise.muscle_groups.map((muscle, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {muscle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Equipamentos:</p>
                        <div className="flex flex-wrap gap-1">
                          {exercise.equipment_needed.map((equipment, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {equipment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {exercise.difficulty_level && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Dificuldade:</p>
                        <Badge 
                          variant={
                            exercise.difficulty_level === 'beginner' ? 'default' :
                            exercise.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {exercise.difficulty_level === 'beginner' ? 'Iniciante' :
                           exercise.difficulty_level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-400">
                      {canEditExercise(exercise) ? 'Seu exercício' : 'Exercício público'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sheet de Edição */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Editar Exercício</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleUpdateExercise} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Exercício *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Supino Reto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">Nível de Dificuldade</Label>
                <select
                  id="edit-difficulty"
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="beginner">Iniciante</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva como realizar o exercício..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-muscles">Grupos Musculares</Label>
                <Input
                  id="edit-muscles"
                  value={formData.muscle_groups}
                  onChange={(e) => setFormData({ ...formData, muscle_groups: e.target.value })}
                  placeholder="Peito, Ombros, Tríceps"
                />
                <p className="text-xs text-gray-500">Separe com vírgula</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-equipment">Equipamentos</Label>
                <Input
                  id="edit-equipment"
                  value={formData.equipment_needed}
                  onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
                  placeholder="Barra, Halteres, Banco"
                />
                <p className="text-xs text-gray-500">Separe com vírgula</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-video">URL do Vídeo</Label>
                <Input
                  id="edit-video"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
                />
                <Label htmlFor="edit-public">Tornar este exercício público</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditSheetOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Atualizar Exercício
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

        {exercises.length === 0 && !loading && (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exercício encontrado</h3>
            <p className="text-gray-600 mb-4">Comece criando seu primeiro exercício personalizado.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Exercício
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExerciseLibrary