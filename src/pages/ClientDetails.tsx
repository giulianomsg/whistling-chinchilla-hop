import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch' // Certifique-se de ter este componente
import { Separator } from '@/components/ui/separator' // Certifique-se de ter este componente
import { 
  User, Mail, Phone, ArrowLeft, Dumbbell, Utensils, Timer, 
  Loader2, AlertCircle, Target, Calendar, Trash2, Plus,
  FileText, Save, HeartPulse, Apple, Activity, BedDouble
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'
import ClientWorkoutHistory from '@/components/professional/ClientWorkoutHistory'

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [clientDetails, setClientDetails] = useState<any>(null)
  const [clientWorkouts, setClientWorkouts] = useState<any[]>([])
  const [clientMealPlans, setClientMealPlans] = useState<any[]>([])
  
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([])
  const [availableMealPlans, setAvailableMealPlans] = useState<any[]>([])

  const [isAssignWorkoutOpen, setIsAssignWorkoutOpen] = useState(false)
  const [isAssignMealPlanOpen, setIsAssignMealPlanOpen] = useState(false)
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('')
  const [selectedMealPlanId, setSelectedMealPlanId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  // --- ESTADO DA ANAMNESE PROFISSIONAL (JSONB) ---
  const [anamnesisForm, setAnamnesisForm] = useState({
    // Dados Médicos
    medical_history: '',
    medications: '',
    surgeries: '',
    injuries: '',
    family_history: '',
    allergies: '',
    
    // Estilo de Vida
    occupation: '',
    sleep_hours: '',
    sleep_quality: '', // 'good', 'average', 'bad'
    stress_level: '', // 'low', 'medium', 'high'
    smoker: false,
    alcohol: '', // 'never', 'socially', 'frequently'
    
    // Nutricional
    water_intake: '',
    diet_history: '',
    food_aversions: '',
    supplements: '',
    
    // Físico
    activity_level: '', // 'sedentary', 'active', 'athlete'
    training_experience: '',
    weight_goal: ''
  })

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user) return
      setLoading(true)
      try {
        const profileRes = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
        const detailsRes = await supabase.from('client_details').select('*').eq('profile_id', id).maybeSingle()
        
        const cWorkouts = await supabase.from('client_workouts').select(`*, workout:workouts(*)`).eq('client_id', id).order('created_at', { ascending: false })
        const cMeals = await supabase.from('client_meal_plans').select(`*, meal_plan:meal_plans(*)`).eq('client_id', id).order('created_at', { ascending: false })
        
        const myWorkouts = await supabase.from('workouts').select('*').eq('professional_id', user.id).eq('is_template', false)
        const myMealPlans = await supabase.from('meal_plans').select('*').eq('nutritionist_id', user.id)

        if (profileRes.error) throw profileRes.error
        
        setClientProfile(profileRes.data)
        setClientDetails(detailsRes.data)
        setClientWorkouts(cWorkouts.data || [])
        setClientMealPlans(cMeals.data || [])
        setAvailableWorkouts(myWorkouts.data || [])
        setAvailableMealPlans(myMealPlans.data || [])

        // Carregar dados de Anamnese (Merge com default para garantir campos novos)
        if (detailsRes.data?.anamnesis_data) {
          const data = typeof detailsRes.data.anamnesis_data === 'string' 
            ? JSON.parse(detailsRes.data.anamnesis_data) 
            : detailsRes.data.anamnesis_data
            
          setAnamnesisForm(prev => ({ ...prev, ...data }))
        }

      } catch (error) {
        console.error(error)
        showError('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, user])

  // --- FUNÇÕES DE ATRIBUIÇÃO (MANTIDAS) ---
  const handleAssignWorkout = async () => {
    if (!selectedWorkoutId || !user) return
    try {
      const { error } = await supabase.from('client_workouts').insert({
        client_id: id, workout_id: selectedWorkoutId, professional_id: user.id, start_date: startDate, status: 'active'
      })
      if (error) throw error
      showSuccess('Treino atribuído!')
      setIsAssignWorkoutOpen(false)
      const { data } = await supabase.from('client_workouts').select(`*, workout:workouts(*)`).eq('client_id', id).order('created_at', { ascending: false })
      setClientWorkouts(data || [])
    } catch (err) { showError('Erro ao atribuir') }
  }

  const handleAssignMealPlan = async () => {
    if (!selectedMealPlanId || !user) return
    try {
      const { error } = await supabase.from('client_meal_plans').insert({
        client_id: id, meal_plan_id: selectedMealPlanId, nutritionist_id: user.id, start_date: startDate, status: 'active'
      })
      if (error) throw error
      showSuccess('Dieta atribuída!')
      setIsAssignMealPlanOpen(false)
      const { data } = await supabase.from('client_meal_plans').select(`*, meal_plan:meal_plans(*)`).eq('client_id', id).order('created_at', { ascending: false })
      setClientMealPlans(data || [])
    } catch (err) { showError('Erro ao atribuir') }
  }

  const handleRemoveAssignment = async (table: 'client_workouts' | 'client_meal_plans', itemId: string) => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', itemId)
      if (error) throw error
      showSuccess('Removido!')
      if (table === 'client_workouts') setClientWorkouts(prev => prev.filter(i => i.id !== itemId))
      else setClientMealPlans(prev => prev.filter(i => i.id !== itemId))
    } catch (err) { showError('Erro ao remover') }
  }

  // --- SALVAR ANAMNESE ---
  const handleSaveAnamnesis = async () => {
    try {
      const { error } = await supabase.from('client_details').upsert({
        profile_id: id,
        anamnesis_data: anamnesisForm,
        updated_at: new Date().toISOString()
      })
      
      if (error) throw error
      showSuccess('Anamnese completa salva com sucesso!')
    } catch (e: any) {
      console.error(e)
      showError(`Erro ao salvar: ${e.message}`)
    }
  }

  const updateAnamnesis = (field: string, value: any) => {
    setAnamnesisForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app/clients')} className="text-gray-400 hover:text-white"><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{clientProfile?.full_name || 'Cliente'}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {clientProfile?.email}</span>
                {clientProfile?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {clientProfile.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="workouts" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 w-full justify-start p-1 overflow-x-auto">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Treinos</TabsTrigger>
            <TabsTrigger value="meal-plans" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Dietas</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Histórico</TabsTrigger>
            <TabsTrigger value="anamnesis" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Anamnese</TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Perfil</TabsTrigger>
          </TabsList>

          {/* --- ABAS EXISTENTES (MANTIDAS) --- */}
          <TabsContent value="workouts">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2"><Dumbbell className="text-blue-400" /> Treinos Atribuídos</CardTitle>
                <Dialog open={isAssignWorkoutOpen} onOpenChange={setIsAssignWorkoutOpen}>
                  <DialogTrigger asChild><Button size="sm" className="bg-blue-600 text-white hover:bg-blue-500"><Plus className="mr-2 h-4 w-4"/> Atribuir</Button></DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader><DialogTitle>Atribuir Treino</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Select onValueChange={setSelectedWorkoutId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Treino..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableWorkouts.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select>
                      <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/>
                      <Button onClick={handleAssignWorkout} className="w-full bg-blue-600 hover:bg-blue-500">Confirmar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {clientWorkouts.length === 0 ? <div className="text-center py-8 text-gray-500">Vazio</div> : (
                  <div className="space-y-4">
                    {clientWorkouts.map(cw => (
                      <div key={cw.id} className="bg-black/20 p-4 rounded-lg border border-white/5 flex justify-between items-center">
                        <div><h4 className="text-lg font-semibold text-white">{cw.workout.name}</h4><div className="text-sm text-gray-400">{cw.workout.days_per_week}x semana • Início: {cw.start_date}</div></div>
                        <div className="flex gap-3"><Badge className="bg-green-500/20 text-green-400 border-none">Ativo</Badge><Button size="icon" variant="ghost" onClick={() => handleRemoveAssignment('client_workouts', cw.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20"><Trash2 className="h-4 w-4"/></Button></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meal-plans">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2"><Utensils className="text-green-400" /> Planos Alimentares</CardTitle>
                <Dialog open={isAssignMealPlanOpen} onOpenChange={setIsAssignMealPlanOpen}>
                  <DialogTrigger asChild><Button size="sm" className="bg-green-600 text-white hover:bg-green-500"><Plus className="mr-2 h-4 w-4"/> Atribuir</Button></DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader><DialogTitle>Atribuir Dieta</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Select onValueChange={setSelectedMealPlanId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Dieta..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableMealPlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
                      <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/>
                      <Button onClick={handleAssignMealPlan} className="w-full bg-green-600 hover:bg-green-500">Confirmar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {clientMealPlans.length === 0 ? <div className="text-center py-8 text-gray-500">Vazio</div> : (
                  <div className="space-y-4">
                    {clientMealPlans.map(cm => (
                      <div key={cm.id} className="bg-black/20 p-4 rounded-lg border border-white/5 flex justify-between items-center">
                        <div><h4 className="text-lg font-semibold text-white">{cm.meal_plan.name}</h4><div className="text-sm text-gray-400">{cm.meal_plan.daily_calories_target} kcal • Início: {cm.start_date}</div></div>
                        <div className="flex gap-3"><Badge className="bg-green-500/20 text-green-400 border-none">Ativo</Badge><Button size="icon" variant="ghost" onClick={() => handleRemoveAssignment('client_meal_plans', cm.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20"><Trash2 className="h-4 w-4"/></Button></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6"><ClientWorkoutHistory clientId={id!} /></div>
          </TabsContent>

          {/* --- ABA ANAMNESE PROFISSIONAL (ATUALIZADA) --- */}
          <TabsContent value="anamnesis">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-primary"/> Anamnese Profissional</h2>
              <Button onClick={handleSaveAnamnesis} className="bg-primary text-black hover:bg-primary/80 font-bold shadow-lg shadow-primary/10"><Save className="mr-2 h-4 w-4"/> Salvar Ficha Completa</Button>
            </div>

            <Tabs defaultValue="medical" className="w-full">
              <TabsList className="bg-black/20 border border-white/10 w-full justify-start">
                <TabsTrigger value="medical" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-gray-400"><HeartPulse className="w-4 h-4 mr-2"/> Clínica</TabsTrigger>
                <TabsTrigger value="lifestyle" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-gray-400"><Activity className="w-4 h-4 mr-2"/> Estilo de Vida</TabsTrigger>
                <TabsTrigger value="nutri" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400"><Apple className="w-4 h-4 mr-2"/> Nutricional</TabsTrigger>
              </TabsList>

              {/* 1. DADOS CLÍNICOS */}
              <TabsContent value="medical" className="mt-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-red-400 text-lg">Histórico Clínico e Lesões</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300 mb-1.5 block">Patologias / Histórico Familiar</Label>
                      <Textarea value={anamnesisForm.medical_history} onChange={e => updateAnamnesis('medical_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]" placeholder="Diabetes, Hipertensão, Cardiopatias na família..."/>
                    </div>
                    <div>
                      <Label className="text-gray-300 mb-1.5 block">Medicamentos de Uso Contínuo</Label>
                      <Textarea value={anamnesisForm.medications} onChange={e => updateAnamnesis('medications', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]" placeholder="Nome, dosagem e horários..."/>
                    </div>
                    <div>
                      <Label className="text-gray-300 mb-1.5 block">Cirurgias Realizadas</Label>
                      <Textarea value={anamnesisForm.surgeries} onChange={e => updateAnamnesis('surgeries', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]" placeholder="Tipo e data aproximada..."/>
                    </div>
                    <div>
                      <Label className="text-gray-300 mb-1.5 block">Lesões Osteoarticulares</Label>
                      <Textarea value={anamnesisForm.injuries} onChange={e => updateAnamnesis('injuries', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]" placeholder="Dores articulares, fraturas antigas, hérnias..."/>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-gray-300 mb-1.5 block">Alergias (Medicamentosa/Alimentar)</Label>
                      <Input value={anamnesisForm.allergies} onChange={e => updateAnamnesis('allergies', e.target.value)} className="bg-black/20 border-white/10"/>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 2. ESTILO DE VIDA */}
              <TabsContent value="lifestyle" className="mt-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-blue-400 text-lg">Rotina e Hábitos</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Profissão / Rotina Diária</Label>
                      <Input value={anamnesisForm.occupation} onChange={e => updateAnamnesis('occupation', e.target.value)} className="bg-black/20 border-white/10 mt-1.5" placeholder="Ex: Escritório, passa 8h sentado..."/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Horas de Sono</Label>
                        <Input type="number" value={anamnesisForm.sleep_hours} onChange={e => updateAnamnesis('sleep_hours', e.target.value)} className="bg-black/20 border-white/10 mt-1.5"/>
                      </div>
                      <div>
                        <Label className="text-gray-300">Qualidade do Sono</Label>
                        <Select value={anamnesisForm.sleep_quality} onValueChange={v => updateAnamnesis('sleep_quality', v)}>
                          <SelectTrigger className="bg-black/20 border-white/10 mt-1.5"><SelectValue placeholder="Selecione..."/></SelectTrigger>
                          <SelectContent className="bg-slate-900 text-white border-white/10"><SelectItem value="good">Boa/Reparadora</SelectItem><SelectItem value="average">Média/Acorda Cansado</SelectItem><SelectItem value="bad">Ruim/Insônia</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300">Nível de Estresse</Label>
                      <Select value={anamnesisForm.stress_level} onValueChange={v => updateAnamnesis('stress_level', v)}>
                        <SelectTrigger className="bg-black/20 border-white/10 mt-1.5"><SelectValue placeholder="Selecione..."/></SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-white/10"><SelectItem value="low">Baixo</SelectItem><SelectItem value="medium">Médio</SelectItem><SelectItem value="high">Alto</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between bg-black/20 p-3 rounded border border-white/5">
                      <Label className="text-gray-300">Fumante?</Label>
                      <Switch checked={anamnesisForm.smoker} onCheckedChange={c => updateAnamnesis('smoker', c)} />
                    </div>
                    <div>
                      <Label className="text-gray-300">Consumo de Álcool</Label>
                      <Select value={anamnesisForm.alcohol} onValueChange={v => updateAnamnesis('alcohol', v)}>
                        <SelectTrigger className="bg-black/20 border-white/10 mt-1.5"><SelectValue placeholder="Frequência..."/></SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-white/10"><SelectItem value="never">Nunca</SelectItem><SelectItem value="socially">Socialmente (Fim de semana)</SelectItem><SelectItem value="frequently">Frequentemente</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Nível de Atividade Física</Label>
                      <Select value={anamnesisForm.activity_level} onValueChange={v => updateAnamnesis('activity_level', v)}>
                        <SelectTrigger className="bg-black/20 border-white/10 mt-1.5"><SelectValue placeholder="Selecione..."/></SelectTrigger>
                        <SelectContent className="bg-slate-900 text-white border-white/10"><SelectItem value="sedentary">Sedentário</SelectItem><SelectItem value="active">Ativo (1-3x/sem)</SelectItem><SelectItem value="athlete">Muito Ativo (5x+/sem)</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 3. NUTRICIONAL */}
              <TabsContent value="nutri" className="mt-4">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-green-400 text-lg">Hábitos Alimentares</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-gray-300 mb-1.5 block">Histórico de Dietas / Recordatório 24h Breve</Label>
                      <Textarea value={anamnesisForm.diet_history} onChange={e => updateAnamnesis('diet_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[120px]" placeholder="Descreva brevemente como é a alimentação atual..."/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-300">Consumo de Água (L/dia)</Label>
                        <Input value={anamnesisForm.water_intake} onChange={e => updateAnamnesis('water_intake', e.target.value)} className="bg-black/20 border-white/10 mt-1.5" placeholder="Ex: 2.5"/>
                      </div>
                      <div>
                        <Label className="text-gray-300">Aversões Alimentares</Label>
                        <Input value={anamnesisForm.food_aversions} onChange={e => updateAnamnesis('food_aversions', e.target.value)} className="bg-black/20 border-white/10 mt-1.5" placeholder="Ex: Não come peixe, brócolis..."/>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300 mb-1.5 block">Suplementação Atual</Label>
                      <Textarea value={anamnesisForm.supplements} onChange={e => updateAnamnesis('supplements', e.target.value)} className="bg-black/20 border-white/10" placeholder="Whey, Creatina, Vitaminas..."/>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* PERFIL (Visualização Rápida) */}
          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="text-white">Objetivos do Aluno</CardTitle></CardHeader><CardContent className="text-gray-300">{clientDetails?.goals || 'Não informado pelo aluno.'}</CardContent></Card>
              <Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="text-white">Restrições (Informadas pelo Aluno)</CardTitle></CardHeader><CardContent className="text-gray-300">{clientDetails?.health_restrictions || 'Nenhuma informada.'}</CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails