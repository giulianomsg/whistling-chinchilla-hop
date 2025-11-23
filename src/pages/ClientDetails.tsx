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
    // TAG GLOBAL DE CONTENÇÃO (ESSENCIAL PARA O BUG DE ROLAGEM)
    <div className="min-h-screen bg-background w-full overflow-x-hidden" style={{ maxWidth: '100vw' }}>
      <div className="w-full px-4 py-6 md:max-w-7xl md:mx-auto md:px-8">
        
        <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/app/clients')} className="text-gray-400 hover:text-white pl-0 gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6 w-full max-w-[100vw]">
          {/* TAB LIST - FORÇANDO SCROLL HORIZONTAL */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            <TabsList className="bg-white/5 border border-white/10 justify-start p-1 flex min-w-max h-10">
              <TabsTrigger value="dashboard" className="px-3 py-1.5 text-xs"><LayoutDashboard className="w-3 h-3 mr-1.5"/> Visão Geral</TabsTrigger>
              <TabsTrigger value="workouts" className="px-3 py-1.5 text-xs">Treinos</TabsTrigger>
              <TabsTrigger value="meal-plans" className="px-3 py-1.5 text-xs">Dietas</TabsTrigger>
              <TabsTrigger value="biometrics" className="px-3 py-1.5 text-xs"><Scale className="w-3 h-3 mr-1.5"/> Biometria</TabsTrigger>
              <TabsTrigger value="anamnesis" className="px-3 py-1.5 text-xs"><FileText className="w-3 h-3 mr-1.5"/> Anamnese</TabsTrigger>
              <TabsTrigger value="history" className="px-3 py-1.5 text-xs">Histórico</TabsTrigger>
              <TabsTrigger value="info" className="px-3 py-1.5 text-xs">Perfil</TabsTrigger>
            </TabsList>
          </div>

          {/* --- DASHBOARD --- */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* PERFIL */}
              <Card className="lg:col-span-2 bg-slate-900 border-white/10 shadow-xl relative overflow-hidden w-full">
                <CardContent className="pt-6 px-4 md:px-8 pb-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start w-full">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/20 p-1 mx-auto">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden">
                          {clientProfile?.avatar_url ? <img src={clientProfile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-gray-400">{clientProfile?.full_name?.[0]}</div>}
                        </div>
                      </div>
                      <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black border-none px-3 text-xs font-bold">Nível {currentLevel}</Badge>
                    </div>
                    
                    {/* Contenção de Texto (min-w-0 é CRUCIAL aqui) */}
                    <div className="flex-1 min-w-0 w-full text-center md:text-left">
                      <h2 className="text-2xl font-bold text-white mb-1 truncate" style={{ wordBreak: 'break-word' }}>{clientProfile?.full_name}</h2>
                      <div className="flex flex-col md:flex-row items-center md:justify-start gap-1 md:gap-4 text-sm text-gray-400 mb-4">
                        <span className="truncate max-w-full">{clientProfile?.email}</span>
                        {clientProfile?.phone && <span className="truncate max-w-full">{clientProfile?.phone}</span>}
                      </div>
                      
                      <div className="space-y-1.5 w-full max-w-xs mx-auto md:mx-0">
                        <div className="flex justify-between text-xs font-medium text-primary"><span>XP Atual</span><span>{currentXP % 1000} / 1000</span></div>
                        <Progress value={xpProgress} className="h-2 bg-white/10" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AÇÕES RÁPIDAS */}
              <Card className="bg-white/5 border-white/10 w-full">
                <CardHeader className="pb-3 px-4 pt-4"><CardTitle className="text-xs text-gray-400 font-medium uppercase tracking-wider">Ações Rápidas</CardTitle></CardHeader>
                <CardContent className="p-4 pt-0 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-3 flex-col border-white/10 bg-white/5 text-white gap-1" onClick={() => setIsAssignWorkoutOpen(true)}><Dumbbell className="h-5 w-5 text-blue-400"/> <span className="text-[10px]">Treino</span></Button>
                  <Button variant="outline" className="h-auto py-3 flex-col border-white/10 bg-white/5 text-white gap-1" onClick={() => setIsAssignMealPlanOpen(true)}><Utensils className="h-5 w-5 text-orange-400"/> <span className="text-[10px]">Dieta</span></Button>
                  <Button variant="outline" className="h-auto py-3 flex-col border-white/10 bg-white/5 text-white gap-1" onClick={openNewAssessment}><Scale className="h-5 w-5 text-green-400"/> <span className="text-[10px]">Avaliar</span></Button>
                  <Button variant="outline" className="h-auto py-3 flex-col border-white/10 bg-white/5 text-white gap-1" onClick={() => navigate('/app/chat')}><MessageSquare className="h-5 w-5 text-purple-400"/> <span className="text-[10px]">Chat</span></Button>
                </CardContent>
              </Card>

              {/* MÉTRICAS (Stacked no mobile) */}
              <Card className="bg-white/5 border-white/10 lg:col-span-3 w-full">
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/20 p-4 rounded border border-white/5 flex justify-between items-center md:block">
                    <p className="text-gray-400 text-[10px] uppercase">Peso</p>
                    <p className="text-xl font-bold text-white">{latestAssessment?.weight ? `${latestAssessment.weight} kg` : '--'}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded border border-white/5 flex justify-between items-center md:block">
                    <p className="text-gray-400 text-[10px] uppercase">Gordura</p>
                    <p className="text-xl font-bold text-white">{latestAssessment?.body_fat_percentage ? `${latestAssessment.body_fat_percentage}%` : '--'}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded border border-white/5 md:block">
                    <p className="text-gray-400 text-[10px] uppercase">Treino</p>
                    <p className="text-base font-bold text-white truncate max-w-full">{activeWorkout?.workout.name || 'Inativo'}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded border border-white/5 md:block">
                    <p className="text-gray-400 text-[10px] uppercase">Dieta</p>
                    <p className="text-base font-bold text-white truncate max-w-full">{activeMealPlan?.meal_plan.name || 'Inativa'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- BIOMETRIA --- */}
          <TabsContent value="biometrics">
            <Card className="bg-white/5 border-white/10 w-full">
              <CardHeader className="flex flex-col gap-3 p-4 md:flex-row md:justify-between md:items-center">
                <CardTitle className="text-white text-lg">Histórico</CardTitle>
                <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
                  <DialogTrigger asChild><Button onClick={openNewAssessment} className="bg-primary text-black font-bold w-full md:w-auto"><Plus className="w-4 h-4 mr-2"/> Nova Avaliação</Button></DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-0">
                    {/* Conteúdo do Dialog (Mantido, apenas ajustando container interno) */}
                    <div className="p-6 space-y-6">
                        <DialogHeader><DialogTitle>Avaliação Física</DialogTitle></DialogHeader>
                        {/* Grids internos do formulário adaptados */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {/* Coluna 1 */}
                           <div className="space-y-4">
                              <h3 className="text-primary font-semibold">Básico</h3>
                              <div className="grid grid-cols-1 gap-2">
                                  <Label>Data</Label><Input type="date" value={newAssessment.date} onChange={e => setNewAssessment({...newAssessment, date: e.target.value})} className="bg-black/20 border-white/10 text-white"/>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <div><Label>Peso</Label><Input type="number" value={newAssessment.weight} onChange={e => setNewAssessment({...newAssessment, weight: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div>
                                  <div><Label>Altura</Label><Input type="number" value={newAssessment.height} onChange={e => setNewAssessment({...newAssessment, height: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div>
                              </div>
                           </div>
                           {/* Colunas 2 e 3 (Dobras e Perímetros) seguem o mesmo padrão de grid-cols-2 para inputs pequenos */}
                           <div className="space-y-4">
                              <h3 className="text-primary font-semibold">Dobras</h3>
                              <div className="grid grid-cols-2 gap-2">
                                  {Object.keys(newAssessment.skinfolds).map(k => (
                                      <div key={k}><Label className="text-[10px] text-gray-400 uppercase">{SKINFOLD_LABELS[k]?.slice(0,3)}</Label><Input type="number" className="h-8 bg-black/20 border-white/10 text-white" value={(newAssessment.skinfolds as any)[k]} onChange={e => updateNested('skinfolds', k, e.target.value)}/></div>
                                  ))}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <h3 className="text-primary font-semibold">Perímetros</h3>
                              <div className="grid grid-cols-2 gap-2">
                                  {Object.keys(newAssessment.circumferences).map(k => (
                                      <div key={k}><Label className="text-[10px] text-gray-400 uppercase">{CIRCUMFERENCE_LABELS[k]?.slice(0,3)}</Label><Input type="number" className="h-8 bg-black/20 border-white/10 text-white" value={(newAssessment.circumferences as any)[k]} onChange={e => updateNested('circumferences', k, e.target.value)}/></div>
                                  ))}
                              </div>
                           </div>
                        </div>
                    </div>
                    <DialogFooter className="p-4 bg-black/20 flex-col gap-2">
                        <Button variant="outline" onClick={() => handleSaveAssessment('draft')} className="w-full">Salvar Rascunho</Button>
                        <Button onClick={() => handleSaveAssessment('completed')} className="w-full bg-green-600">Finalizar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              
              {/* Lista de Avaliações (Vertical Stacked) */}
              <CardContent className="p-4 space-y-3">
                {assessments.map((assessment) => {
                   const status = assessment.measurements?.status || 'completed';
                   const completion = assessment.measurements?.completion || 0;
                   return (
                       <div key={assessment.id} className="bg-black/20 p-3 rounded-lg border border-white/5 flex flex-col gap-3">
                           <div className="flex justify-between items-start">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold flex-col text-primary">
                                       <span>{new Date(assessment.date).getDate()}</span>
                                       <span className="uppercase">{new Date(assessment.date).toLocaleString('default', { month: 'short' })}</span>
                                   </div>
                                   <div>
                                       <p className="text-white font-bold">{assessment.weight} kg</p>
                                       {status === 'draft' ? <Badge variant="secondary" className="text-[10px] text-yellow-400 bg-yellow-900/20 border-none">Rascunho</Badge> : <p className="text-[10px] text-gray-400">{assessment.body_fat_percentage}% Gordura</p>}
                                   </div>
                               </div>
                               <div className="flex gap-1">
                                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400" onClick={() => openEditAssessment(assessment)}><Pencil className="w-4 h-4"/></Button>
                                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400" onClick={() => handleDeleteAssessment(assessment.id)}><Trash2 className="w-4 h-4"/></Button>
                               </div>
                           </div>
                           {status === 'draft' && (
                               <div className="w-full">
                                   <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>Progresso</span><span>{completion}%</span></div>
                                   <Progress value={completion} className="h-1.5 bg-white/10" />
                               </div>
                           )}
                       </div>
                   )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Abas Restantes (Mantendo estrutura simples) */}
          <TabsContent value="workouts"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4"><CardTitle className="text-white text-base">Treinos</CardTitle></CardHeader><CardContent className="p-4">{clientWorkouts.map(cw => (<div key={cw.id} className="bg-black/20 p-3 rounded border border-white/5 mb-2"><h4 className="text-sm text-white font-bold">{cw.workout.name}</h4></div>))}</CardContent></Card></TabsContent>
          <TabsContent value="meal-plans"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4"><CardTitle className="text-white text-base">Dietas</CardTitle></CardHeader><CardContent className="p-4">{clientMealPlans.map(cm => (<div key={cm.id} className="bg-black/20 p-3 rounded border border-white/5 mb-2"><h4 className="text-sm text-white font-bold">{cm.meal_plan.name}</h4></div>))}</CardContent></Card></TabsContent>
          <TabsContent value="history"><div className="bg-white/5 border-white/10 rounded p-4"><ClientWorkoutHistory clientId={id!} /></div></TabsContent>
          
          {/* Anamnese Vertical */}
          <TabsContent value="anamnesis">
             <Card className="bg-white/5 border-white/10">
                <CardHeader className="p-4 flex flex-row justify-between items-center"><CardTitle className="text-white text-base">Anamnese</CardTitle><Button size="sm" onClick={handleSaveAnamnesis} className="bg-primary text-black font-bold"><Save className="w-4 h-4 mr-1"/> Salvar</Button></CardHeader>
                <CardContent className="p-4 space-y-4">
                    <div><Label className="text-xs text-gray-400">Patologias</Label><Textarea className="bg-black/20 border-white/10 min-h-[80px]" value={anamnesisForm.medical_history} onChange={e => updateAnamnesis('medical_history', e.target.value)}/></div>
                    <div><Label className="text-xs text-gray-400">Lesões</Label><Textarea className="bg-black/20 border-white/10 min-h-[80px]" value={anamnesisForm.injuries} onChange={e => updateAnamnesis('injuries', e.target.value)}/></div>
                    <div><Label className="text-xs text-gray-400">Histórico Alimentar</Label><Textarea className="bg-black/20 border-white/10 min-h-[80px]" value={anamnesisForm.diet_history} onChange={e => updateAnamnesis('diet_history', e.target.value)}/></div>
                </CardContent>
             </Card>
          </TabsContent>
          
          <TabsContent value="info"><div className="space-y-4"><Card className="bg-white/5 border-white/10"><CardHeader className="p-4"><CardTitle className="text-white text-sm">Objetivos</CardTitle></CardHeader><CardContent className="p-4 pt-0 text-sm text-gray-300">{clientDetails?.goals || '---'}</CardContent></Card></div></TabsContent>

        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails