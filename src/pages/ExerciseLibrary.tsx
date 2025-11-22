import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Dumbbell, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  Search,
  Filter
} from 'lucide-react'
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
  const { user, profile, loading } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  
  // Estados para busca e filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>('all')

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

  // Dificuldades e grupos musculares para filtro
  const difficulties = [
    { value: 'beginner', label: 'Iniciante' },
    { value: 'intermediate', label: 'Intermediário' },
    { value: 'advanced', label: 'Avançado' }
  ]

  const muscleGroups = [
    'Peito',
    'Costas',
    'Ombros',
    'Bíceps',
    'Tríceps',
    'Antebraço',
    'Abdômen',
    'Lombar',
    'Glúteos',
    'Quadríceps',
    'Isquiotibiais',
    'Panturrilhas',
    'Pernas',
    'Core'
  ]

  // Buscar exercícios
  const fetchExercises = async () => {
    if (!user) return

    try {
      setPageLoading(true)
      let query = supabase
        .from('exercises_library')
        .select('*')
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty_level', difficultyFilter)
      }

      if (muscleGroupFilter !== 'all') {
        query = query.contains('muscle_groups', `[${muscleGroupFilter}]`)
      }

      const { data, error } = await query

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
      setPageLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchExercises()
    }
  }, [user?.id, loading, searchTerm, difficultyFilter, muscleGroupFilter])

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
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                Biblioteca de Exercícios
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Gerencie sua biblioteca pessoal de exercícios
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-primary dark:text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Exercício
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-card border-gray-200 dark:border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Criar Novo Exercício</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateExercise} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="dark:text-gray-200">Nome do Exercício *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Supino Reto"
                        required
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="dark:text-gray-200">Nível de Dificuldade</Label>
                      <select
                        id="difficulty"
                        value={formData.difficulty_level}
                        onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                        className="w-full p-2 border rounded-md dark:bg-background/50 dark:border-white/10 dark:text-white"
                      >
                        <option value="beginner">Iniciante</option>
                        <option value="intermediate">Intermediário</option>
                        <option value="advanced">Avançado</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="dark:text-gray-200">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva como realizar o exercício..."
                      rows={3}
                      className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="muscles" className="dark:text-gray-200">Grupos Musculares</Label>
                      <Input
                        id="muscles"
                        value={formData.muscle_groups}
                        onChange={(e) => setFormData({ ...formData, muscle_groups: e.target.value })}
                        placeholder="Peito, Ombros, Tríceps"
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Separe com vírgula</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipment" className="dark:text-gray-200">Equipamentos</Label>
                      <Input
                        id="equipment"
                        value={formData.equipment_needed}
                        onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
                        placeholder="Barra, Halteres, Banco"
                        className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Separe com vírgula</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video" className="dark:text-gray-200">URL do Vídeo</Label>
                    <Input
                      id="video"
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="public"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
                      className="dark:border-white/30"
                    />
                    <Label htmlFor="public" className="dark:text-gray-200">Tornar este exercício público</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-primary">
                      Criar Exercício
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar exercícios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Dificuldades</SelectItem>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
              <SelectTrigger className="bg-white dark:bg-card/50 border-gray-200 dark:border-white/10 dark:text-white">
                <SelectValue placeholder="Grupo Muscular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Grupos</SelectItem>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Exercícios */}
        {pageLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="relative bg-white/80 dark:bg-card/30 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{exercise.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {exercise.is_public ? (
                        <Eye className="h-4 w-4 text-green-600 dark:text-green-400" title="Público" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" title="Privado" />
                      )}
                      {canEditExercise(exercise) && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditExercise(exercise)}
                            className="dark:text-gray-400 dark:hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="dark:text-gray-400 dark:hover:text-white">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-card border-gray-200 dark:border-white/10">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-white">Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-gray-400">
                                  Tem certeza que deseja deletar o exercício "{exercise.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:border-white/10 dark:text-gray-300">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteExercise(exercise.id)} className="bg-red-600 hover:bg-red-700 text-white">
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
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{exercise.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Músculos:</p>
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
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Equipamentos:</p>
                        <div className="flex flex-wrap gap-1">
                          {exercise.equipment_needed.map((equipment, index) => (
                            <Badge key={index} variant="outline" className="text-xs dark:border-white/20 dark:text-gray-300">
                              {equipment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {exercise.difficulty_level && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Dificuldade:</p>
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
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {canEditExercise(exercise) ? 'Seu exercício' : 'Exercício público'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {exercises.length === 0 && !pageLoading && (
          <div className="text-center py-12">
            <Dumbbell className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum exercício encontrado</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Comece criando seu primeiro exercício personalizado.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-primary">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Exercício
            </Button>
          </div>
        )}

        {/* Sheet de Edição */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent className="w-[400px] sm:w-[540px] bg-white dark:bg-card border-l border-gray-200 dark:border-white/10">
            <SheetHeader>
              <SheetTitle className="text-gray-900 dark:text-white">Editar Exercício</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleUpdateExercise} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="dark:text-gray-200">Nome do Exercício *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Supino Reto"
                  required
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-difficulty" className="dark:text-gray-200">Nível de Dificuldade</Label>
                <select
                  id="edit-difficulty"
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full p-2 border rounded-md dark:bg-background/50 dark:border-white/10 dark:text-white"
                >
                  <option value="beginner">Iniciante</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="dark:text-gray-200">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva como realizar o exercício..."
                  rows={3}
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-muscles" className="dark:text-gray-200">Grupos Musculares</Label>
                  <Input
                    id="edit-muscles"
                    value={formData.muscle_groups}
                    onChange={(e) => setFormData({ ...formData, muscle_groups: e.target.value })}
                    placeholder="Peito, Ombros, Tríceps"
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Separe com vírgula</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-equipment" className="dark:text-gray-200">Equipamentos</Label>
                  <Input
                    id="edit-equipment"
                    value={formData.equipment_needed}
                    onChange={(e) => setFormData({ ...formData, equipment_needed: e.target.value })}
                    placeholder="Barra, Halteres, Banco"
                    className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Separe com vírgula</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-video" className="dark:text-gray-200">URL do Vídeo</Label>
                <Input
                  id="edit-video"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="dark:bg-background/50 dark:border-white/10 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked as boolean })}
                  className="dark:border-white/30"
                />
                <Label htmlFor="edit-public" className="dark:text-gray-200">Tornar este exercício público</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditSheetOpen(false)} className="dark:border-white/10 dark:text-gray-300">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-primary">
                  Atualizar Exercício
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default ExerciseLibrary