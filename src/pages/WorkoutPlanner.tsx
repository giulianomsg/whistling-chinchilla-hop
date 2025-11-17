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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dumbbell, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Calendar, 
  Target,
  Clock,
  Loader2,
  ChevronRight,
  GripVertical
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { supabase } from '@/integrations/supabase/client'

interface Workout {
  id: string
  name: string
  description: string | null
  objective: string | null
  duration_weeks: number
  days_per_week: number | null
  professional_id: string
  is_template: boolean
  created_at: string
  updated_at: string
}

interface Exercise {
  id: string
  name: string
  description: string | null
  muscle_groups: string[] | null
  difficulty_level: string | null
  is_public: boolean
  created_by: string
}

interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  day_number: number
  order_index: number
  sets: number
  reps: string | null
  weight: number | null
  rest_time_seconds: number | null
  notes: string | null
  exercise?: Exercise
}

const WorkoutPlanner: React.FC = () => {
  const { user, profile, loading } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  // Dialog states
  const [isCreateWorkoutDialogOpen, setIsCreateWorkoutDialogOpen] = useState(false)
  const [isEditWorkoutDialogOpen, setIsEditWorkoutDialogOpen] = useState(false)
  const [isManageExercisesSheetOpen, setIsManageExercisesSheetOpen] = useState(false)
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false)
  const [isEditExerciseDialogOpen, setIsEditExerciseDialogOpen] = useState(false)

  // Form states
  const [workoutFormData, setWorkoutFormData] = useState({
    name: '',
    description: '',
    objective: '',
    duration_weeks: 4,
    days_per_week: 3
  })

  const [exerciseFormData, setExerciseFormData] = useState({
    exercise_id: '',
    day_number: 1,
    sets: 3,
    reps: '8-12',
    weight: null,
    rest_time_seconds: 60,
    notes: ''
  })

  // Estado para edição de exercício do plano
  const [editingExerciseDetails, setEditingExerciseDetails] = useState<WorkoutExercise | null>(null)
  const [editExerciseFormData, setEditExerciseFormData] = useState({
    sets: 3,
    reps: '8-12',
    weight: null,
    rest_time_seconds: 60,
    notes: ''
  })

  // Buscar workouts
  const fetchWorkouts = async () => {
    if (!user) return

    try {
      setPageLoading(true)
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar workouts:', error)
        showError('Erro ao carregar planos de treino')
        return
      }

      setWorkouts(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao carregar planos de treino')
    } finally {
      setPageLoading(false)
    }
  }

  // Buscar exercícios disponíveis
  const fetchExercises = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .order('name', { ascending: true })

      if (error) {
        console.error('Erro ao buscar exercícios:', error)
        return
      }

      setExercises(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar exercícios de um workout específico
  const fetchWorkoutExercises = async (workoutId: string) => {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises_library(*)
        `)
        .eq('workout_id', workoutId)
        .order('day_number', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Erro ao buscar exercícios do workout:', error)
        return
      }

      // ✅ PROTEGER CONTRA NULL: Filtrar itens com exercise null
      const filteredData = (data || []).filter(item => item.exercise !== null)
      setWorkoutExercises(filteredData)
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchWorkouts()
      fetchExercises()
    }
  }, [user?.id, loading])

  // Resetar formulário de workout
  const resetWorkoutForm = () => {
    setWorkoutFormData({
      name: '',
      description: '',
      objective: '',
      duration_weeks: 4,
      days_per_week: 3
    })
  }

  // Resetar formulário de exercício
  const resetExerciseForm = () => {
    setExerciseFormData({
      exercise_id: '',
      day_number: 1,
      sets: 3,
      reps: '8-12',
      weight: null,
      rest_time_seconds: 60,
      notes: ''
    })
  }

  // Resetar formulário de edição de exercício
  const resetEditExerciseForm = () => {
    setEditExerciseFormData({
      sets: 3,
      reps: '8-12',
      weight: null,
      rest_time_seconds: 60,
      notes: ''
    })
    setEditingExerciseDetails(null)
  }

  // Criar workout
  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const workoutData = {
        name: workoutFormData.name,
        description: workoutFormData.description || null,
        objective: workoutFormData.objective || null,
        duration_weeks: workoutFormData.duration_weeks,
        days_per_week: workoutFormData.days_per_week,
        professional_id: user.id,
        is_template: false
      }

      const { error } = await supabase
        .from('workouts')
        .insert(workoutData)

      if (error) {
        console.error('Erro ao criar workout:', error)
        showError('Erro ao criar plano de treino')
        return
      }

      showSuccess('Plano de treino criado com sucesso!')
      setIsCreateWorkoutDialogOpen(false)
      resetWorkoutForm()
      fetchWorkouts()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao criar plano de treino')
    }
  }

  // Editar workout
  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout)
    setWorkoutFormData({
      name: workout.name,
      description: workout.description || '',
      objective: workout.objective || '',
      duration_weeks: workout.duration_weeks,
      days_per_week: workout.days_per_week || 3
    })
    setIsEditWorkoutDialogOpen(true)
  }

  // Atualizar workout
  const handleUpdateWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedWorkout) return

    try {
      const workoutData = {
        name: workoutFormData.name,
        description: workoutFormData.description || null,
        objective: workoutFormData.objective || null,
        duration_weeks: workoutFormData.duration_weeks,
        days_per_week: workoutFormData.days_per_week
      }

      const { error } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', selectedWorkout.id)

      if (error) {
        console.error('Erro ao atualizar workout:', error)
        showError('Erro ao atualizar plano de treino')
        return
      }

      showSuccess('Plano de treino atualizado com sucesso!')
      setIsEditWorkoutDialogOpen(false)
      setSelectedWorkout(null)
      resetWorkoutForm()
      fetchWorkouts()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao atualizar plano de treino')
    }
  }

  // Deletar workout
  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)

      if (error) {
        console.error('Erro ao deletar workout:', error)
        showError('Erro ao deletar plano de treino')
        return
      }

      showSuccess('Plano de treino deletado com sucesso!')
      fetchWorkouts()
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao deletar plano de treino')
    }
  }

  // Gerenciar exercícios de um workout
  const handleManageExercises = async (workout: Workout) => {
    setSelectedWorkout(workout)
    await fetchWorkoutExercises(workout.id)
    setIsManageExercisesSheetOpen(true)
  }

  // Adicionar exercício ao workout
  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedWorkout) return

    try {
      // Obter o próximo order_index para este dia
      const dayExercises = workoutExercises.filter(we => we.day_number === exerciseFormData.day_number)
      const nextOrderIndex = dayExercises.length + 1

      const workoutExerciseData = {
        workout_id: selectedWorkout.id,
        exercise_id: exerciseFormData.exercise_id,
        day_number: exerciseFormData.day_number,
        order_index: nextOrderIndex,
        sets: exerciseFormData.sets,
        reps: exerciseFormData.reps,
        weight: exerciseFormData.weight,
        rest_time_seconds: exerciseFormData.rest_time_seconds,
        notes: exerciseFormData.notes || null
      }

      const { error } = await supabase
        .from('workout_exercises')
        .insert(workoutExerciseData)

      if (error) {
        console.error('Erro ao adicionar exercício:', error)
        showError('Erro ao adicionar exercício ao plano')
        return
      }

      showSuccess('Exercício adicionado com sucesso!')
      setIsAddExerciseDialogOpen(false)
      resetExerciseForm()
      fetchWorkoutExercises(selectedWorkout.id)
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao adicionar exercício')
    }
  }

  // Editar exercício do workout
  const handleEditWorkoutExercise = (workoutExercise: WorkoutExercise) => {
    setEditingExerciseDetails(workoutExercise)
    setEditExerciseFormData({
      sets: workoutExercise.sets,
      reps: workoutExercise.reps || '8-12',
      weight: workoutExercise.weight,
      rest_time_seconds: workoutExercise.rest_time_seconds || 60,
      notes: workoutExercise.notes || ''
    })
    setIsEditExerciseDialogOpen(true)
  }

  // Atualizar exercício do workout
  const handleUpdateWorkoutExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExerciseDetails) return

    try {
      const updateData = {
        sets: editExerciseFormData.sets,
        reps: editExerciseFormData.reps,
        weight: editExerciseFormData.weight,
        rest_time_seconds: editExerciseFormData.rest_time_seconds,
        notes: editExerciseFormData.notes || null
      }

      const { error } = await supabase
        .from('workout_exercises')
        .update(updateData)
        .eq('id', editingExerciseDetails.id)

      if (error) {
        console.error('Erro ao atualizar exercício do workout:', error)
        showError('Erro ao atualizar exercício do plano')
        return
      }

      showSuccess('Exercício atualizado com sucesso!')
      setIsEditExerciseDialogOpen(false)
      resetEditExerciseForm()
      if (selectedWorkout) {
        fetchWorkoutExercises(selectedWorkout.id)
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao atualizar exercício')
    }
  }

  // Deletar exercício do workout
  const handleDeleteWorkoutExercise = async (workoutExerciseId: string) => {
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', workoutExerciseId)

      if (error) {
        console.error('Erro ao deletar exercício do workout:', error)
        showError('Erro ao remover exercício do plano')
        return
      }

      showSuccess('Exercício removido com sucesso!')
      if (selectedWorkout) {
        fetchWorkoutExercises(selectedWorkout.id)
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
      showError('Erro inesperado ao remover exercício')
    }
  }

  // Agrupar exercícios por dia
  const getExercisesByDay = () => {
    const grouped: { [key: number]: WorkoutExercise[] } = {}
    workoutExercises.forEach(we => {
      if (!grouped[we.day_number]) {
        grouped[we.day_number] = []
      }
      grouped[we.day_number].push(we)
    })
    return grouped
  }

  const exercisesByDay = getExercisesByDay()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Dumbbell className="h-8 w-8 text-blue-600" />
                Montador de Planos de Treino
              </h1>
              <p className="mt-2 text-gray-600">
                Crie e gerencie planos de treino personalizados
              </p>
            </div>
            
            <Dialog open={isCreateWorkoutDialogOpen} onOpenChange={setIsCreateWorkoutDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Plano de Treino</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWorkout} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workout-name">Nome do Plano *</Label>
                    <Input
                      id="workout-name## 🎯 **PROBLEMA IDENTIFICADO: ARRAY.MAP() COM ITENS NULOS**

O erro está em algum componente que usa `.map()` em um array que contém itens `null`. Pelos arquivos que vimos, os culpados mais prováveis são `MyClients` ou `WorkoutPlanner`.

## 🔧 **SOLUÇÃO RÁPIDA: ADICIONAR PROGRESSIVE DEBUG**

<dyad-write path="src/contexts/AuthContext.tsx" description="AuthContext com debugging progressivo para identificar o erro">
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

// Tipagem do Perfil
type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'admin' | 'professional' | 'client'
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Funções de Auth
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'client' } }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Buscar perfil de forma simples e assíncrona
  const refreshProfile = async () => {
    if (!user) return
    
    try {
      console.log('🔍 [PROFILE] Buscando perfil completo do usuário...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data && !error) {
        console.log('✅ [PROFILE] Perfil completo encontrado:', data)
        setProfile(data)
      } else {
        console.warn('❌ [PROFILE] Erro ao buscar perfil:', error)
      }
    } catch (error) {
      console.error('❌ [PROFILE] Erro inesperado:', error)
    }
  }

  // useEffect principal - simplificado ao máximo
  useEffect(() => {
    console.log('🚀 [AUTH] AuthProvider montado')
    
    // Listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 [AUTH] Evento: ${event}`, 'User:', session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Se tem usuário, buscar perfil de forma assíncrona
        if (session?.user) {
          // Criar perfil básico a partir do usuário auth
          const basicProfile: Profile = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            phone: session.user.user_metadata?.phone || null,
            role: session.user.user_metadata?.role || 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          // 🔍 DEBUGGING DETALHADO
          console.log('🔍 [AUTH] Dados do usuário auth:', {
            email: session.user.email,
            metadata_role: session.user.user_metadata?.role,
            metadata_full_name: session.user.user_metadata?.full_name,
            basic_profile_role: basicProfile.role,
            basic_profile_full_name: basicProfile.full_name
          })
          
          console.log('🔍 [AUTH] Definindo perfil básico:', basicProfile)
          setProfile(basicProfile)
          
          // Tentar buscar perfil completo em background
          setTimeout(() => {
            refreshProfile()
          }, 1000) // Pequeno delay para não bloquear UI
          
        } else {
          console.log('🔍 [AUTH] Usuário null, limpando perfil')
          setProfile(null)
        }
        
        console.log('🏁 [AUTH] Loading = false (IMEDIATO)')
        setLoading(false)
      }
    )

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}