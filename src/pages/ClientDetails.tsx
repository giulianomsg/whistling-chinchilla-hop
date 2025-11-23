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
  Pencil, Trash2, LayoutDashboard, Trophy, MessageSquare, Camera, Image as ImageIcon
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
  const [progressPhotos, setProgressPhotos] = useState<any[]>([])
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([])
  const [availableMealPlans, setAvailableMealPlans] = useState<any[]>([])

  const [isAssignWorkoutOpen, setIsAssignWorkoutOpen] = useState(false)
  const [isAssignMealPlanOpen, setIsAssignMealPlanOpen] = useState(false)
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false)
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false)
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
  const [newPhoto, setNewPhoto] = useState({ date: new Date().toISOString().split('T')[0], notes: '', file: null as File | null })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

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
        const cPhotos = await supabase.from('progress_photos').select('*').eq('client_id', id).order('date', { ascending: false })
        const myWorkouts = await supabase.from('workouts').select('*').eq('professional_id', user.id).eq('is_template', false)
        const myMealPlans = await supabase.from('meal_plans').select('*').eq('nutritionist_id', user.id)

        if (profileRes.error) throw profileRes.error
        
        setClientProfile(profileRes.data)
        setClientDetails(detailsRes.data)
        setClientWorkouts(cWorkouts.data || [])
        setClientMealPlans(cMeals.data || [])
        setAssessments(cAssessments.data || [])
        setProgressPhotos(cPhotos.data || [])
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

  const handlePhotoUpload = async () => {
    if (!newPhoto.file || !user) return
    setUploadingPhoto(true)
    try {
        const fileExt = newPhoto.file.name.split('.').pop()
        const fileName = `${id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('progress-photos').upload(fileName, newPhoto.file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('progress-photos').getPublicUrl(fileName)
        const { error: dbError } = await supabase.from('progress_photos').insert({
            client_id: id, photo_url: publicUrl, date: newPhoto.date, notes: newPhoto.notes
        })
        if (dbError) throw dbError
        showSuccess('Foto adicionada!')
        setIsAddPhotoOpen(false)
        setNewPhoto({ date: new Date().toISOString().split('T')[0], notes: '', file: null })
        const { data } = await supabase.from('progress_photos').select('*').eq('client_id', id).order('date', { ascending: false })
        setProgressPhotos(data || [])
    } catch (e: any) { showError('Erro no upload: ' + e.message) }
    finally { setUploadingPhoto(false) }
  }

  const handleDeletePhoto = async (photoId: string, url: string) => {
      if (!confirm('Excluir foto?')) return
      try {
          const { error } = await supabase.from('progress_photos').delete().eq('id', photoId)
          if (error) throw error
          showSuccess('Foto removida.')
          setProgressPhotos(prev => prev.filter(p => p.id !== photoId))
      } catch (e) { showError('Erro ao excluir') }
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  const latestAssessment = assessments.find(a => a.measurements?.status === 'completed') || assessments[0]
  const activeWorkout = clientWorkouts.find(w => w.status === 'active')
  const activeMealPlan = clientMealPlans.find(m => m.status === 'active')
  const currentXP = clientProfile?.current_xp || 0
  const currentLevel = clientProfile?.level || 1
  const xpProgress = ((currentXP % 1000) / 1000) * 100

  return (
    <div className="min-h-screen bg-background py-4 md:py-8 w-full overflow-x-hidden">
      <div className="w-full px-4 md:max-w-7xl md:mx-auto md:px-8">
        
        <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/app/clients')} className="text-gray-400 hover:text-white pl-0 gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar para Lista
            </Button>
        </div>

        {/* TABS COM CORREÇÃO DE LAYOUT MOBILE (display: grid) */}
        <Tabs defaultValue="dashboard" className="space-y-6 w-full" style={{ display: 'grid' }}>
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="bg-white/5 border border-white/10 justify-start p-1 flex min-w-max h-10">
              <TabsTrigger value="dashboard" className="px-4 py-1.5 text-sm"><LayoutDashboard className="w-4 h-4 mr-2"/> Visão Geral</TabsTrigger>
              <TabsTrigger value="photos" className="px-4 py-1.5 text-sm"><Camera className="w-4 h-4 mr-2"/> Fotos</TabsTrigger>
              <TabsTrigger value="workouts" className="px-4 py-1.5 text-sm">Treinos</TabsTrigger>
              <TabsTrigger value="meal-plans" className="px-4 py-1.5 text-sm">Dietas</TabsTrigger>
              <TabsTrigger value="biometrics" className="px-4 py-1.5 text-sm"><Scale className="w-4 h-4 mr-2"/> Biometria</TabsTrigger>
              <TabsTrigger value="anamnesis" className="px-4 py-1.5 text-sm"><FileText className="w-4 h-4 mr-2"/> Anamnese</TabsTrigger>
              <TabsTrigger value="history" className="px-4 py-1.5 text-sm">Histórico</TabsTrigger>
              <TabsTrigger value="info" className="px-4 py-1.5 text-sm">Perfil</TabsTrigger>
            </TabsList>
          </div>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-left-2 duration-500 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              {/* Perfil */}
              <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 shadow-xl relative overflow-hidden w-full">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><User className="w-64 h-64 text-primary"/></div>
                <CardContent className="pt-8 px-6 md:px-10 pb-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start w-full">
                    <div className="relative flex-shrink-0">
                      <div className="w-32 h-32 rounded-full border-4 border-primary/20 p-1 mx-auto">
                        <div className="w-full h-full rounded-full bg-black overflow-hidden">
                          {clientProfile?.avatar_url ? <img src={clientProfile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-gray-400">{clientProfile?.full_name?.[0]}</div>}
                        </div>
                      </div>
                      <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black border-none whitespace-nowrap shadow-lg font-bold px-4 py-1 text-sm">Nível {currentLevel}</Badge>
                    </div>
                    <div className="flex-1 w-full text-center md:text-left min-w-0">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 truncate">{clientProfile?.full_name}</h2>
                      <div className="flex flex-col md:flex-row items-center md:justify-start gap-2 md:gap-6 text-sm md:text-base text-gray-400 mb-6 w-full">
                        <span className="flex items-center gap-2 truncate max-w-full"><Mail className="w-4 h-4 text-primary flex-shrink-0"/> {clientProfile?.email}</span>
                        {clientProfile?.phone && <span className="flex items-center gap-2 truncate max-w-full"><Phone className="w-4 h-4 text-primary flex-shrink-0"/> {clientProfile?.phone}</span>}
                      </div>
                      <div className="space-y-2 w-full max-w-md mx-auto md:mx-0">
                        <div className="flex justify-between text-sm font-medium text-primary"><span>XP Atual</span><span>{currentXP % 1000} / 1000</span></div>
                        <Progress value={xpProgress} className="h-3 bg-white/10" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card className="bg-white/5 border-white/10 w-full h-full">
                <CardHeader className="pb-4 px-6 pt-6"><CardTitle className="text-sm text-gray-400 font-medium uppercase tracking-wider">Ações Rápidas</CardTitle></CardHeader>
                <CardContent className="px-6 pb-6 grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto py-4 md:h-28 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 hover:border-primary/50 transition-all" onClick={() => setIsAssignWorkoutOpen(true)}>
                    <Dumbbell className="h-6 w-6 md:w-8 md:h-8 text-blue-400 mb-1"/> <span className="text-xs md:text-sm font-medium">Treino</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 md:h-28 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 hover:border-primary/50 transition-all" onClick={() => setIsAssignMealPlanOpen(true)}>
                    <Utensils className="h-6 w-6 md:w-8 md:h-8 text-orange-400 mb-1"/> <span className="text-xs md:text-sm font-medium">Dieta</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 md:h-28 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 hover:border-primary/50 transition-all" onClick={openNewAssessment}>
                    <Scale className="h-6 w-6 md:w-8 md:h-8 text-green-400 mb-1"/> <span className="text-xs md:text-sm font-medium">Avaliar</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 md:h-28 flex-col border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 hover:border-primary/50 transition-all" onClick={() => navigate('/app/chat')}>
                    <MessageSquare className="h-6 w-6 md:w-8 md:h-8 text-purple-400 mb-1"/> <span className="text-xs md:text-sm font-medium">Chat</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Métricas */}
              <Card className="bg-white/5 border-white/10 lg:col-span-3 w-full">
                <CardHeader className="pb-4 px-6 pt-6 border-b border-white/5"><CardTitle className="text-white flex items-center gap-3 text-xl"><Activity className="h-6 w-6 text-primary"/> Status Vital</CardTitle></CardHeader>
                <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-black/20 p-6 rounded-xl border border-white/5 flex justify-between items-center md:block">
                    <p className="text-gray-400 text-xs uppercase tracking-wider md:mb-2">Peso Atual</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{latestAssessment?.weight ? `${latestAssessment.weight}` : '--'} <span className="text-lg text-gray-500 font-normal">kg</span></p>
                  </div>
                  <div className="bg-black/20 p-6 rounded-xl border border-white/5 flex justify-between items-center md:block">
                    <p className="text-gray-400 text-xs uppercase tracking-wider md:mb-2">Gordura</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{latestAssessment?.body_fat_percentage ? `${latestAssessment.body_fat_percentage}` : '--'} <span className="text-lg text-gray-500 font-normal">%</span></p>
                  </div>
                  <div className={`bg-black/20 p-6 rounded-xl border ${activeWorkout ? 'border-green-500/30 bg-green-900/10' : 'border-white/5'} flex justify-between items-center md:block`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-400 text-xs uppercase tracking-wider md:mb-2">Plano de Treino</p>
                      <p className={`text-xl font-bold truncate ${activeWorkout ? 'text-green-400' : 'text-gray-500'}`}>{activeWorkout?.workout.name || 'Nenhum Ativo'}</p>
                    </div>
                  </div>
                  <div className={`bg-black/20 p-6 rounded-xl border ${activeMealPlan ? 'border-orange-500/30 bg-orange-900/10' : 'border-white/5'} flex justify-between items-center md:block`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-400 text-xs uppercase tracking-wider md:mb-2">Dieta Atual</p>
                      <p className={`text-xl font-bold truncate ${activeMealPlan ? 'text-orange-400' : 'text-gray-500'}`}>{activeMealPlan?.meal_plan.name || 'Nenhuma Ativa'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FOTOS */}
          <TabsContent value="photos">
            <Card className="bg-white/5 border-white/10 w-full">
               <CardHeader className="flex flex-row items-center justify-between p-6">
                  <CardTitle className="text-white text-xl flex items-center gap-2"><ImageIcon className="h-6 w-6 text-purple-400"/> Galeria de Evolução</CardTitle>
                  <Dialog open={isAddPhotoOpen} onOpenChange={setIsAddPhotoOpen}>
                    <DialogTrigger asChild><Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold"><Plus className="h-4 w-4 mr-2"/> Add Foto</Button></DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] rounded-lg">
                       <DialogHeader><DialogTitle>Adicionar Foto de Progresso</DialogTitle></DialogHeader>
                       <div className="space-y-4 mt-4">
                          <div><Label>Data da Foto</Label><Input type="date" value={newPhoto.date} onChange={e => setNewPhoto({...newPhoto, date: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div>
                          <div><Label>Arquivo</Label><Input type="file" accept="image/*" onChange={e => setNewPhoto({...newPhoto, file: e.target.files?.[0] || null})} className="bg-black/20 border-white/10 text-white"/></div>
                          <div><Label>Notas</Label><Input placeholder="Ex: Frente, relaxado" value={newPhoto.notes} onChange={e => setNewPhoto({...newPhoto, notes: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div>
                          <Button onClick={handlePhotoUpload} disabled={uploadingPhoto} className="w-full bg-purple-600 hover:bg-purple-700">
                             {uploadingPhoto ? <Loader2 className="animate-spin h-4 w-4"/> : 'Salvar Foto'}
                          </Button>
                       </div>
                    </DialogContent>
                  </Dialog>
               </CardHeader>
               <CardContent className="p-6">
                  {progressPhotos.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                       <Camera className="h-12 w-12 mx-auto mb-3 opacity-20"/>
                       <p>Nenhuma foto registrada.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       {progressPhotos.map(photo => (
                         <div key={photo.id} className="group relative bg-black/40 rounded-xl overflow-hidden border border-white/10 aspect-[3/4] shadow-lg">
                            <img src={photo.photo_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                               <span className="text-sm font-bold text-white">{new Date(photo.date).toLocaleDateString('pt-BR')}</span>
                               {photo.notes && <span className="text-xs text-gray-300 truncate">{photo.notes}</span>}
                               <Button size="icon" variant="destructive" className="h-8 w-8 absolute top-2 right-2" onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center md:hidden backdrop-blur-sm">
                               <span className="text-xs font-bold text-white">{new Date(photo.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
               </CardContent>
            </Card>
          </TabsContent>

          {/* BIOMETRIA */}
          <TabsContent value="biometrics">
            <Card className="bg-white/5 border-white/10 w-full">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                <CardTitle className="text-white text-xl">Histórico de Avaliações</CardTitle>
                <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
                  <DialogTrigger asChild><Button onClick={openNewAssessment} className="bg-primary text-black hover:bg-primary/80 font-bold w-full sm:w-auto"><Plus className="w-4 h-4 mr-2"/> Nova Avaliação</Button></DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-0 rounded-lg">
                    <div className="p-6">
                      <DialogHeader className="mb-6"><DialogTitle>{editingAssessmentId ? 'Editar' : 'Nova'} Avaliação</DialogTitle></DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-5"><h3 className="font-semibold text-primary">Básico</h3><div className="grid grid-cols-1 gap-3"><div><Label>Data</Label><Input type="date" value={newAssessment.date} onChange={e => setNewAssessment({...newAssessment, date: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div><div className="grid grid-cols-2 gap-3"><div><Label>Peso (kg)</Label><Input type="number" value={newAssessment.weight} onChange={e => setNewAssessment({...newAssessment, weight: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div><div><Label>Altura (cm)</Label><Input type="number" value={newAssessment.height} onChange={e => setNewAssessment({...newAssessment, height: e.target.value})} className="bg-black/20 border-white/10 text-white"/></div></div><div className="grid grid-cols-2 gap-3"><div><Label>Idade</Label><Input type="number" value={newAssessment.age} onChange={e => setNewAssessment({...newAssessment, age: Number(e.target.value)})} className="bg-black/20 border-white/10 text-white"/></div><div><Label>Gênero</Label><Select value={newAssessment.gender} onValueChange={v => setNewAssessment({...newAssessment, gender: v})}><SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue/></SelectTrigger><SelectContent className="bg-slate-800 text-white border-white/10"><SelectItem value="male">Masculino</SelectItem><SelectItem value="female">Feminino</SelectItem></SelectContent></Select></div></div></div></div>
                        <div className="space-y-5"><h3 className="font-semibold text-primary">Dobras</h3><div className="grid grid-cols-2 gap-3">{Object.keys(newAssessment.skinfolds).map(k => (<div key={k}><Label className="text-xs text-gray-400 uppercase">{SKINFOLD_LABELS[k]?.slice(0,3)}</Label><Input type="number" value={(newAssessment.skinfolds as any)[k]} onChange={e => updateNested('skinfolds', k, e.target.value)} className="bg-black/20 border-white/10 text-white h-9"/></div>))}</div></div>
                        <div className="space-y-5"><h3 className="font-semibold text-primary">Perímetros</h3><div className="grid grid-cols-2 gap-3">{Object.keys(newAssessment.circumferences).map(k => (<div key={k}><Label className="text-xs text-gray-400 uppercase">{CIRCUMFERENCE_LABELS[k]?.slice(0,3)}</Label><Input type="number" value={(newAssessment.circumferences as any)[k]} onChange={e => updateNested('circumferences', k, e.target.value)} className="bg-black/20 border-white/10 text-white h-9"/></div>))}</div></div>
                      </div>
                    </div>
                    <DialogFooter className="p-6 border-t border-white/10 gap-3 flex-col sm:flex-row bg-black/20"><Button variant="outline" onClick={() => handleSaveAssessment('draft')} className="border-white/10 text-white hover:bg-white/5 w-full sm:w-auto">Salvar Rascunho</Button><Button onClick={() => handleSaveAssessment('completed')} className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto">Finalizar</Button></DialogFooter>
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
                        <div key={assessment.id} className={`bg-black/20 p-5 rounded-xl border ${status === 'draft' ? 'border-yellow-500/30' : 'border-white/5'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                          <div className="flex items-center gap-5 w-full md:w-auto">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm flex-col flex-shrink-0 ${status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary'}`}>
                              <span>{new Date(assessment.date).getDate()}</span>
                              <span className="uppercase text-[10px]">{new Date(assessment.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-white font-bold text-xl">{assessment.weight} kg</span>
                                {status === 'draft' ? <Badge variant="secondary" className="text-yellow-400 bg-yellow-900/20 border-none text-xs">Rascunho</Badge> : <Badge variant="outline" className={`text-xs ${bmiInfo.color} border-current`}>{bmiInfo.label}</Badge>}
                              </div>
                              {status === 'draft' ? (
                                <div className="w-full md:w-40 mt-2">
                                  <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Preenchimento</span><span>{completion}%</span></div>
                                  <Progress value={completion} className="h-1.5 bg-white/10" />
                                </div>
                              ) : (
                                <div className="text-sm text-gray-400 flex gap-4 mt-1">
                                  <span>Gord: {assessment.body_fat_percentage}%</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>Massa: {assessment.muscle_mass}kg</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto justify-end pt-4 md:pt-0">
                            <Button variant="ghost" size="sm" onClick={() => openEditAssessment(assessment)} className="text-blue-400 hover:bg-blue-500/10 gap-2"><Pencil className="h-4 w-4"/><span className="md:hidden">Editar</span></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAssessment(assessment.id)} className="text-red-400 hover:bg-red-500/10 gap-2"><Trash2 className="h-4 w-4"/><span className="md:hidden">Excluir</span></Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* OUTRAS ABAS (Mantidas) */}
          <TabsContent value="workouts"><Card className="bg-white/5 border-white/10"><CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><CardTitle className="text-white text-lg">Treinos</CardTitle><Dialog open={isAssignWorkoutOpen} onOpenChange={setIsAssignWorkoutOpen}><DialogTrigger asChild><Button size="sm" className="bg-blue-600 w-full sm:w-auto"><Plus className="mr-2 h-4 w-4"/> Atribuir</Button></DialogTrigger><DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] rounded-lg"><DialogHeader><DialogTitle>Atribuir Treino</DialogTitle></DialogHeader><div className="space-y-4 mt-4"><Select onValueChange={setSelectedWorkoutId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Treino..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableWorkouts.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/><Button onClick={handleAssignWorkout} className="w-full bg-blue-600 hover:bg-blue-500">Confirmar</Button></div></DialogContent></Dialog></CardHeader><CardContent className="p-6">{clientWorkouts.map(cw => (<div key={cw.id} className="bg-black/20 p-4 rounded-lg border border-white/5 mb-3 flex flex-col sm:flex-row justify-between items-center gap-3"><div><h4 className="text-base font-bold text-white">{cw.workout.name}</h4><div className="text-sm text-gray-400">{cw.workout.days_per_week}x semana</div></div><Button size="sm" variant="ghost" onClick={() => handleRemoveAssignment('client_workouts', cw.id)} className="text-red-400 hover:bg-red-900/20 w-full sm:w-auto gap-2"><Trash2 className="h-4 w-4"/> Remover</Button></div>))}</CardContent></Card></TabsContent>
          <TabsContent value="meal-plans"><Card className="bg-white/5 border-white/10"><CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><CardTitle className="text-white text-lg">Dietas</CardTitle><Dialog open={isAssignMealPlanOpen} onOpenChange={setIsAssignMealPlanOpen}><DialogTrigger asChild><Button size="sm" className="bg-green-600 w-full sm:w-auto"><Plus className="mr-2 h-4 w-4"/> Atribuir</Button></DialogTrigger><DialogContent className="bg-slate-900 border-white/10 text-white w-[95%] rounded-lg"><DialogHeader><DialogTitle>Atribuir Dieta</DialogTitle></DialogHeader><div className="space-y-4 mt-4"><Select onValueChange={setSelectedMealPlanId}><SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Dieta..."/></SelectTrigger><SelectContent className="bg-slate-800 border-white/10 text-white">{availableMealPlans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/20 border-white/10 text-white"/><Button onClick={handleAssignMealPlan} className="w-full bg-green-600 hover:bg-green-500">Confirmar</Button></div></DialogContent></Dialog></CardHeader><CardContent className="p-6">{clientMealPlans.map(cm => (<div key={cm.id} className="bg-black/20 p-4 rounded-lg border border-white/5 mb-3 flex flex-col sm:flex-row justify-between items-center gap-3"><div><h4 className="text-base font-bold text-white">{cm.meal_plan.name}</h4><div className="text-sm text-gray-400">{cm.meal_plan.daily_calories_target} kcal</div></div><Button size="sm" variant="ghost" onClick={() => handleRemoveAssignment('client_meal_plans', cm.id)} className="text-red-400 hover:bg-red-900/20 w-full sm:w-auto gap-2"><Trash2 className="h-4 w-4"/> Remover</Button></div>))}</CardContent></Card></TabsContent>
          <TabsContent value="history"><div className="bg-white/5 border border-white/10 rounded-xl p-6"><ClientWorkoutHistory clientId={id!} /></div></TabsContent>
          <TabsContent value="anamnesis"><div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="text-primary"/> Anamnese Profissional</h2><Button onClick={handleSaveAnamnesis} className="bg-primary text-black hover:bg-primary/80 font-bold shadow-lg w-full sm:w-auto"><Save className="mr-2 h-4 w-4"/> Salvar Ficha</Button></div><Tabs defaultValue="medical" className="w-full"><TabsList className="bg-black/20 border border-white/10 w-full justify-start h-12 mb-6"><TabsTrigger value="medical" className="flex-1 h-10">Saúde</TabsTrigger><TabsTrigger value="lifestyle" className="flex-1 h-10">Estilo</TabsTrigger><TabsTrigger value="nutri" className="flex-1 h-10">Nutri</TabsTrigger></TabsList><TabsContent value="medical"><Card className="bg-white/5 border-white/10"><CardContent className="p-6 space-y-6"><div><Label className="text-gray-300 mb-2 block">Patologias</Label><Textarea value={anamnesisForm.medical_history} onChange={e => updateAnamnesis('medical_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]"/></div><div><Label className="text-gray-300 mb-2 block">Lesões</Label><Textarea value={anamnesisForm.injuries} onChange={e => updateAnamnesis('injuries', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]"/></div></CardContent></Card></TabsContent><TabsContent value="lifestyle"><Card className="bg-white/5 border-white/10"><CardContent className="p-6 space-y-6"><div><Label className="text-gray-300 mb-2 block">Profissão</Label><Input value={anamnesisForm.occupation} onChange={e => updateAnamnesis('occupation', e.target.value)} className="bg-black/20 border-white/10 h-10"/></div><div className="flex justify-between items-center bg-black/20 p-4 rounded border border-white/5"><Label className="text-gray-300">Fumante?</Label><Switch checked={anamnesisForm.smoker} onCheckedChange={c => updateAnamnesis('smoker', c)} /></div></CardContent></Card></TabsContent><TabsContent value="nutri"><Card className="bg-white/5 border-white/10"><CardContent className="p-6 space-y-6"><div><Label className="text-gray-300 mb-2 block">Água (L)</Label><Input value={anamnesisForm.water_intake} onChange={e => updateAnamnesis('water_intake', e.target.value)} className="bg-black/20 border-white/10 h-10"/></div><div><Label className="text-gray-300 mb-2 block">Histórico</Label><Textarea value={anamnesisForm.diet_history} onChange={e => updateAnamnesis('diet_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]"/></div></CardContent></Card></TabsContent></Tabs></TabsContent>
          <TabsContent value="info"><div className="space-y-6"><Card className="bg-white/5 border-white/10"><CardHeader className="p-6 pb-2"><CardTitle className="text-white text-lg">Objetivos</CardTitle></CardHeader><CardContent className="p-6 pt-2 text-gray-300">{clientDetails?.goals || '---'}</CardContent></Card><Card className="bg-white/5 border-white/10"><CardHeader className="p-6 pb-2"><CardTitle className="text-white text-lg">Restrições</CardTitle></CardHeader><CardContent className="p-6 pt-2 text-gray-300">{clientDetails?.health_restrictions || '---'}</CardContent></Card></div></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ClientDetails