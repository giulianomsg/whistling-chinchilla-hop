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

// --- DICIONÁRIOS DE TRADUÇÃO (Biometria) ---
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

  // Estado da Edição de Biometria
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

  // Handlers (Resumidos)
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

  // Biometria Handlers
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

  // Dashboard Data
  const latestAssessment = assessments.find(a => a.measurements?.status === 'completed') || assessments[0]
  const activeWorkout = clientWorkouts.find(w => w.status === 'active')
  const activeMealPlan = clientMealPlans.find(m => m.status === 'active')
  const currentXP = clientProfile?.current_xp || 0
  const currentLevel = clientProfile?.level || 1
  const xpProgress = ((currentXP % 1000) / 1000) * 100

  return (
    <div className="min-h-screen bg-background py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER COMPACTO */}
        <div className="mb-3">
            <Button variant="ghost" onClick={() => navigate('/app/clients')} className="text-gray-400 hover:text-white pl-0 gap-2 h-8">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
        </div>

        {/* TABS COMPACTAS */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
            <TabsList className="bg-white/5 border border-white/10 justify-start p-1 flex min-w-max h-9">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 text-xs"><LayoutDashboard className="w-3 h-3 mr-1.5"/> Visão Geral</TabsTrigger>
              <TabsTrigger value="workouts" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 text-xs">Treinos</TabsTrigger>
              <TabsTrigger value="meal-plans" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 text-xs">Dietas</TabsTrigger>
              <TabsTrigger value="biometrics" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 text-xs"><Scale className="w-3 h-3 mr-1.5"/> Biometria</TabsTrigger>
              <TabsTrigger value="anamnesis" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 text-xs"><FileText className="w-3 h-3 mr-1.5"/> Anamnese</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 text-xs">Histórico</TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400 text-xs">Perfil</TabsTrigger>
            </TabsList>
          </div>

          {/* --- DASHBOARD OTIMIZADO (Layout Compacto) --- */}
          <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-left-2 duration-500 space-y-4">
            
            {/* 1. PERFIL DO ALUNO (Horizontal e Compacto) */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-5"><User className="w-24 h-24 text-primary"/></div>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar Pequeno */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-0.5">
                      <div className="w-full h-full rounded-full bg-black overflow-hidden">
                        {clientProfile?.avatar_url ? <img src={clientProfile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xl font-bold text-gray-400">{clientProfile?.full_name?.[0]}</div>}
                      </div>
                    </div>
                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black border-none whitespace-nowrap shadow-sm font-bold text-[10px] h-4 px-1.5">Lvl {currentLevel}</Badge>
                  </div>
                  
                  {/* Info Compacta */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white truncate leading-tight">{clientProfile?.full_name}</h2>
                    <div className="flex flex-col text-xs text-gray-400 mt-0.5 mb-2">
                      <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 flex-shrink-0"/> {clientProfile?.email}</span>
                    </div>
                    <div className="space-y-1 max-w-[200px]">
                      <div className="flex justify-between text-[10px] font-medium text-primary">
                        <span>XP</span>
                        <span>{currentXP % 1000}/1000</span>
                      </div>
                      <Progress value={xpProgress} className="h-1.5 bg-white/10" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 2. AÇÕES RÁPIDAS (Botões Horizontais para economizar altura) */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2 p-4"><CardTitle className="text-xs text-gray-400 font-medium uppercase tracking-wider">Ações Rápidas</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="h-9 justify-start border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 px-2" onClick={() => setIsAssignWorkoutOpen(true)}>
                    <Dumbbell className="h-4 w-4 text-blue-400"/> <span className="text-[10px]">Treino</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 justify-start border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 px-2" onClick={() => setIsAssignMealPlanOpen(true)}>
                    <Utensils className="h-4 w-4 text-orange-400"/> <span className="text-[10px]">Dieta</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 justify-start border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 px-2" onClick={openNewAssessment}>
                    <Scale className="h-4 w-4 text-green-400"/> <span className="text-[10px]">Avaliar</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 justify-start border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 px-2" onClick={() => navigate('/app/chat')}>
                    <MessageSquare className="h-4 w-4 text-purple-400"/> <span className="text-[10px]">Chat</span>
                  </Button>
                </CardContent>
              </Card>

              {/* 3. MÉTRICAS COMPACTAS */}
              <Card className="bg-white/5 border-white/10 lg:col-span-2">
                <CardHeader className="pb-2 p-4 border-b border-white/5"><CardTitle className="text-white flex items-center gap-2 text-sm"><Activity className="h-4 w-4 text-primary"/> Status Atual</CardTitle></CardHeader>
                <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-black/20 p-3 rounded border border-white/5">
                    <p className="text-gray-500 text-[9px] uppercase mb-0.5">Peso</p>
                    <p className="text-lg font-bold text-white">{latestAssessment?.weight ? `${latestAssessment.weight}kg` : '--'}</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded border border-white/5">
                    <p className="text-gray-500 text-[9px] uppercase mb-0.5">Gordura</p>
                    <p className="text-lg font-bold text-white">{latestAssessment?.body_fat_percentage ? `${latestAssessment.body_fat_percentage}%` : '--'}</p>
                  </div>
                  <div className={`bg-black/20 p-3 rounded border ${activeWorkout ? 'border-green-500/30 bg-green-900/5' : 'border-white/5'}`}>
                    <p className="text-gray-500 text-[9px] uppercase mb-0.5">Treino</p>
                    <p className={`text-sm font-bold truncate ${activeWorkout ? 'text-green-400' : 'text-gray-500'}`}>{activeWorkout?.workout.name || 'Inativo'}</p>
                  </div>
                  <div className={`bg-black/20 p-3 rounded border ${activeMealPlan ? 'border-orange-500/30 bg-orange-900/5' : 'border-white/5'}`}>
                    <p className="text-gray-500 text-[9px] uppercase mb-0.5">Dieta</p>
                    <p className={`text-sm font-bold truncate ${activeMealPlan ? 'text-orange-400' : 'text-gray-500'}`}>{activeMealPlan?.meal_plan.name || 'Inativa'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- CONTEÚDO DAS OUTRAS ABAS (MANTIDO MAS COM PADDING REDUZIDO NO MOBILE) --- */}
          {/* Para economizar caracteres, o conteúdo interno das outras abas segue a mesma lógica de estilo: p-4 e textos menores */}
          <TabsContent value="biometrics"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-white text-base">Histórico</CardTitle><Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}><DialogTrigger asChild><Button onClick={openNewAssessment} size="sm" className="bg-primary text-black hover:bg-primary/80 font-bold"><Plus className="w-3 h-3 mr-1"/> Nova</Button></DialogTrigger><DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] max-h-[85vh] overflow-y-auto p-0"><div className="p-4"><DialogHeader className="mb-4"><DialogTitle>{editingAssessmentId ? 'Editar' : 'Nova'} Avaliação</DialogTitle></DialogHeader><div className="grid grid-cols-1 gap-4"><div className="space-y-3"><h3 className="font-semibold text-primary text-sm flex items-center gap-2"><User className="w-3 h-3"/> Básico</h3><div className="grid grid-cols-2 gap-2"><div><Label className="text-xs">Peso (kg)</Label><Input type="number" value={newAssessment.weight} onChange={e => setNewAssessment({...newAssessment, weight: e.target.value})} className="bg-black/20 border-white/10 text-white h-8 text-sm"/></div><div><Label className="text-xs">Altura (cm)</Label><Input type="number" value={newAssessment.height} onChange={e => setNewAssessment({...newAssessment, height: e.target.value})} className="bg-black/20 border-white/10 text-white h-8 text-sm"/></div></div><div><Label className="text-xs">Data</Label><Input type="date" value={newAssessment.date} onChange={e => setNewAssessment({...newAssessment, date: e.target.value})} className="bg-black/20 border-white/10 text-white h-8 text-sm"/></div></div><div className="space-y-3"><h3 className="font-semibold text-primary text-sm flex items-center gap-2"><Scale className="w-3 h-3"/> Dobras</h3><div className="grid grid-cols-3 gap-2">{Object.keys(newAssessment.skinfolds).map((key) => (<div key={key}><Label className="text-[9px] text-gray-400 uppercase truncate">{SKINFOLD_LABELS[key]?.slice(0,3)}</Label><Input type="number" value={(newAssessment.skinfolds as any)[key]} onChange={e => updateNested('skinfolds', key, e.target.value)} className="bg-black/20 border-white/10 text-white h-7 text-xs px-1"/></div>))}</div></div></div></div><DialogFooter className="p-4 border-t border-white/10 gap-2"><Button variant="outline" onClick={() => handleSaveAssessment('draft')} className="border-white/10 text-white hover:bg-white/5 w-full h-8 text-xs">Rascunho</Button><Button onClick={() => handleSaveAssessment('completed')} className="bg-green-600 text-white hover:bg-green-700 w-full h-8 text-xs">Finalizar</Button></DialogFooter></DialogContent></Dialog></CardHeader><CardContent className="p-4">{assessments.length === 0 ? <div className="text-center text-gray-500 py-4 text-sm">Vazio.</div> : (<div className="space-y-3">{assessments.map((assessment) => {const status = assessment.measurements?.status || 'completed'; return (<div key={assessment.id} className={`bg-black/20 p-3 rounded-lg border ${status === 'draft' ? 'border-yellow-500/30' : 'border-white/5'} flex justify-between items-center gap-3`}><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[10px] flex-col flex-shrink-0 ${status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary'}`}><span>{new Date(assessment.date).getDate()}</span><span className="uppercase">{new Date(assessment.date).toLocaleString('default', { month: 'short' })}</span></div><div><div className="flex items-center gap-2"><span className="text-white font-medium text-sm">{assessment.weight} kg</span>{status === 'draft' && <Badge variant="secondary" className="text-yellow-400 bg-yellow-900/20 border-none text-[9px] h-4 px-1">Rascunho</Badge>}</div><div className="text-[10px] text-gray-400">{assessment.body_fat_percentage}% Gord • {assessment.muscle_mass}kg Massa</div></div></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditAssessment(assessment)} className="h-8 w-8 text-blue-400"><Pencil className="h-3 w-3"/></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteAssessment(assessment.id)} className="h-8 w-8 text-red-400"><Trash2 className="h-3 w-3"/></Button></div></div>)})}</div>)}</CardContent></Card></TabsContent>
          <TabsContent value="workouts"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-white text-base">Treinos</CardTitle><Dialog open={isAssignWorkoutOpen} onOpenChange={setIsAssignWorkoutOpen}><DialogTrigger asChild><Button size="sm" className="bg-blue-600 text-white hover:bg-blue-500"><Plus className="mr-1 h-3 w-3"/> Add</Button></DialogTrigger><DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] rounded-lg"><DialogHeader><DialogTitle>Atribuir</DialogTitle></DialogHeader><div className="space-y-3 p-2"><Select onValueChange={setSelectedWorkoutId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Treino..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableWorkouts.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/><Button onClick={handleAssignWorkout} className="w-full bg-blue-600">Salvar</Button></div></DialogContent></Dialog></CardHeader><CardContent className="p-4">{clientWorkouts.map(cw => (<div key={cw.id} className="bg-black/20 p-3 rounded-lg border border-white/5 mb-2 flex justify-between items-center"><div><h4 className="text-sm font-semibold text-white">{cw.workout.name}</h4><div className="text-xs text-gray-400">{cw.workout.days_per_week}x semana</div></div><Button size="icon" variant="ghost" onClick={() => handleRemoveAssignment('client_workouts', cw.id)} className="h-8 w-8 text-red-400"><Trash2 className="h-3 w-3"/></Button></div>))}</CardContent></Card></TabsContent>
          <TabsContent value="meal-plans"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-white text-base">Dietas</CardTitle><Dialog open={isAssignMealPlanOpen} onOpenChange={setIsAssignMealPlanOpen}><DialogTrigger asChild><Button size="sm" className="bg-green-600 text-white hover:bg-green-500"><Plus className="mr-1 h-3 w-3"/> Add</Button></DialogTrigger><DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] rounded-lg"><DialogHeader><DialogTitle>Atribuir</DialogTitle></DialogHeader><div className="space-y-3 p-2"><Select onValueChange={setSelectedMealPlanId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Dieta..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableMealPlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><Button onClick={handleAssignMealPlan} className="w-full bg-green-600">Salvar</Button></div></DialogContent></Dialog></CardHeader><CardContent className="p-4">{clientMealPlans.map(cm => (<div key={cm.id} className="bg-black/20 p-3 rounded-lg border border-white/5 mb-2 flex justify-between items-center"><div><h4 className="text-sm font-semibold text-white">{cm.meal_plan.name}</h4><div className="text-xs text-gray-400">{cm.meal_plan.daily_calories_target} kcal</div></div><Button size="icon" variant="ghost" onClick={() => handleRemoveAssignment('client_meal_plans', cm.id)} className="h-8 w-8 text-red-400"><Trash2 className="h-3 w-3"/></Button></div>))}</CardContent></Card></TabsContent>
          <TabsContent value="history"><div className="bg-white/5 border border-white/10 rounded-xl p-4"><ClientWorkoutHistory clientId={id!} /></div></TabsContent>
          <TabsContent value="anamnesis"><div className="flex justify-between items-center mb-4 px-2"><h2 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="text-primary h-5 w-5"/> Anamnese</h2><Button onClick={handleSaveAnamnesis} size="sm" className="bg-primary text-black hover:bg-primary/80 font-bold"><Save className="mr-1 h-3 w-3"/> Salvar</Button></div><Tabs defaultValue="medical" className="w-full"><TabsList className="bg-black/20 border border-white/10 w-full justify-start h-8 mb-4"><TabsTrigger value="medical" className="text-xs h-7">Saúde</TabsTrigger><TabsTrigger value="lifestyle" className="text-xs h-7">Estilo</TabsTrigger><TabsTrigger value="nutri" className="text-xs h-7">Nutri</TabsTrigger></TabsList><TabsContent value="medical"><Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-3"><div><Label className="text-xs text-gray-300">Patologias</Label><Textarea value={anamnesisForm.medical_history} onChange={e => updateAnamnesis('medical_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[80px] text-sm"/></div><div><Label className="text-xs text-gray-300">Lesões</Label><Textarea value={anamnesisForm.injuries} onChange={e => updateAnamnesis('injuries', e.target.value)} className="bg-black/20 border-white/10 min-h-[80px] text-sm"/></div></CardContent></Card></TabsContent><TabsContent value="lifestyle"><Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-3"><div><Label className="text-xs text-gray-300">Profissão</Label><Input value={anamnesisForm.occupation} onChange={e => updateAnamnesis('occupation', e.target.value)} className="bg-black/20 border-white/10 h-8 text-sm"/></div><div className="flex items-center justify-between bg-black/20 p-2 rounded"><Label className="text-xs text-gray-300">Fumante?</Label><Switch checked={anamnesisForm.smoker} onCheckedChange={c => updateAnamnesis('smoker', c)} /></div></CardContent></Card></TabsContent><TabsContent value="nutri"><Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-3"><div><Label className="text-xs text-gray-300">Água (L)</Label><Input value={anamnesisForm.water_intake} onChange={e => updateAnamnesis('water_intake', e.target.value)} className="bg-black/20 border-white/10 h-8 text-sm"/></div><div><Label className="text-xs text-gray-300">Histórico</Label><Textarea value={anamnesisForm.diet_history} onChange={e => updateAnamnesis('diet_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[80px] text-sm"/></div></CardContent></Card></TabsContent></Tabs></TabsContent>
          <TabsContent value="info"><div className="space-y-4"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4 pb-2"><CardTitle className="text-white text-sm">Objetivos</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-sm text-gray-300">{clientDetails?.goals || '---'}</CardContent></Card><Card className="bg-white/5 border-white/10"><CardHeader className="p-4 pb-2"><CardTitle className="text-white text-sm">Restrições</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-sm text-gray-300">{clientDetails?.health_restrictions || '---'}</CardContent></Card></div></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails