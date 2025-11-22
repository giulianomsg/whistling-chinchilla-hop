import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { 
  User, Mail, Phone, ArrowLeft, Dumbbell, Utensils, Timer, 
  Loader2, AlertCircle, Target, Calendar, Clock, 
  Bell, TrendingUp, BarChart3, Phone as PhoneIcon
} from 'lucide-react'
import { supabase } from '../integrations/supabase/client'
import { showSuccess, showError } from '../utils/toast'
import ClientWorkoutHistory from '../components/professional/ClientWorkoutHistory'

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [clientDetails, setClientDetails] = useState<any>(null)
  const [clientWorkouts, setClientWorkouts] = useState<any[]>([])
  const [clientMealPlans, setClientMealPlans] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [profileRes, detailsRes, workoutsRes, mealsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', id).single(),
          supabase.from('client_details').select('*').eq('profile_id', id).single(),
          supabase.from('client_workouts').select(`*, workout:workouts(*)`).eq('client_id', id).order('created_at', { ascending: false }),
          supabase.from('client_meal_plans').select(`*, meal_plan:meal_plans(*)`).eq('client_id', id).order('created_at', { ascending: false })
        ])
        
        if (profileRes.error) throw profileRes.error
        setClientProfile(profileRes.data)
        setClientDetails(detailsRes.data)
        setClientWorkouts(workoutsRes.data || [])
        setClientMealPlans(mealsRes.data || [])
      } catch (error) {
        console.error(error)
        navigate('/app/clients')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const sendNotification = async () => {
    // Placeholder for logic
    showSuccess('Notificação enviada (Simulação)')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app/clients')} className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{clientProfile?.full_name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {clientProfile?.email}</span>
                {clientProfile?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {clientProfile?.phone}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={sendNotification} className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
              <Bell className="h-4 w-4 mr-2" /> Notificar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 w-full justify-start">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Treinos</TabsTrigger>
            <TabsTrigger value="meal-plans" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Dietas</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Histórico</TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Informações</TabsTrigger>
          </TabsList>

          {/* Treinos */}
          <TabsContent value="workouts">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2"><Dumbbell className="text-blue-400" /> Treinos Atribuídos</CardTitle>
                <Button onClick={() => navigate('/app/planner')} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">Novo Treino</Button>
              </CardHeader>
              <CardContent>
                {clientWorkouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhum treino atribuído.</div>
                ) : (
                  <div className="space-y-4">
                    {clientWorkouts.map(cw => (
                      <div key={cw.id} className="bg-black/20 p-4 rounded-lg border border-white/5 flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{cw.workout.name}</h4>
                          <p className="text-sm text-gray-400">{cw.workout.days_per_week} dias/sem • {cw.workout.objective}</p>
                        </div>
                        <Badge className={cw.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                          {cw.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dietas */}
          <TabsContent value="meal-plans">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2"><Utensils className="text-green-400" /> Planos Alimentares</CardTitle>
                <Button onClick={() => navigate('/app/meal-planner')} size="sm" className="bg-green-600 hover:bg-green-500 text-white">Nova Dieta</Button>
              </CardHeader>
              <CardContent>
                {clientMealPlans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhuma dieta atribuída.</div>
                ) : (
                  <div className="space-y-4">
                    {clientMealPlans.map(cm => (
                      <div key={cm.id} className="bg-black/20 p-4 rounded-lg border border-white/5 flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{cm.meal_plan.name}</h4>
                          <p className="text-sm text-gray-400">{cm.meal_plan.daily_calories_target} kcal • {cm.meal_plan.objective}</p>
                        </div>
                        <Badge className={cm.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                          {cm.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico (Reutilizando Componente com Wrapper de Tema se necessário) */}
          <TabsContent value="history">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Timer className="text-orange-400"/> Histórico de Execução</h3>
               {/* O componente interno deve herdar estilos ou ser transparente. 
                   Assumindo que o ClientWorkoutHistory usará classes Tailwind padrão que se adaptam ao dark mode global */}
               <ClientWorkoutHistory clientId={id!} />
            </div>
          </TabsContent>

          {/* Info Pessoal */}
          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle className="text-white flex gap-2"><Target className="text-purple-400"/> Objetivos</CardTitle></CardHeader>
                <CardContent className="text-gray-300">
                  {clientDetails?.goals || 'Não informado'}
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle className="text-white flex gap-2"><AlertCircle className="text-red-400"/> Restrições</CardTitle></CardHeader>
                <CardContent className="text-gray-300">
                  {clientDetails?.health_restrictions || 'Nenhuma restrição'}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails