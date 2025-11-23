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
  
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [clientDetails, setClientDetails] = useState<any>(null)
  const [clientWorkouts, setClientWorkouts] = useState<any[]>([])
  const [clientMealPlans, setClientMealPlans] = useState<any[]>([])
  const [assessments, setAssessments] = useState<any[]>([])
  
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([])
  const [availableMealPlans, setAvailableMealPlans] = useState<any[]>([])

  const [isAssignWorkoutOpen, setIsAssignWorkoutOpen] = useState(false)
  const [isAssignMealPlanOpen, setIsAssignMealPlanOpen] = useState(false)
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false)
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('')
  const [selectedMealPlanId, setSelectedMealPlanId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null)

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
    <div className="min-h-screen bg-background py-4 md:py-8 overflow-x-hidden"> {/* overflow-x-hidden global */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-4 md:mb-6">
            <Button variant="ghost" onClick={() => navigate('/app/clients')} className="text-gray-400 hover:text-white pl-0 gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6 w-full">
          {/* TAB BAR COM SCROLL INTERNO, NÃO DA PÁGINA */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
             <TabsList className="bg-white/5 border border-white/10 justify-start p-1 flex min-w-max">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400"><LayoutDashboard className="w-4 h-4 mr-2"/> Visão Geral</TabsTrigger>
              <TabsTrigger value="workouts" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Treinos</TabsTrigger>
              <TabsTrigger value="meal-plans" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Dietas</TabsTrigger>
              <TabsTrigger value="biometrics" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400"><Scale className="w-4 h-4 mr-2"/> Biometria</TabsTrigger>
              <TabsTrigger value="anamnesis" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400"><FileText className="w-4 h-4 mr-2"/> Anamnese</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Histórico</TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-black text-gray-400">Perfil</TabsTrigger>
            </TabsList>
          </div>

          {/* --- DASHBOARD (Mobile: Stacked Verticalmente) --- */}
          <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-left-2 duration-500 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 1. PERFIL - Layout Responsivo: Coluna em Mobile, Linha em Desktop */}
              <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><User className="w-32 h-32 text-primary"/></div>
                <CardContent className="pt-6 px-4 md:px-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 mx-auto md:mx-0">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden">
                          {clientProfile?.avatar_url ? <img src={clientProfile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-gray-400">{clientProfile?.full_name?.[0]}</div>}
                        </div>
                      </div>
                      <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black border-none whitespace-nowrap shadow-lg font-bold px-3">Nível {currentLevel}</Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0 w-full">
                      <h2 className="text-2xl font-bold text-white mb-1 break-words">{clientProfile?.full_name}</h2>
                      <div className="flex flex-col md:flex-row items-center md:justify-start gap-2 md:gap-6 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-1 truncate max-w-full"><Mail className="w-3 h-3"/> {clientProfile?.email}</span>
                        {clientProfile?.phone && <span className="flex items-center gap-1 truncate"><Phone className="w-3 h-3"/> {clientProfile?.phone}</span>}
                      </div>
                      <div className="space-y-1.5 w-full max-w-xs mx-auto md:mx-0">
                        <div className="flex justify-between text-xs font-medium text-primary"><span>XP Atual</span><span>{currentXP % 1000} / 1000</span></div>
                        <Progress value={xpProgress} className="h-2 bg-white/10" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. AÇÕES RÁPIDAS */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-3 px-4 pt-4"><CardTitle className="text-sm text-gray-400 font-medium uppercase tracking-wider">Ações Rápidas</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 px-4 pb-4">
                  <Button variant="outline" className="h-auto py-3 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-1.5" onClick={() => setIsAssignWorkoutOpen(true)}>
                    <Dumbbell className="h-5 w-5 text-blue-400"/> <span className="text-xs">Treino</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-1.5" onClick={() => setIsAssignMealPlanOpen(true)}>
                    <Utensils className="h-5 w-5 text-orange-400"/> <span className="text-xs">Dieta</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-1.5" onClick={openNewAssessment}>
                    <Scale className="h-5 w-5 text-green-400"/> <span className="text-xs">Avaliar</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-1.5" onClick={() => navigate('/app/chat')}>
                    <MessageSquare className="h-5 w-5 text-purple-400"/> <span className="text-xs">Chat</span>
                  </Button>
                </CardContent>
              </Card>

              {/* 3. STATUS VITAL - MOBILE: GRID DE 1 COLUNA (STACKED) */}
              <Card className="bg-white/5 border-white/10 lg:col-span-3">
                <CardHeader className="pb-2 px-4 pt-4 border-b border-white/5"><CardTitle className="text-white flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-primary"/> Métricas Atuais</CardTitle></CardHeader>
                {/* AQUI É O SEGREDO: grid-cols-1 no mobile para empilhar verticalmente */}
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex justify-between items-center md:block">
                    <p className="text-gray-400 text-xs uppercase tracking-wider md:mb-1">Peso Atual</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{latestAssessment?.weight ? `${latestAssessment.weight} kg` : '--'}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex justify-between items-center md:block">
                    <p className="text-gray-400 text-xs uppercase tracking-wider md:mb-1">Gordura</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{latestAssessment?.body_fat_percentage ? `${latestAssessment.body_fat_percentage}%` : '--'}</p>
                  </div>
                  <div className={`bg-black/20 p-4 rounded-lg border ${activeWorkout ? 'border-green-500/30 bg-green-900/10' : 'border-white/5'} flex justify-between items-center md:block`}>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-xs uppercase tracking-wider md:mb-1">Treino</p>
                      <p className={`text-base md:text-lg font-bold truncate ${activeWorkout ? 'text-green-400' : 'text-gray-500'}`}>{activeWorkout?.workout.name || 'Inativo'}</p>
                    </div>
                    {activeWorkout && <p className="text-xs text-gray-500 hidden md:block">{activeWorkout.workout.days_per_week}x/sem</p>}
                  </div>
                  <div className={`bg-black/20 p-4 rounded-lg border ${activeMealPlan ? 'border-orange-500/30 bg-orange-900/10' : 'border-white/5'} flex justify-between items-center md:block`}>
                    <div className="min-w-0">
                      <p className="text-gray-400 text-xs uppercase tracking-wider md:mb-1">Dieta</p>
                      <p className={`text-base md:text-lg font-bold truncate ${activeMealPlan ? 'text-orange-400' : 'text-gray-500'}`}>{activeMealPlan?.meal_plan.name || 'Inativa'}</p>
                    </div>
                    {activeMealPlan && <p className="text-xs text-gray-500 hidden md:block">{activeMealPlan.meal_plan.daily_calories_target} kcal</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- BIOMETRIA (Lista Vertical no Mobile) --- */}
          <TabsContent value="biometrics">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                <CardTitle className="text-white text-lg">Histórico</CardTitle>
                <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
                  <DialogTrigger asChild><Button onClick={openNewAssessment} className="bg-primary text-black hover:bg-primary/80 font-bold w-full sm:w-auto"><Plus className="w-4 h-4 mr-2"/> Nova Avaliação</Button></DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-0 rounded-lg">
                    <div className="p-4 md:p-6">
                      <DialogHeader className="mb-4"><DialogTitle>{editingAssessmentId ? 'Editar' : 'Nova'} Avaliação</DialogTitle></DialogHeader>
                      {/* Formulário Responsivo */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-primary flex items-center gap-2"><User className="w-4 h-4"/> Básico</h3>
                          <div><Label>Data</Label><Input type="date" value={newAssessment.date} onChange={e => setNewAssessment({...newAssessment, date: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div>
                          <div className="grid grid-cols-2 gap-2"><div><Label>Peso (kg)</Label><Input type="number" value={newAssessment.weight} onChange={e => setNewAssessment({...newAssessment, weight: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div><div><Label>Altura (cm)</Label><Input type="number" value={newAssessment.height} onChange={e => setNewAssessment({...newAssessment, height: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div></div>
                          <div className="grid grid-cols-2 gap-2"><div><Label>Idade</Label><Input type="number" value={newAssessment.age} onChange={e => setNewAssessment({...newAssessment, age: Number(e.target.value)})} className="bg-black/20 border-white/10 text-white"/></div><div><Label>Gênero</Label><Select value={newAssessment.gender} onValueChange={v => setNewAssessment({...newAssessment, gender: v})}><SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-slate-800 text-white border-white/10"><SelectItem value="male">Masculino</SelectItem><SelectItem value="female">Feminino</SelectItem></SelectContent></Select></div></div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-semibold text-primary flex items-center gap-2"><Scale className="w-4 h-4"/> Dobras (mm)</h3>
                          <div className="grid grid-cols-2 gap-2">{Object.keys(newAssessment.skinfolds).map((key) => (<div key={key}><Label className="text-[10px] text-gray-400 uppercase">{SKINFOLD_LABELS[key]?.slice(0,3) || key}</Label><Input type="number" value={(newAssessment.skinfolds as any)[key]} onChange={e => updateNested('skinfolds', key, e.target.value)} className="bg-black/20 border-white/10 text-white h-9"/></div>))}</div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="font-semibold text-primary flex items-center gap-2"><Ruler className="w-4 h-4"/> Perímetros (cm)</h3>
                          <div className="grid grid-cols-2 gap-2">{Object.keys(newAssessment.circumferences).map((key) => (<div key={key}><Label className="text-[10px] text-gray-400 uppercase">{CIRCUMFERENCE_LABELS[key]?.slice(0,3) || key}</Label><Input type="number" value={(newAssessment.circumferences as any)[key]} onChange={e => updateNested('circumferences', key, e.target.value)} className="bg-black/20 border-white/10 text-white h-9"/></div>))}</div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="p-4 border-t border-white/10 gap-2 flex-col sm:flex-row bg-black/20">
                      <Button variant="outline" onClick={() => handleSaveAssessment('draft')} className="border-white/10 text-white hover:bg-white/5 w-full sm:w-auto">Salvar Rascunho</Button>
                      <Button onClick={() => handleSaveAssessment('completed')} className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto">Finalizar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-4">
                {assessments.length === 0 ? <div className="text-center text-gray-500 py-8">Vazio.</div> : (
                  <div className="space-y-3">
                    {assessments.map((assessment) => {
                      const bmiInfo = classifyBMI(Number((assessment.weight / ((assessment.height/100)**2)).toFixed(2)))
                      const status = assessment.measurements?.status || 'completed'
                      const completion = assessment.measurements?.completion || 0
                      return (
                        // Card de Avaliação: Vertical no Mobile (flex-col), Horizontal no Desktop
                        <div key={assessment.id} className={`bg-black/20 p-4 rounded-lg border ${status === 'draft' ? 'border-yellow-500/30' : 'border-white/5'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                          <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs flex-col flex-shrink-0 ${status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary'}`}>
                              <span>{new Date(assessment.date).getDate()}</span>
                              <span className="uppercase text-[9px]">{new Date(assessment.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold text-lg">{assessment.weight} kg</span>
                                {status === 'draft' ? <Badge variant="secondary" className="text-yellow-400 bg-yellow-900/20 border-none text-[10px]">Rascunho</Badge> : <Badge variant="outline" className={`text-[10px] ${bmiInfo.color} border-current`}>{bmiInfo.label}</Badge>}
                              </div>
                              {status === 'draft' ? (
                                <div className="w-32 mt-1"><Progress value={completion} className="h-1.5 bg-white/10" /></div>
                              ) : (
                                <div className="text-xs text-gray-400 flex gap-3 mt-1">
                                  <span>Gordura: {assessment.body_fat_percentage}%</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>Massa: {assessment.muscle_mass}kg</span>
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

          {/* ABAS RESTANTES (MANTIDAS COM PADDING AJUSTADO) */}
          <TabsContent value="workouts"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><CardTitle className="text-white text-lg">Treinos</CardTitle><Dialog open={isAssignWorkoutOpen} onOpenChange={setIsAssignWorkoutOpen}><DialogTrigger asChild><Button size="sm" className="bg-blue-600 w-full sm:w-auto"><Plus className="mr-2 h-4 w-4"/> Atribuir</Button></DialogTrigger><DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] rounded-lg"><DialogHeader><DialogTitle>Atribuir Treino</DialogTitle></DialogHeader><div className="space-y-4 mt-4"><Select onValueChange={setSelectedWorkoutId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Treino..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableWorkouts.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/><Button onClick={handleAssignWorkout} className="w-full bg-blue-600 hover:bg-blue-500">Confirmar</Button></div></DialogContent></Dialog></CardHeader><CardContent className="p-4">{clientWorkouts.map(cw => (<div key={cw.id} className="bg-black/20 p-4 rounded-lg border border-white/5 mb-3 flex flex-col sm:flex-row justify-between items-center gap-3"><div><h4 className="text-sm font-bold text-white text-center sm:text-left">{cw.workout.name}</h4><div className="text-xs text-gray-400 text-center sm:text-left">{cw.workout.days_per_week}x semana</div></div><Button size="sm" variant="ghost" onClick={() => handleRemoveAssignment('client_workouts', cw.id)} className="text-red-400 hover:bg-red-900/20 w-full sm:w-auto"><Trash2 className="h-4 w-4 mr-2"/> Remover</Button></div>))}</CardContent></Card></TabsContent>
          <TabsContent value="meal-plans"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><CardTitle className="text-white text-lg">Dietas</CardTitle><Dialog open={isAssignMealPlanOpen} onOpenChange={setIsAssignMealPlanOpen}><DialogTrigger asChild><Button size="sm" className="bg-green-600 w-full sm:w-auto"><Plus className="mr-2 h-4 w-4"/> Atribuir</Button></DialogTrigger><DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] rounded-lg"><DialogHeader><DialogTitle>Atribuir Dieta</DialogTitle></DialogHeader><div className="space-y-4 mt-4"><Select onValueChange={setSelectedMealPlanId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Dieta..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableMealPlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/><Button onClick={handleAssignMealPlan} className="w-full bg-green-600 hover:bg-green-500">Confirmar</Button></div></DialogContent></Dialog></CardHeader><CardContent className="p-4">{clientMealPlans.map(cm => (<div key={cm.id} className="bg-black/20 p-4 rounded-lg border border-white/5 mb-3 flex flex-col sm:flex-row justify-between items-center gap-3"><div><h4 className="text-sm font-bold text-white text-center sm:text-left">{cm.meal_plan.name}</h4><div className="text-xs text-gray-400 text-center sm:text-left">{cm.meal_plan.daily_calories_target} kcal</div></div><Button size="sm" variant="ghost" onClick={() => handleRemoveAssignment('client_meal_plans', cm.id)} className="text-red-400 hover:bg-red-900/20 w-full sm:w-auto"><Trash2 className="h-4 w-4 mr-2"/> Remover</Button></div>))}</CardContent></Card></TabsContent>
          <TabsContent value="history"><div className="bg-white/5 border border-white/10 rounded-xl p-4"><ClientWorkoutHistory clientId={id!} /></div></TabsContent>
          <TabsContent value="anamnesis"><div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4"><h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-primary"/> Anamnese</h2><Button onClick={handleSaveAnamnesis} className="bg-primary text-black hover:bg-primary/80 font-bold shadow-lg w-full sm:w-auto"><Save className="mr-2 h-4 w-4"/> Salvar Ficha</Button></div><Tabs defaultValue="medical" className="w-full"><TabsList className="bg-black/20 border border-white/10 w-full justify-start h-10"><TabsTrigger value="medical" className="flex-1">Saúde</TabsTrigger><TabsTrigger value="lifestyle" className="flex-1">Estilo</TabsTrigger><TabsTrigger value="nutri" className="flex-1">Nutri</TabsTrigger></TabsList><TabsContent value="medical"><Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-4"><div><Label className="text-gray-300">Patologias</Label><Textarea value={anamnesisForm.medical_history} onChange={e => updateAnamnesis('medical_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[80px]"/></div><div><Label className="text-gray-300">Lesões</Label><Textarea value={anamnesisForm.injuries} onChange={e => updateAnamnesis('injuries', e.target.value)} className="bg-black/20 border-white/10 min-h-[80px]"/></div></CardContent></Card></TabsContent><TabsContent value="lifestyle"><Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-4"><div><Label className="text-gray-300">Profissão</Label><Input value={anamnesisForm.occupation} onChange={e => updateAnamnesis('occupation', e.target.value)} className="bg-black/20 border-white/10"/></div><div className="flex justify-between items-center bg-black/20 p-3 rounded"><Label className="text-gray-300">Fumante?</Label><Switch checked={anamnesisForm.smoker} onCheckedChange={c => updateAnamnesis('smoker', c)} /></div></CardContent></Card></TabsContent><TabsContent value="nutri"><Card className="bg-white/5 border-white/10"><CardContent className="p-4 space-y-4"><div><Label className="text-gray-300">Água (L)</Label><Input value={anamnesisForm.water_intake} onChange={e => updateAnamnesis('water_intake', e.target.value)} className="bg-black/20 border-white/10"/></div><div><Label className="text-gray-300">Histórico</Label><Textarea value={anamnesisForm.diet_history} onChange={e => updateAnamnesis('diet_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[80px]"/></div></CardContent></Card></TabsContent></Tabs></TabsContent>
          <TabsContent value="info"><div className="space-y-4"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4 pb-2"><CardTitle className="text-white text-base">Objetivos</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-sm text-gray-300">{clientDetails?.goals || '---'}</CardContent></Card><Card className="bg-white/5 border-white/10"><CardHeader className="p-4 pb-2"><CardTitle className="text-white text-base">Restrições</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-sm text-gray-300">{clientDetails?.health_restrictions || '---'}</CardContent></Card></div></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails