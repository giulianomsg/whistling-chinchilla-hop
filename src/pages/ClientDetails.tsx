import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  User, Mail, Phone, ArrowLeft, Dumbbell, Utensils, 
  Loader2, Plus,
  FileText, Save, HeartPulse, Activity, Apple, Scale, Ruler, TrendingUp,
  Pencil, Trash2, LayoutDashboard, Trophy, MessageSquare
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'
import ClientWorkoutHistory from '@/components/professional/ClientWorkoutHistory'
import { calculateBiometrics, classifyBMI, calculateCompletion } from '@/utils/biometrics'

// --- DICIONÁRIOS DE TRADUÇÃO ---
const SKINFOLD_LABELS: Record<string, string> = {
  triceps: 'Tríceps', biceps: 'Bíceps', subscapular: 'Subescapular', chest: 'Peitoral',
  axillary: 'Axilar Média', suprailiac: 'Supra-ilíaca', abdominal: 'Abdominal', thigh: 'Coxa', calf: 'Panturrilha'
}

const CIRCUMFERENCE_LABELS: Record<string, string> = {
  shoulder: 'Ombros', chest: 'Tórax', arm_right: 'Braço Dir.', arm_left: 'Braço Esq.',
  waist: 'Cintura', abdomen: 'Abdômen', hips: 'Quadril', thigh_right: 'Coxa Dir.', thigh_left: 'Coxa Esq.',
  calf_right: 'Panturrilha Dir.', calf_left: 'Panturrilha Esq.'
}

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
  const [assessments, setAssessments] = useState<any[]>([])
  
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([])
  const [availableMealPlans, setAvailableMealPlans] = useState<any[]>([])

  // UI States
  const [isAssignWorkoutOpen, setIsAssignWorkoutOpen] = useState(false)
  const [isAssignMealPlanOpen, setIsAssignMealPlanOpen] = useState(false)
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false)
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('')
  const [selectedMealPlanId, setSelectedMealPlanId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null)

  // Formulários
  const [anamnesisForm, setAnamnesisForm] = useState({
    medical_history: '', medications: '', surgeries: '', injuries: '', allergies: '',
    occupation: '', sleep_hours: '', sleep_quality: '', stress_level: '', smoker: false, alcohol: '',
    water_intake: '', diet_history: '', food_aversions: '', supplements: '', activity_level: ''
  })

  const initialAssessmentState = {
    date: new Date().toISOString().split('T')[0],
    weight: '', height: '', gender: 'male', age: 25,
    skinfolds: { triceps: '', biceps: '', subscapular: '', chest: '', axillary: '', suprailiac: '', abdominal: '', thigh: '', calf: '' },
    circumferences: { shoulder: '', chest: '', arm_right: '', arm_left: '', waist: '', abdomen: '', hips: '', thigh_right: '', thigh_left: '', calf_right: '', calf_left: '' },
    notes: ''
  }
  const [newAssessment, setNewAssessment] = useState(initialAssessmentState)

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user) return
      setLoading(true)
      try {
        const profileRes = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
        const detailsRes = await supabase.from('client_details').select('*').eq('profile_id', id).maybeSingle()
        const cWorkouts = await supabase.from('client_workouts').select(`*, workout:workouts(*)`).eq('client_id', id).order('created_at', { ascending: false })
        const cMeals = await supabase.from('client_meal_plans').select(`*, meal_plan:meal_plans(*)`).eq('client_id', id).order('created_at', { ascending: false })
        const cAssessments = await supabase.from('biometric_data').select('*').eq('client_id', id).order('date', { ascending: false })
        const myWorkouts = await supabase.from('workouts').select('*').eq('professional_id', user.id).eq('is_template', false)
        const myMealPlans = await supabase.from('meal_plans').select('*').eq('nutritionist_id', user.id)

        if (profileRes.error) throw profileRes.error
        
        setClientProfile(profileRes.data)
        setClientDetails(detailsRes.data)
        setClientWorkouts(cWorkouts.data || [])
        setClientMealPlans(cMeals.data || [])
        setAssessments(cAssessments.data || [])
        setAvailableWorkouts(myWorkouts.data || [])
        setAvailableMealPlans(myMealPlans.data || [])

        if (detailsRes.data?.anamnesis_data) {
          const data = typeof detailsRes.data.anamnesis_data === 'string' ? JSON.parse(detailsRes.data.anamnesis_data) : detailsRes.data.anamnesis_data
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

  const handleAssignWorkout = async () => {
    try {
      const { error } = await supabase.from('client_workouts').insert({ client_id: id, workout_id: selectedWorkoutId, professional_id: user!.id, start_date: startDate, status: 'active' })
      if (error) throw error
      showSuccess('Treino atribuído!')
      setIsAssignWorkoutOpen(false)
      const { data } = await supabase.from('client_workouts').select(`*, workout:workouts(*)`).eq('client_id', id).order('created_at', { ascending: false })
      setClientWorkouts(data || [])
    } catch (err) { showError('Erro ao atribuir') }
  }

  const handleAssignMealPlan = async () => {
    try {
      const { error } = await supabase.from('client_meal_plans').insert({ client_id: id, meal_plan_id: selectedMealPlanId, nutritionist_id: user!.id, start_date: startDate, status: 'active' })
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

  const handleSaveAnamnesis = async () => {
    try {
      const { error } = await supabase.from('client_details').upsert({ profile_id: id, anamnesis_data: anamnesisForm, updated_at: new Date().toISOString() })
      if (error) throw error
      showSuccess('Anamnese salva!')
    } catch (e) { showError('Erro ao salvar') }
  }

  const updateAnamnesis = (field: string, value: any) => setAnamnesisForm(prev => ({ ...prev, [field]: value }))

  const openEditAssessment = (assessment: any) => {
    setEditingAssessmentId(assessment.id)
    const measures = typeof assessment.measurements === 'string' ? JSON.parse(assessment.measurements) : assessment.measurements
    setNewAssessment({
      date: assessment.date, weight: assessment.weight, height: assessment.height, gender: 'male', age: 25,
      skinfolds: measures.skinfolds || initialAssessmentState.skinfolds,
      circumferences: measures.circumferences || initialAssessmentState.circumferences,
      notes: assessment.notes || ''
    })
    setIsNewAssessmentOpen(true)
  }

  const openNewAssessment = () => { setEditingAssessmentId(null); setNewAssessment(initialAssessmentState); setIsNewAssessmentOpen(true); }

  const handleSaveAssessment = async (status: 'draft' | 'completed') => {
    try {
      const calculated = calculateBiometrics({
        gender: newAssessment.gender as 'male'|'female', age: Number(newAssessment.age),
        weight: Number(newAssessment.weight), height: Number(newAssessment.height),
        skinfolds: Object.fromEntries(Object.entries(newAssessment.skinfolds).map(([k, v]) => [k, Number(v)]))
      })
      const completion = calculateCompletion(newAssessment)
      const measurementsData = {
        skinfolds: newAssessment.skinfolds, circumferences: newAssessment.circumferences,
        protocol: calculated.protocol, bmi: calculated.bmi, lean_mass: calculated.leanMass, fat_mass: calculated.fatMass,
        status: status, completion: completion
      }
      const payload = {
        client_id: id, date: newAssessment.date, weight: Number(newAssessment.weight), height: Number(newAssessment.height),
        body_fat_percentage: calculated.bodyFat, muscle_mass: calculated.leanMass, measurements: measurementsData, notes: newAssessment.notes
      }
      let error
      if (editingAssessmentId) {
        const res = await supabase.from('biometric_data').update(payload).eq('id', editingAssessmentId)
        error = res.error
      } else {
        const res = await supabase.from('biometric_data').insert(payload)
        error = res.error
      }
      if (error) throw error
      showSuccess(status === 'draft' ? 'Rascunho salvo!' : 'Avaliação finalizada!')
      setIsNewAssessmentOpen(false)
      const { data } = await supabase.from('biometric_data').select('*').eq('client_id', id).order('date', { ascending: false })
      setAssessments(data || [])
    } catch (e: any) { console.error(e); showError('Erro ao salvar avaliação') }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Tem certeza?')) return
    try {
      const { error } = await supabase.from('biometric_data').delete().eq('id', assessmentId)
      if (error) throw error
      showSuccess('Avaliação excluída.')
      setAssessments(prev => prev.filter(a => a.id !== assessmentId))
    } catch (e) { showError('Erro ao excluir') }
  }

  const updateNested = (section: 'skinfolds'|'circumferences', field: string, value: string) => {
    setNewAssessment(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  const latestAssessment = assessments.find(a => a.measurements?.status === 'completed') || assessments[0]
  const activeWorkout = clientWorkouts.find(w => w.status === 'active')
  const activeMealPlan = clientMealPlans.find(m => m.status === 'active')
  const currentXP = clientProfile?.current_xp || 0
  const currentLevel = clientProfile?.level || 1
  const xpProgress = ((currentXP % 1000) / 1000) * 100

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/app/clients')} className="text-gray-400 hover:text-white pl-0 gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar para Lista
            </Button>
        </div>

        {/* TABS - RESPONSIVIDADE: overflow-x-auto para mobile */}
        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-white/5 border border-white/10 w-full justify-start p-1 flex min-w-max">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 px-4 py-2"><LayoutDashboard className="w-4 h-4 mr-2"/> Visão Geral</TabsTrigger>
              <TabsTrigger value="workouts" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 px-4 py-2">Treinos</TabsTrigger>
              <TabsTrigger value="meal-plans" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 px-4 py-2">Dietas</TabsTrigger>
              <TabsTrigger value="biometrics" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 px-4 py-2"><Scale className="w-4 h-4 mr-2"/> Biometria</TabsTrigger>
              <TabsTrigger value="anamnesis" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 px-4 py-2"><FileText className="w-4 h-4 mr-2"/> Anamnese</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 px-4 py-2">Histórico</TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 px-4 py-2">Perfil</TabsTrigger>
            </TabsList>
          </div>

          {/* --- DASHBOARD --- */}
          <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-left-2 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 1. PERFIL DO ALUNO (Desktop Large / Mobile Stacked) */}
              <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><User className="w-48 h-48 text-primary"/></div>
                <CardContent className="pt-8 pb-8 px-6 md:px-8">
                  {/* Layout: Mobile (Coluna), Desktop (Linha) */}
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1 shadow-2xl">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden">
                          {clientProfile?.avatar_url ? <img src={clientProfile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-gray-400">{clientProfile?.full_name?.[0]}</div>}
                        </div>
                      </div>
                      <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black border-none whitespace-nowrap shadow-lg font-bold px-4 py-1 text-sm">Nível {currentLevel}</Badge>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left w-full">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{clientProfile?.full_name}</h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400 mb-6">
                        <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary"/> {clientProfile?.email}</span>
                        {clientProfile?.phone && <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary"/> {clientProfile?.phone}</span>}
                      </div>
                      
                      <div className="space-y-2 max-w-lg mx-auto md:mx-0">
                        <div className="flex justify-between text-sm font-medium text-primary">
                          <span>XP Atual</span>
                          <span>{currentXP % 1000} / 1000</span>
                        </div>
                        <Progress value={xpProgress} className="h-3 bg-white/10" />
                        <p className="text-xs text-gray-500 mt-1 text-right">Faltam {1000 - (currentXP % 1000)} XP para o próximo nível</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. AÇÕES RÁPIDAS */}
              <Card className="bg-white/5 border-white/10 h-full">
                <CardHeader className="pb-4"><CardTitle className="text-gray-400 font-medium uppercase tracking-wider text-sm">Ações Rápidas</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {/* Botões Grandes e Confortáveis para Desktop */}
                  <Button variant="outline" className="h-24 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 hover:border-primary/50 transition-all" onClick={() => setIsAssignWorkoutOpen(true)}>
                    <Dumbbell className="h-8 w-8 text-blue-400 mb-1"/> <span className="text-xs font-medium">Atribuir Treino</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 hover:border-primary/50 transition-all" onClick={() => setIsAssignMealPlanOpen(true)}>
                    <Utensils className="h-8 w-8 text-orange-400 mb-1"/> <span className="text-xs font-medium">Atribuir Dieta</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 hover:border-primary/50 transition-all" onClick={openNewAssessment}>
                    <Scale className="h-8 w-8 text-green-400 mb-1"/> <span className="text-xs font-medium">Nova Avaliação</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 hover:border-primary/50 transition-all" onClick={() => navigate('/app/chat')}>
                    <MessageSquare className="h-8 w-8 text-purple-400 mb-1"/> <span className="text-xs font-medium">Mensagem</span>
                  </Button>
                </CardContent>
              </Card>

              {/* 3. MÉTRICAS ATUAIS (Cards Grandes) */}
              <Card className="bg-white/5 border-white/10 lg:col-span-3">
                <CardHeader className="pb-4 border-b border-white/5"><CardTitle className="text-white flex items-center gap-3 text-xl"><Activity className="h-6 w-6 text-primary"/> Status Vital</CardTitle></CardHeader>
                <CardContent className="pt-8 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Peso Atual</p>
                    <p className="text-4xl font-bold text-white">{latestAssessment?.weight ? `${latestAssessment.weight}` : '--'} <span className="text-lg text-gray-500 font-normal">kg</span></p>
                  </div>
                  <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Gordura Corporal</p>
                    <p className="text-4xl font-bold text-white">{latestAssessment?.body_fat_percentage ? `${latestAssessment.body_fat_percentage}` : '--'} <span className="text-lg text-gray-500 font-normal">%</span></p>
                  </div>
                  <div className={`bg-black/20 p-6 rounded-xl border ${activeWorkout ? 'border-green-500/30 bg-green-900/10' : 'border-white/5'}`}>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Plano de Treino</p>
                    <p className={`text-xl font-bold truncate ${activeWorkout ? 'text-green-400' : 'text-gray-500'}`}>{activeWorkout?.workout.name || 'Nenhum Ativo'}</p>
                    {activeWorkout && <p className="text-sm text-gray-400 mt-1">{activeWorkout.workout.days_per_week} dias / semana</p>}
                  </div>
                  <div className={`bg-black/20 p-6 rounded-xl border ${activeMealPlan ? 'border-orange-500/30 bg-orange-900/10' : 'border-white/5'}`}>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Dieta Atual</p>
                    <p className={`text-xl font-bold truncate ${activeMealPlan ? 'text-orange-400' : 'text-gray-500'}`}>{activeMealPlan?.meal_plan.name || 'Nenhuma Ativa'}</p>
                    {activeMealPlan && <p className="text-sm text-gray-400 mt-1">Meta: {activeMealPlan.meal_plan.daily_calories_target} kcal</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- OUTRAS ABAS --- */}
          <TabsContent value="biometrics">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-white text-xl">Histórico de Avaliações</CardTitle>
                {/* Dialog Responsivo (Max Height para mobile) */}
                <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
                  <DialogTrigger asChild><Button onClick={openNewAssessment} className="bg-primary text-black hover:bg-primary/80 font-bold w-full sm:w-auto"><Plus className="w-4 h-4 mr-2"/> Nova Avaliação</Button></DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-0 rounded-lg">
                    <div className="p-6">
                      <DialogHeader className="mb-6"><DialogTitle className="text-xl">{editingAssessmentId ? 'Editar Avaliação' : 'Nova Avaliação Física'}</DialogTitle></DialogHeader>
                      {/* Grid Responsivo do Modal */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-5">
                          <h3 className="font-semibold text-primary flex items-center gap-2"><User className="w-4 h-4"/> Dados Básicos</h3>
                          <div><Label>Data da Avaliação</Label><Input type="date" value={newAssessment.date} onChange={e => setNewAssessment({...newAssessment, date: e.target.value})} className="bg-black/20 border-white/10 text-white mt-1.5"/></div>
                          <div className="grid grid-cols-2 gap-3"><div><Label>Peso (kg)</Label><Input type="number" value={newAssessment.weight} onChange={e => setNewAssessment({...newAssessment, weight: e.target.value})} className="bg-black/20 border-white/10 text-white mt-1.5"/></div><div><Label>Altura (cm)</Label><Input type="number" value={newAssessment.height} onChange={e => setNewAssessment({...newAssessment, height: e.target.value})} className="bg-black/20 border-white/10 text-white mt-1.5"/></div></div>
                          <div className="grid grid-cols-2 gap-3"><div><Label>Idade</Label><Input type="number" value={newAssessment.age} onChange={e => setNewAssessment({...newAssessment, age: Number(e.target.value)})} className="bg-black/20 border-white/10 text-white mt-1.5"/></div><div><Label>Gênero</Label><Select value={newAssessment.gender} onValueChange={v => setNewAssessment({...newAssessment, gender: v})}><SelectTrigger className="bg-black/20 border-white/10 text-white mt-1.5"><SelectValue/></SelectTrigger><SelectContent className="bg-slate-800 text-white border-white/10"><SelectItem value="male">Masculino</SelectItem><SelectItem value="female">Feminino</SelectItem></SelectContent></Select></div></div>
                        </div>
                        <div className="space-y-5">
                          <h3 className="font-semibold text-primary flex items-center gap-2"><Scale className="w-4 h-4"/> Dobras Cutâneas (mm)</h3>
                          <div className="grid grid-cols-2 gap-3">{Object.keys(newAssessment.skinfolds).map((key) => (<div key={key}><Label className="text-xs text-gray-400 uppercase">{SKINFOLD_LABELS[key] || key}</Label><Input type="number" value={(newAssessment.skinfolds as any)[key]} onChange={e => updateNested('skinfolds', key, e.target.value)} className="bg-black/20 border-white/10 text-white h-9 mt-1"/></div>))}</div>
                        </div>
                        <div className="space-y-5">
                          <h3 className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4"/> Perímetros (cm)</h3>
                          <div className="grid grid-cols-2 gap-3">{Object.keys(newAssessment.circumferences).map((key) => (<div key={key}><Label className="text-xs text-gray-400 uppercase">{CIRCUMFERENCE_LABELS[key] || key}</Label><Input type="number" value={(newAssessment.circumferences as any)[key]} onChange={e => updateNested('circumferences', key, e.target.value)} className="bg-black/20 border-white/10 text-white h-9 mt-1"/></div>))}</div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="p-6 border-t border-white/10 gap-3 flex-col sm:flex-row bg-black/20">
                      <Button variant="outline" onClick={() => handleSaveAssessment('draft')} className="border-white/10 text-white hover:bg-white/5 w-full sm:w-auto">Salvar Rascunho</Button>
                      <Button onClick={() => handleSaveAssessment('completed')} className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto px-8">Finalizar Avaliação</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-6">
                {assessments.length === 0 ? <div className="text-center text-gray-500 py-12">Nenhuma avaliação registrada.</div> : (
                  <div className="space-y-4">
                    {assessments.map((assessment) => {
                      const bmiInfo = classifyBMI(Number((assessment.weight / ((assessment.height/100)**2)).toFixed(2)))
                      const status = assessment.measurements?.status || 'completed'
                      const completion = assessment.measurements?.completion || 0
                      return (
                        <div key={assessment.id} className={`bg-black/20 p-4 md:p-5 rounded-xl border ${status === 'draft' ? 'border-yellow-500/30 bg-yellow-900/5' : 'border-white/5'} flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8 transition-all hover:bg-white/5`}>
                          <div className="flex items-center gap-5 flex-1 w-full">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm flex-col flex-shrink-0 ${status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary'}`}>
                              <span>{new Date(assessment.date).getDate()}</span>
                              <span className="uppercase text-[10px]">{new Date(assessment.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-white font-bold text-lg">{assessment.weight} kg</span>
                                {status === 'draft' ? <Badge variant="secondary" className="text-yellow-400 bg-yellow-900/20 border-none">Rascunho</Badge> : <Badge variant="outline" className={`text-xs ${bmiInfo.color} border-current`}>{bmiInfo.label}</Badge>}
                              </div>
                              {status === 'draft' ? (
                                <div className="w-full max-w-[200px] mt-1">
                                  <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Preenchimento</span><span>{completion}%</span></div>
                                  <Progress value={completion} className="h-1.5 bg-white/10" />
                                </div>
                              ) : (
                                <div className="text-sm text-gray-400 flex gap-4 mt-1">
                                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3"/> {assessment.body_fat_percentage}% Gordura</span>
                                  <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3"/> {assessment.muscle_mass}kg Massa Magra</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                            <Button variant="ghost" size="sm" onClick={() => openEditAssessment(assessment)} className="text-blue-400 hover:bg-blue-500/10"><Pencil className="h-4 w-4 mr-2 md:mr-0"/><span className="md:hidden">Editar</span></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAssessment(assessment.id)} className="text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4 mr-2 md:mr-0"/><span className="md:hidden">Excluir</span></Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Demais abas mantidas (Workouts, MealPlans, History, etc) com layouts padrão Desktop */}
          <TabsContent value="workouts"><Card className="bg-white/5 border-white/10"><CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><CardTitle className="text-white flex items-center gap-2"><Dumbbell className="text-blue-400" /> Treinos Atribuídos</CardTitle><Dialog open={isAssignWorkoutOpen} onOpenChange={setIsAssignWorkoutOpen}><DialogTrigger asChild><Button size="sm" className="bg-blue-600 text-white hover:bg-blue-500 w-full sm:w-auto"><Plus className="mr-2 h-4 w-4"/> Atribuir</Button></DialogTrigger><DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] rounded-lg"><DialogHeader><DialogTitle>Atribuir Treino</DialogTitle></DialogHeader><div className="space-y-4 mt-4"><Select onValueChange={setSelectedWorkoutId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Treino..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableWorkouts.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/><Button onClick={handleAssignWorkout} className="w-full bg-blue-600 hover:bg-blue-500">Confirmar</Button></div></DialogContent></Dialog></CardHeader><CardContent>{clientWorkouts.length === 0 ? <div className="text-center py-8 text-gray-500">Vazio</div> : (<div className="space-y-4">{clientWorkouts.map(cw => (<div key={cw.id} className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4"><div><h4 className="text-lg font-semibold text-white text-center sm:text-left">{cw.workout.name}</h4><div className="text-sm text-gray-400 text-center sm:text-left">{cw.workout.days_per_week}x semana</div></div><div className="flex gap-3 w-full sm:w-auto justify-center"><Badge className="bg-green-500/20 text-green-400 border-none">Ativo</Badge><Button size="icon" variant="ghost" onClick={() => handleRemoveAssignment('client_workouts', cw.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20"><Trash2 className="h-4 w-4"/></Button></div></div>))}</div>)}</CardContent></Card></TabsContent>
          <TabsContent value="meal-plans"><Card className="bg-white/5 border-white/10"><CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><CardTitle className="text-white flex items-center gap-2"><Utensils className="text-green-400" /> Planos Alimentares</CardTitle><Dialog open={isAssignMealPlanOpen} onOpenChange={setIsAssignMealPlanOpen}><DialogTrigger asChild><Button size="sm" className="bg-green-600 text-white hover:bg-green-500 w-full sm:w-auto"><Plus className="mr-2 h-4 w-4"/> Atribuir</Button></DialogTrigger><DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] rounded-lg"><DialogHeader><DialogTitle>Atribuir Dieta</DialogTitle></DialogHeader><div className="space-y-4 mt-4"><Select onValueChange={setSelectedMealPlanId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Dieta..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableMealPlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/><Button onClick={handleAssignMealPlan} className="w-full bg-green-600 hover:bg-green-500">Confirmar</Button></div></DialogContent></Dialog></CardHeader><CardContent>{clientMealPlans.length === 0 ? <div className="text-center py-8 text-gray-500">Vazio</div> : (<div className="space-y-4">{clientMealPlans.map(cm => (<div key={cm.id} className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4"><div><h4 className="text-lg font-semibold text-white text-center sm:text-left">{cm.meal_plan.name}</h4><div className="text-sm text-gray-400 text-center sm:text-left">{cm.meal_plan.daily_calories_target} kcal</div></div><div className="flex gap-3 w-full sm:w-auto justify-center"><Badge className="bg-green-500/20 text-green-400 border-none">Ativo</Badge><Button size="icon" variant="ghost" onClick={() => handleRemoveAssignment('client_meal_plans', cm.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20"><Trash2 className="h-4 w-4"/></Button></div></div>))}</div>)}</CardContent></Card></TabsContent>
          <TabsContent value="history"><div className="bg-white/5 border border-white/10 rounded-xl p-6"><ClientWorkoutHistory clientId={id!} /></div></TabsContent>
          <TabsContent value="anamnesis"><div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4"><h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-primary"/> Anamnese Profissional</h2><Button onClick={handleSaveAnamnesis} className="bg-primary text-black hover:bg-primary/80 font-bold shadow-lg shadow-primary/10 w-full sm:w-auto"><Save className="mr-2 h-4 w-4"/> Salvar Ficha</Button></div><Tabs defaultValue="medical" className="w-full"><TabsList className="bg-black/20 border border-white/10 w-full justify-start"><TabsTrigger value="medical" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-gray-400"><HeartPulse className="w-4 h-4 mr-2"/> Clínica</TabsTrigger><TabsTrigger value="lifestyle" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-gray-400"><Activity className="w-4 h-4 mr-2"/> Estilo de Vida</TabsTrigger><TabsTrigger value="nutri" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400"><Apple className="w-4 h-4 mr-2"/> Nutricional</TabsTrigger></TabsList><TabsContent value="medical" className="mt-4"><Card className="bg-white/5 border-white/10"><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6"><div><Label className="text-gray-300 mb-1.5 block">Patologias</Label><Textarea value={anamnesisForm.medical_history} onChange={e => updateAnamnesis('medical_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]"/></div><div><Label className="text-gray-300 mb-1.5 block">Medicamentos</Label><Textarea value={anamnesisForm.medications} onChange={e => updateAnamnesis('medications', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]"/></div><div><Label className="text-gray-300 mb-1.5 block">Cirurgias</Label><Textarea value={anamnesisForm.surgeries} onChange={e => updateAnamnesis('surgeries', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]"/></div><div><Label className="text-gray-300 mb-1.5 block">Lesões</Label><Textarea value={anamnesisForm.injuries} onChange={e => updateAnamnesis('injuries', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]"/></div></CardContent></Card></TabsContent><TabsContent value="lifestyle" className="mt-4"><Card className="bg-white/5 border-white/10"><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6"><div><Label className="text-gray-300">Profissão</Label><Input value={anamnesisForm.occupation} onChange={e => updateAnamnesis('occupation', e.target.value)} className="bg-black/20 border-white/10 mt-1.5"/></div><div className="flex items-center justify-between bg-black/20 p-3 rounded border border-white/5"><Label className="text-gray-300">Fumante?</Label><Switch checked={anamnesisForm.smoker} onCheckedChange={c => updateAnamnesis('smoker', c)} /></div></CardContent></Card></TabsContent><TabsContent value="nutri" className="mt-4"><Card className="bg-white/5 border-white/10"><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6"><div><Label className="text-gray-300">Água (L/dia)</Label><Input value={anamnesisForm.water_intake} onChange={e => updateAnamnesis('water_intake', e.target.value)} className="bg-black/20 border-white/10 mt-1.5"/></div><div className="md:col-span-2"><Label className="text-gray-300">Histórico Alimentar</Label><Textarea value={anamnesisForm.diet_history} onChange={e => updateAnamnesis('diet_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[120px]"/></div></CardContent></Card></TabsContent></Tabs></TabsContent>
          <TabsContent value="info"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="text-white">Objetivos</CardTitle></CardHeader><CardContent className="text-gray-300">{clientDetails?.goals || '---'}</CardContent></Card><Card className="bg-white/5 border-white/10"><CardHeader><CardTitle className="text-white">Restrições</CardTitle></CardHeader><CardContent className="text-gray-300">{clientDetails?.health_restrictions || '---'}</CardContent></Card></div></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails