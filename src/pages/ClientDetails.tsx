import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  ArrowLeft,
  Dumbbell,
  Utensils,
  Timer,
  Loader2,
  AlertCircle,
  CheckCircle,
  Target,
  Clock
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'
import ClientWorkoutHistory from '@/components/professional/ClientWorkoutHistory'

interface ClientProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: string
  created_at: string
}

interface ClientDetails {
  goals: string | null
  anamnesis_data: any
  emergency_contact: any
  health_restrictions: string | null
}

interface ClientWorkout {
  id: string
  client_id: string
  workout_id: string
  professional_id: string
  start_date: string
  end_date: string | null
  status: string
  notes: string | null
  workout: {
    id: string
    name: string
    description: string | null
    objective: string | null
    duration_weeks: number
    days_per_week: number | null
  }
}

interface ClientMealPlan {
  id: string
  client_id: string
  meal_plan_id: string
  nutritionist_id: string
  start_date: string
  end_date: string | null
  status: string
  notes: string | null
  meal_plan: {
    id: string
    name: string
    description: string | null
    objective: string | null
    daily_calories_target: number | null
    daily_protein_target: number | null
    daily_carbs_target: number | null
    daily_fat_target: number | null
  }
}

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null)
  const [clientWorkouts, setClientWorkouts] = useState<ClientWorkout[]>([])
  const [clientMealPlans, setClientMealPlans] = useState<ClientMealPlan[]>([])

  // Verificar se o profissional tem acesso a este cliente
  const checkClientAccess = async () => {
    if (!id || !user) return false

    try {
      const { data, error } = await supabase
        .from('client_professionals')
        .select('*')
        .eq('client_id', id)
        .eq('professional_id', user.id)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        console.error('Erro ao verificar acesso:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro inesperado:', error)
      return false
    }
  }

  // Buscar perfil do cliente
  const fetchClientProfile = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        return
      }

      setClientProfile(data)
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar detalhes do cliente
  const fetchClientDetails = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('client_details')
        .select('*')
        .eq('profile_id', id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar detalhes:', error)
        return
      }

      setClientDetails(data)
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar treinos do cliente
  const fetchClientWorkouts = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('client_workouts')
        .select(`
          *,
          workout:workouts(id, name, description, objective, duration_weeks, days_per_week)
        `)
        .eq('client_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar treinos:', error)
        return
      }

      setClientWorkouts(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  // Buscar planos alimentares do cliente
  const fetchClientMealPlans = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('client_meal_plans')
        .select(`
          *,
          meal_plan:meal_plans(id, name, description, objective, daily_calories_target, daily_protein_target, daily_carbs_target, daily_fat_target)
        `)
        .eq('client_id', id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar planos alimentares:', error)
        return
      }

      setClientMealPlans(data || [])
    } catch (error) {
      console.error('Erro inesperado:', error)
    }
  }

  useEffect(() => {
    const initializePage = async () => {
      if (!id) return

      setLoading(true)
      
      // Verificar acesso
      const hasAccess = await checkClientAccess()
      if (!hasAccess) {
        showError('Você não tem permissão para acessar este cliente')
        navigate('/app/clients')
        return
      }

      // Buscar dados
      await Promise.all([
        fetchClientProfile(),
        fetchClientDetails(),
        fetchClientWorkouts(),
        fetchClientMealPlans()
      ])

      setLoading(false)
    }

    initializePage()
  }, [id, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando detalhes do cliente...</p>
        </div>
      </div>
    )
  }

  if (!clientProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cliente não encontrado</h2>
          <p className="text-gray-600 mb-4">O cliente que você está procurando não existe ou não está disponível.</p>
          <Button onClick={() => navigate('/app/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Clientes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/app/clients')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalhes do Cliente
            </h1>
          </div>

          {/* Card de Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium text-gray-900">
                      {clientProfile.full_name || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{clientProfile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium text-gray-900">
                      {clientProfile.phone || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliente desde</p>
                    <p className="font-medium text-gray-900">
                      {new Date(clientProfile.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Informações Detalhadas */}
        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Treinos Atuais
            </TabsTrigger>
            <TabsTrigger value="meal-plans" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Planos Alimentares
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados Pessoais
            </TabsTrigger>
          </TabsList>

          {/* Treinos Atuais */}
          <TabsContent value="workouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-blue-600" />
                  Treinos Atribuídos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientWorkouts.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino atribuído</h3>
                    <p className="text-gray-600 mb-4">
                      Este cliente ainda não possui treinos atribuídos.
                    </p>
                    <Button onClick={() => navigate('/app/planner')}>
                      Atribuir Treino
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientWorkouts.map((clientWorkout) => (
                      <div key={clientWorkout.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {clientWorkout.workout.name}
                            </h3>
                            {clientWorkout.workout.description && (
                              <p className="text-gray-600 mb-3">
                                {clientWorkout.workout.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Início: {new Date(clientWorkout.start_date).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{clientWorkout.workout.duration_weeks} semanas</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>{clientWorkout.workout.days_per_week}x por semana</span>
                              </div>
                            </div>
                            {clientWorkout.workout.objective && (
                              <div className="mt-2">
                                <Badge variant="secondary">
                                  {clientWorkout.workout.objective}
                                </Badge>
                              </div>
                            )}
                            {clientWorkout.notes && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-800">
                                  <strong>Nota:</strong> {clientWorkout.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <Badge 
                              variant={clientWorkout.status === 'active' ? 'default' : 'secondary'}
                            >
                              {clientWorkout.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Planos Alimentares */}
          <TabsContent value="meal-plans">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-green-600" />
                  Planos Alimentares
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientMealPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano alimentar atribuído</h3>
                    <p className="text-gray-600 mb-4">
                      Este cliente ainda não possui planos alimentares atribuídos.
                    </p>
                    <Button onClick={() => navigate('/app/meal-planner')}>
                      Atribuir Plano Alimentar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientMealPlans.map((clientMealPlan) => (
                      <div key={clientMealPlan.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {clientMealPlan.meal_plan.name}
                            </h3>
                            {clientMealPlan.meal_plan.description && (
                              <p className="text-gray-600 mb-3">
                                {clientMealPlan.meal_plan.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Início: {new Date(clientMealPlan.start_date).toLocaleDateString('pt-BR')}</span>
                              </div>
                              {clientMealPlan.meal_plan.daily_calories_target && (
                                <div className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  <span>{clientMealPlan.meal_plan.daily_calories_target} cal/dia</span>
                                </div>
                              )}
                            </div>
                            {clientMealPlan.meal_plan.objective && (
                              <div className="mt-2">
                                <Badge variant="secondary">
                                  {clientMealPlan.meal_plan.objective}
                                </Badge>
                              </div>
                            )}
                            {clientMealPlan.notes && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-800">
                                  <strong>Nota:</strong> {clientMealPlan.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <Badge 
                              variant={clientMealPlan.status === 'active' ? 'default' : 'secondary'}
                            >
                              {clientMealPlan.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico de Execução */}
          <TabsContent value="history">
            <ClientWorkoutHistory clientId={id} />
          </TabsContent>

          {/* Dados Pessoais */}
          <TabsContent value="personal">
            <div className="space-y-6">
              {/* Objetivos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientDetails?.goals ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{clientDetails.goals}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nenhum objetivo informado</p>
                  )}
                </CardContent>
              </Card>

              {/* Restrições de Saúde */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Restrições de Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientDetails?.health_restrictions ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{clientDetails.health_restrictions}</p>
                  ) : (
                    <p className="text-gray-500 italic">Nenhuma restrição informada</p>
                  )}
                </CardContent>
              </Card>

              {/* Contato de Emergência */}
              {clientDetails?.emergency_contact && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-orange-600" />
                      Contato de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clientDetails.emergency_contact.name && (
                        <div>
                          <p className="text-sm text-gray-600">Nome</p>
                          <p className="font-medium">{clientDetails.emergency_contact.name}</p>
                        </div>
                      )}
                      {clientDetails.emergency_contact.phone && (
                        <div>
                          <p className="text-sm text-gray-600">Telefone</p>
                          <p className="font-medium">{clientDetails.emergency_contact.phone}</p>
                        </div>
                      )}
                      {clientDetails.emergency_contact.relationship && (
                        <div>
                          <p className="text-sm text-gray-600">Relação</p>
                          <p className="font-medium">{clientDetails.emergency_contact.relationship}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails