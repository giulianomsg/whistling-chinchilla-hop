import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  User, Mail, Phone, ArrowLeft, Dumbbell, Utensils, Timer, 
  Loader2, AlertCircle, Target, Calendar, Bell, Trash2, Plus
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'
import ClientWorkoutHistory from '@/components/professional/ClientWorkoutHistory'

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  // Dados
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [clientDetails, setClientDetails] = useState<any>(null)
  const [clientWorkouts, setClientWorkouts] = useState<any[]>([])
  const [clientMealPlans, setClientMealPlans] = useState<any[]>([])
  
  // Listas para seleção (Atribuição)
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([])
  const [availableMealPlans, setAvailableMealPlans] = useState<any[]>([])

  // States dos Modais
  const [isAssignWorkoutOpen, setIsAssignWorkoutOpen] = useState(false)
  const [isAssignMealPlanOpen, setIsAssignMealPlanOpen] = useState(false)
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('')
  const [selectedMealPlanId, setSelectedMealPlanId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user) return
      setLoading(true)
      try {
        // 1. Buscar dados do cliente
        const [profileRes, detailsRes, cWorkouts, cMeals] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', id).single(),
          supabase.from('client_details').select('*').eq('profile_id', id).single(),
          supabase.from('client_workouts').select(`*, workout:workouts(*)`).eq('client_id', id).order('created_at', { ascending: false }),
          supabase.from('client_meal_plans').select(`*, meal_plan:meal_plans(*)`).eq('client_id', id).order('created_at', { ascending: false })
        ])
        
        // 2. Buscar planos disponíveis do profissional para atribuir
        const [myWorkouts, myMealPlans] = await Promise.all([
          supabase.from('workouts').select('*').eq('professional_id', user.id).eq('is_template', false),
          supabase.from('meal_plans').select('*').eq('nutritionist_id', user.id)
        ])

        setClientProfile(profileRes.data)
        setClientDetails(detailsRes.data)
        setClientWorkouts(cWorkouts.data || [])
        setClientMealPlans(cMeals.data || [])
        setAvailableWorkouts(myWorkouts.data || [])
        setAvailableMealPlans(myMealPlans.data || [])

      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, user])

  // Função de Atribuir Treino
  const handleAssignWorkout = async () => {
    if (!selectedWorkoutId || !user) return
    try {
      // Desativar treinos anteriores? Opcional. Aqui vamos apenas adicionar um novo.
      const { error } = await supabase.from('client_workouts').insert({
        client_id: id,
        workout_id: selectedWorkoutId,
        professional_id: user.id,
        start_date: startDate,
        status: 'active'
      })
      if (error) throw error
      showSuccess('Treino atribuído com sucesso!')
      setIsAssignWorkoutOpen(false)
      // Reload manual simples dos treinos
      const { data } = await supabase.from('client_workouts').select(`*, workout:workouts(*)`).eq('client_id', id).order('created_at', { ascending: false })
      setClientWorkouts(data || [])
    } catch (err) { showError('Erro ao atribuir treino') }
  }

  // Função de Atribuir Dieta
  const handleAssignMealPlan = async () => {
    if (!selectedMealPlanId || !user) return
    try {
      const { error } = await supabase.from('client_meal_plans').insert({
        client_id: id,
        meal_plan_id: selectedMealPlanId,
        nutritionist_id: user.id,
        start_date: startDate,
        status: 'active'
      })
      if (error) throw error
      showSuccess('Dieta atribuída com sucesso!')
      setIsAssignMealPlanOpen(false)
      const { data } = await supabase.from('client_meal_plans').select(`*, meal_plan:meal_plans(*)`).eq('client_id', id).order('created_at', { ascending: false })
      setClientMealPlans(data || [])
    } catch (err) { showError('Erro ao atribuir dieta') }
  }

  // Função para desvincular (Excluir atribuição)
  const handleRemoveAssignment = async (table: 'client_workouts' | 'client_meal_plans', itemId: string) => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', itemId)
      if (error) throw error
      showSuccess('Removido com sucesso!')
      // Atualizar listas localmente
      if (table === 'client_workouts') setClientWorkouts(prev => prev.filter(i => i.id !== itemId))
      else setClientMealPlans(prev => prev.filter(i => i.id !== itemId))
    } catch (err) { showError('Erro ao remover') }
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app/clients')} className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{clientProfile?.full_name || 'Cliente'}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {clientProfile?.email}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 w-full justify-start p-1">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Treinos</TabsTrigger>
            <TabsTrigger value="meal-plans" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Dietas</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Histórico</TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Perfil</TabsTrigger>
          </TabsList>

          {/* TAB TREINOS */}
          <TabsContent value="workouts">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2"><Dumbbell className="text-blue-400" /> Treinos Atribuídos</CardTitle>
                
                <Dialog open={isAssignWorkoutOpen} onOpenChange={setIsAssignWorkoutOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white"><Plus className="mr-2 h-4 w-4"/> Atribuir Treino</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader><DialogTitle>Atribuir Treino ao Aluno</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Selecione o Treino</Label>
                        <Select onValueChange={setSelectedWorkoutId}>
                          <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Escolha um treino..."/></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10 text-white">
                            {availableWorkouts.map(w => (
                              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data de Início</Label>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/>
                      </div>
                      <Button onClick={handleAssignWorkout} className="w-full bg-blue-600 hover:bg-blue-500">Confirmar Atribuição</Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                          <div className="flex gap-3 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(cw.start_date).toLocaleDateString()}</span>
                            <span>• {cw.workout.days_per_week}x semana</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cw.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                            {cw.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Button size="icon" variant="ghost" onClick={() => handleRemoveAssignment('client_workouts', cw.id)} className="text-red-400 hover:bg-red-900/20 hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB DIETAS */}
          <TabsContent value="meal-plans">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2"><Utensils className="text-green-400" /> Planos Alimentares</CardTitle>
                
                <Dialog open={isAssignMealPlanOpen} onOpenChange={setIsAssignMealPlanOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white"><Plus className="mr-2 h-4 w-4"/> Atribuir Dieta</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader><DialogTitle>Atribuir Dieta ao Aluno</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Selecione o Plano</Label>
                        <Select onValueChange={setSelectedMealPlanId}>
                          <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Escolha uma dieta..."/></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10 text-white">
                            {availableMealPlans.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data de Início</Label>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/>
                      </div>
                      <Button onClick={handleAssignMealPlan} className="w-full bg-green-600 hover:bg-green-500">Confirmar Atribuição</Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                          <div className="flex gap-3 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><Target className="h-3 w-3"/> {cm.meal_plan.daily_calories_target} kcal</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cm.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                            {cm.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Button size="icon" variant="ghost" onClick={() => handleRemoveAssignment('client_meal_plans', cm.id)} className="text-red-400 hover:bg-red-900/20 hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
               <ClientWorkoutHistory clientId={id!} />
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle className="text-white">Objetivos</CardTitle></CardHeader>
                <CardContent className="text-gray-300">{clientDetails?.goals || '---'}</CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardHeader><CardTitle className="text-white">Restrições</CardTitle></CardHeader>
                <CardContent className="text-gray-300">{clientDetails?.health_restrictions || '---'}</CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails