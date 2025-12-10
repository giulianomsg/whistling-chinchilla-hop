import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  User, Mail, Phone, ArrowLeft, Dumbbell, Utensils,
  Loader2, Plus,
  FileText, Save, HeartPulse, Activity, Apple, Scale, Ruler, TrendingUp,
  Pencil, Trash2, LayoutDashboard, Trophy, MessageSquare, Camera, Image as ImageIcon,
  AlertTriangle, Stethoscope, Calendar, Clock, CheckCircle, AlertCircle, Play, ChevronRight, ExternalLink
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'
import { calculateBiometrics, classifyBMI, calculateCompletion } from '@/utils/biometrics'
import { AchievementsList } from '@/components/gamification/AchievementsList'

const SKINFOLD_LABELS: Record<string, string> = { triceps: 'Tríceps', biceps: 'Bíceps', subscapular: 'Subescapular', chest: 'Peitoral', axillary: 'Axilar Média', suprailiac: 'Supra-ilíaca', abdominal: 'Abdominal', thigh: 'Coxa', calf: 'Panturrilha' }
const CIRCUMFERENCE_LABELS: Record<string, string> = { shoulder: 'Ombros', chest: 'Tórax', arm_right: 'Braço Dir.', arm_left: 'Braço Esq.', waist: 'Cintura', abdomen: 'Abdômen', hips: 'Quadril', thigh_right: 'Coxa Dir.', thigh_left: 'Coxa Esq.', calf_right: 'Panturrilha Dir.', calf_left: 'Panturrilha Esq.' }
const COMMON_CONDITIONS = ['Diabetes', 'Hipertensão', 'Asma', 'Artrite', 'Problema Renal', 'Anemia', 'Problemas Oculares', 'Obesidade', 'Colesterol Alto']
const COMMON_SYMPTOMS = ['Dor no Peito', 'Falta de Ar', 'Tontura', 'Palpitações', 'Dores Articulares', 'Dor nas Costas', 'Fraqueza', 'Tosse com Sangue']
const WORK_ACTIVITIES = ['Sentar na cadeira', 'Ficar de pé', 'Caminhar', 'Levantar peso', 'Dirigir']

const analyzeHealth = (anamnesis: any, latestBiometrics: any) => {
  const safeAnamnesis = anamnesis || {}
  const risks = {
    cardio: { level: 'low', factors: [] as string[] },
    metabolic: { level: 'low', factors: [] as string[] },
    orthopedic: { level: 'low', factors: [] as string[] },
    redFlags: [] as string[]
  }
  const symptoms = safeAnamnesis.symptoms || []
  const conditions = safeAnamnesis.diagnosed_conditions || []
  const injuries = safeAnamnesis.injuries || ''
  const familyHistory = safeAnamnesis.family_history || ''
  const dietHistory = safeAnamnesis.diet_history || ''

  if (symptoms.includes('Dor no Peito')) risks.redFlags.push('Dor no Peito (Angina?)')
  if (symptoms.includes('Falta de Ar')) risks.redFlags.push('Dispneia ao esforço')
  if (symptoms.includes('Tontura')) risks.redFlags.push('Tonturas/Desmaios')
  if (symptoms.includes('Palpitações')) risks.redFlags.push('Arritmia/Palpitações')
  if (symptoms.includes('Tosse com Sangue')) risks.redFlags.push('Hemoptise')

  let cardioScore = 0
  if (safeAnamnesis.smoker) { cardioScore += 2; risks.cardio.factors.push('Tabagismo') }
  if (conditions.includes('Hipertensão')) { cardioScore += 2; risks.cardio.factors.push('Hipertensão') }
  if (conditions.includes('Colesterol Alto')) { cardioScore += 1; risks.cardio.factors.push('Dislipidemia') }
  if (familyHistory.toLowerCase().includes('infarto') || familyHistory.toLowerCase().includes('coração')) { cardioScore += 1; risks.cardio.factors.push('Histórico Familiar') }
  if (safeAnamnesis.stress_level === 'high') { cardioScore += 1; risks.cardio.factors.push('Alto Estresse') }
  if (latestBiometrics?.bmi > 30) { cardioScore += 1; risks.cardio.factors.push('Obesidade (IMC > 30)') }
  if (cardioScore >= 3) risks.cardio.level = 'high'; else if (cardioScore >= 1) risks.cardio.level = 'medium'

  let metaScore = 0
  if (conditions.includes('Diabetes')) { metaScore += 3; risks.metabolic.factors.push('Diabetes') }
  if (latestBiometrics?.bmi > 25) { metaScore += 1; risks.metabolic.factors.push('Sobrepeso') }
  if (safeAnamnesis.activity_level === 'sedentary') { metaScore += 1; risks.metabolic.factors.push('Sedentarismo') }
  if (dietHistory.toLowerCase().includes('açúcar') || dietHistory.toLowerCase().includes('doce')) { metaScore += 1; risks.metabolic.factors.push('Dieta Rica em Açúcar') }
  if (metaScore >= 3) risks.metabolic.level = 'high'; else if (metaScore >= 1) risks.metabolic.level = 'medium'

  let orthoScore = 0
  if (injuries.length > 3) { orthoScore += 2; risks.orthopedic.factors.push('Histórico de Lesões') }
  if (symptoms.includes('Dores Articulares')) { orthoScore += 2; risks.orthopedic.factors.push('Dores Articulares Ativas') }
  if (symptoms.includes('Dor nas Costas')) { orthoScore += 1; risks.orthopedic.factors.push('Lombalgia/Dorsalgia') }
  if (safeAnamnesis.work_activities?.includes('Levantar peso')) { orthoScore += 1; risks.orthopedic.factors.push('Trabalho com Carga') }
  if (orthoScore >= 3) risks.orthopedic.level = 'high'; else if (orthoScore >= 1) risks.orthopedic.level = 'medium'

  let wellness = 100
  if (safeAnamnesis.smoker) wellness -= 20
  if (safeAnamnesis.alcohol === 'frequently') wellness -= 15
  if (safeAnamnesis.stress_level === 'high') wellness -= 15
  if (safeAnamnesis.sleep_quality === 'bad') wellness -= 15
  if (Number(safeAnamnesis.water_intake || 0) < 1.5) wellness -= 10
  if (safeAnamnesis.activity_level === 'sedentary') wellness -= 15

  return { risks, wellness: Math.max(0, wellness) }
}

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  const [clientProfile, setClientProfile] = useState<any>(null)
  const [clientDetails, setClientDetails] = useState<any>(null)
  const [clientWorkouts, setClientWorkouts] = useState<any[]>([])
  const [clientMealPlans, setClientMealPlans] = useState<any[]>([])
  const [assessments, setAssessments] = useState<any[]>([])
  const [progressPhotos, setProgressPhotos] = useState<any[]>([])
  const [historySessions, setHistorySessions] = useState<any[]>([])
  const [selectedHistorySession, setSelectedHistorySession] = useState<any>(null)
  const [historyLogs, setHistoryLogs] = useState<any[]>([])
  const [historyLogsLoading, setHistoryLogsLoading] = useState(false)
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false)
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
  const [isAnamnesisEditing, setIsAnamnesisEditing] = useState(false)

  const [anamnesisForm, setAnamnesisForm] = useState({
    occupation: '', work_hours: '', work_activities: [] as string[], last_exam_date: '',
    family_history: '', diagnosed_conditions: [] as string[], symptoms: [] as string[],
    surgeries: '', injuries: '', medications: '', allergies: '',
    smoker: false, alcohol: 'never', physical_restrictions: '',
    sleep_hours: '', sleep_quality: '', stress_level: '', water_intake: '',
    diet_history: '', supplements: '', food_aversions: '', activity_level: 'sedentary'
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
        const cHistory = await supabase.from('workout_sessions').select(`*, workout:workouts(name)`).eq('client_id', id).order('created_at', { ascending: false }).limit(20)
        const myWorkouts = await supabase.from('workouts').select('*').eq('professional_id', user.id).eq('is_template', false)
        const myMealPlans = await supabase.from('meal_plans').select('*').eq('nutritionist_id', user.id)

        if (profileRes.error) throw profileRes.error

        const combinedProfile = { ...profileRes.data, ...detailsRes.data }
        setClientProfile(combinedProfile)
        setClientDetails(detailsRes.data)
        setClientWorkouts(cWorkouts.data || [])
        setClientMealPlans(cMeals.data || [])
        setAssessments(cAssessments.data || [])
        setProgressPhotos(cPhotos.data || [])
        setHistorySessions(cHistory.data || [])
        setAvailableWorkouts(myWorkouts.data || [])
        setAvailableMealPlans(myMealPlans.data || [])

        if (detailsRes.data?.anamnesis_data) {
          const data = typeof detailsRes.data.anamnesis_data === 'string' ? JSON.parse(detailsRes.data.anamnesis_data) : detailsRes.data.anamnesis_data
          setAnamnesisForm(prev => ({
            ...prev,
            ...data,
            diagnosed_conditions: data.diagnosed_conditions || [],
            symptoms: data.symptoms || [],
            work_activities: data.work_activities || []
          }))
        }
      } catch (error) { console.error(error); showError('Erro ao carregar dados') }
      finally { setLoading(false) }
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
      setActiveTab('workouts')
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
      setActiveTab('meal-plans')
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
      showSuccess('Anamnese completa salva!')
    } catch (e) { showError('Erro ao salvar') }
  }

  const updateAnamnesis = (field: string, value: any) => setAnamnesisForm(prev => ({ ...prev, [field]: value }))

  const toggleAnamnesisList = (field: 'diagnosed_conditions' | 'symptoms' | 'work_activities', item: string) => {
    setAnamnesisForm(prev => {
      const list = prev[field] || []
      return list.includes(item) ? { ...prev, [field]: list.filter(i => i !== item) } : { ...prev, [field]: [...list, item] }
    })
  }

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
        gender: newAssessment.gender as 'male' | 'female', age: Number(newAssessment.age),
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
      if (editingAssessmentId) await supabase.from('biometric_data').update(payload).eq('id', editingAssessmentId)
      else await supabase.from('biometric_data').insert(payload)

      showSuccess(status === 'draft' ? 'Rascunho salvo!' : 'Avaliação finalizada!')
      setIsNewAssessmentOpen(false)
      const { data } = await supabase.from('biometric_data').select('*').eq('client_id', id).order('date', { ascending: false })
      setAssessments(data || [])
    } catch (e: any) { console.error(e); showError('Erro ao salvar avaliação') }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm('Tem certeza?')) return
    try {
      await supabase.from('biometric_data').delete().eq('id', assessmentId)
      showSuccess('Avaliação excluída.')
      setAssessments(prev => prev.filter(a => a.id !== assessmentId))
    } catch (e) { showError('Erro ao excluir') }
  }

  const updateNested = (section: 'skinfolds' | 'circumferences', field: string, value: string) => {
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

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Excluir foto?')) return
    try {
      await supabase.from('progress_photos').delete().eq('id', photoId)
      showSuccess('Foto removida.')
      setProgressPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (e) { showError('Erro ao excluir') }
  }

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
    return m > 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m} min`
  }

  const handleHistorySessionClick = async (session: any) => {
    setSelectedHistorySession(session)
    setIsHistoryDetailOpen(true)
    setHistoryLogsLoading(true)

    const { data } = await supabase
      .from('workout_execution_logs')
      .select(`
        *,
        exercise:exercises_library(name)
      `)
      .eq('workout_session_id', session.id)
      .order('completed_at', { ascending: true })

    setHistoryLogs(data || [])
    setHistoryLogsLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

  const latestAssessment = assessments.find(a => a.measurements?.status === 'completed') || assessments[0]
  const activeWorkout = clientWorkouts.find(w => w.status === 'active')
  const activeMealPlan = clientMealPlans.find(m => m.status === 'active')
  const currentXP = clientProfile?.current_xp || 0
  const currentLevel = clientProfile?.level || 1
  const xpProgress = ((currentXP % 1000) / 1000) * 100

  const healthAnalysis = analyzeHealth(anamnesisForm, { bmi: latestAssessment ? Number((latestAssessment.weight / ((latestAssessment.height / 100) ** 2)).toFixed(2)) : 0 })
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background py-4 md:py-8 w-full overflow-x-hidden">
      <div className="w-full px-4 md:max-w-7xl md:mx-auto md:px-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/app/clients')} className="text-muted-foreground hover:text-foreground pl-0 gap-2"><ArrowLeft className="h-4 w-4" /> Voltar</Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full" style={{ display: 'grid' }}>
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="bg-muted border border-border justify-start p-1 flex min-w-max h-10">
              <TabsTrigger value="dashboard" className="px-4 py-1.5 text-sm"><LayoutDashboard className="w-4 h-4 mr-2" /> Visão Geral</TabsTrigger>
              <TabsTrigger value="photos" className="px-4 py-1.5 text-sm"><Camera className="w-4 h-4 mr-2" /> Fotos</TabsTrigger>
              <TabsTrigger value="anamnesis" className="px-4 py-1.5 text-sm"><FileText className="w-4 h-4 mr-2" /> Anamnese</TabsTrigger>
              <TabsTrigger value="biometrics" className="px-4 py-1.5 text-sm"><Scale className="w-4 h-4 mr-2" /> Biometria</TabsTrigger>
              <TabsTrigger value="history" className="px-4 py-1.5 text-sm"><Activity className="w-4 h-4 mr-2" /> Histórico</TabsTrigger>
              <TabsTrigger value="workouts" className="px-4 py-1.5 text-sm">Treinos</TabsTrigger>
              <TabsTrigger value="meal-plans" className="px-4 py-1.5 text-sm">Dietas</TabsTrigger>
              <TabsTrigger value="achievements" className="px-4 py-1.5 text-sm"><Trophy className="w-4 h-4 mr-2" /> Conquistas</TabsTrigger>
              <TabsTrigger value="info" className="px-4 py-1.5 text-sm">Info</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="achievements">
            <AchievementsList />
          </TabsContent>
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-card p-6 rounded-xl border border-border shadow-sm">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={clientProfile?.avatar_url} />
                <AvatarFallback className="text-2xl">{clientProfile?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <h2 className="text-2xl font-bold text-foreground">{clientProfile?.full_name}</h2>
                <div className="flex flex-col gap-2 mt-2 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${clientProfile?.email || ''}`}
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="Enviar Email"
                    >
                      <Mail className="h-3 w-3" />
                    </a>
                    <span>{clientProfile?.email || 'Sem email'}</span>
                  </div>

                  {clientProfile?.phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${clientProfile.phone.replace(/\D/g, '')}`}
                        className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="Ligar"
                      >
                        <Phone className="h-3 w-3" />
                      </a>
                      <span>{clientProfile.phone}</span>
                    </div>
                  )}

                  {clientProfile?.whatsapp && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${clientProfile.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <i className="fa-brands fa-whatsapp text-sm" />
                      </a>
                      <span>{clientProfile.whatsapp}</span>
                    </div>
                  )}

                  {clientProfile?.telegram && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://t.me/${clientProfile.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        title="Abrir Telegram"
                      >
                        <i className="fa-brands fa-telegram text-sm" />
                      </a>
                      <span>{clientProfile.telegram}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">Nível {currentLevel}</Badge>
                  <Badge variant="outline">{clientProfile?.objective || 'Sem objetivo definido'}</Badge>
                </div>
              </div>
            </div>

            {healthAnalysis.risks.redFlags.length > 0 && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção: Fatores de Risco Identificados</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {healthAnalysis.risks.redFlags.map(flag => <li key={flag}>{flag}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card border-border shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="h-5 w-5 text-blue-500" /> Análise de Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span>Cardiovascular</span><span className={`font-bold ${getRiskColor(healthAnalysis.risks.cardio.level)}`}>{healthAnalysis.risks.cardio.level === 'low' ? 'Baixo' : healthAnalysis.risks.cardio.level === 'medium' ? 'Moderado' : 'Alto'}</span></div>
                      <Progress value={healthAnalysis.risks.cardio.level === 'low' ? 33 : healthAnalysis.risks.cardio.level === 'medium' ? 66 : 100} className="h-2" />
                      {healthAnalysis.risks.cardio.factors.length > 0 && <p className="text-xs text-muted-foreground">Fatores: {healthAnalysis.risks.cardio.factors.join(', ')}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span>Metabólico</span><span className={`font-bold ${getRiskColor(healthAnalysis.risks.metabolic.level)}`}>{healthAnalysis.risks.metabolic.level === 'low' ? 'Baixo' : healthAnalysis.risks.metabolic.level === 'medium' ? 'Moderado' : 'Alto'}</span></div>
                      <Progress value={healthAnalysis.risks.metabolic.level === 'low' ? 33 : healthAnalysis.risks.metabolic.level === 'medium' ? 66 : 100} className="h-2" />
                      {healthAnalysis.risks.metabolic.factors.length > 0 && <p className="text-xs text-muted-foreground">Fatores: {healthAnalysis.risks.metabolic.factors.join(', ')}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span>Ortopédico</span><span className={`font-bold ${getRiskColor(healthAnalysis.risks.orthopedic.level)}`}>{healthAnalysis.risks.orthopedic.level === 'low' ? 'Baixo' : healthAnalysis.risks.orthopedic.level === 'medium' ? 'Moderado' : 'Alto'}</span></div>
                      <Progress value={healthAnalysis.risks.orthopedic.level === 'low' ? 33 : healthAnalysis.risks.orthopedic.level === 'medium' ? 66 : 100} className="h-2" />
                      {healthAnalysis.risks.orthopedic.factors.length > 0 && <p className="text-xs text-muted-foreground">Fatores: {healthAnalysis.risks.orthopedic.factors.join(', ')}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-500 flex items-center gap-2">
                      <Trophy className="h-4 w-4" /> Gamificação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-3xl font-bold text-foreground">{currentLevel}</span>
                      <span className="text-sm text-muted-foreground mb-1">Nível Atual</span>
                    </div>
                    <Progress value={xpProgress} className="h-2 bg-yellow-500/20" indicatorClassName="bg-yellow-500" />
                    <p className="text-xs text-muted-foreground mt-2 text-right">{Math.floor(currentXP % 1000)} / 1000 XP</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader className="p-4 pb-2"><Dumbbell className="h-5 w-5 text-blue-500 mb-2" /><CardTitle className="text-xs text-muted-foreground">Treino</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="font-bold text-sm truncate">{activeWorkout?.workout?.name || 'Nenhum'}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader className="p-4 pb-2"><Utensils className="h-5 w-5 text-green-500 mb-2" /><CardTitle className="text-xs text-muted-foreground">Dieta</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="font-bold text-sm truncate">{activeMealPlan?.meal_plan?.name || 'Nenhuma'}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="photos">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /> Galeria de Progresso</CardTitle>
                <Button onClick={() => setIsAddPhotoOpen(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" /> Nova Foto</Button>
              </CardHeader>
              <CardContent>
                {progressPhotos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">Nenhuma foto registrada.</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {progressPhotos.map(photo => (
                      <div key={photo.id} className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted">
                        <img src={photo.photo_url} alt="Progresso" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <p className="text-white text-xs font-medium">{new Date(photo.date).toLocaleDateString()}</p>
                          {photo.notes && <p className="text-white/80 text-[10px] line-clamp-2 mt-1">{photo.notes}</p>}
                          <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id) }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isAddPhotoOpen} onOpenChange={setIsAddPhotoOpen}>
              <DialogContent className="bg-card border-border text-foreground">
                <DialogHeader><DialogTitle>Nova Foto de Progresso</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" value={newPhoto.date} onChange={e => setNewPhoto({ ...newPhoto, date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={newPhoto.notes} onChange={e => setNewPhoto({ ...newPhoto, notes: e.target.value })} placeholder="Opcional..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Foto</Label>
                    <Input type="file" accept="image/*" onChange={e => setNewPhoto({ ...newPhoto, file: e.target.files?.[0] || null })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handlePhotoUpload} disabled={uploadingPhoto || !newPhoto.file}>
                    {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Foto
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="anamnesis">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Ficha de Anamnese</CardTitle>
                <Button onClick={handleSaveAnamnesis} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Save className="h-4 w-4 mr-2" /> Salvar Alterações</Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /> Histórico Médico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Condições Diagnosticadas</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {COMMON_CONDITIONS.map(condition => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox id={condition} checked={anamnesisForm.diagnosed_conditions?.includes(condition)} onCheckedChange={() => toggleAnamnesisList('diagnosed_conditions', condition)} />
                            <label htmlFor={condition} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{condition}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sintomas Recentes</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {COMMON_SYMPTOMS.map(symptom => (
                          <div key={symptom} className="flex items-center space-x-2">
                            <Checkbox id={symptom} checked={anamnesisForm.symptoms?.includes(symptom)} onCheckedChange={() => toggleAnamnesisList('symptoms', symptom)} />
                            <label htmlFor={symptom} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{symptom}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Cirurgias Prévias</Label><Textarea value={anamnesisForm.surgeries} onChange={e => updateAnamnesis('surgeries', e.target.value)} placeholder="Liste cirurgias e datas..." className="h-20" /></div>
                    <div className="space-y-2"><Label>Lesões Musculoesqueléticas</Label><Textarea value={anamnesisForm.injuries} onChange={e => updateAnamnesis('injuries', e.target.value)} placeholder="Fraturas, torções, dores crônicas..." className="h-20" /></div>
                    <div className="space-y-2"><Label>Medicamentos em Uso</Label><Textarea value={anamnesisForm.medications} onChange={e => updateAnamnesis('medications', e.target.value)} placeholder="Nome, dosagem e frequência..." className="h-20" /></div>
                    <div className="space-y-2"><Label>Histórico Familiar</Label><Textarea value={anamnesisForm.family_history} onChange={e => updateAnamnesis('family_history', e.target.value)} placeholder="Doenças cardíacas, diabetes na família..." className="h-20" /></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Apple className="h-4 w-4 text-green-500" /> Estilo de Vida</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fumante?</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch checked={anamnesisForm.smoker} onCheckedChange={c => updateAnamnesis('smoker', c)} />
                        <span className="text-sm">{anamnesisForm.smoker ? 'Sim' : 'Não'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Consumo de Álcool</Label>
                      <Select value={anamnesisForm.alcohol} onValueChange={v => updateAnamnesis('alcohol', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Nunca</SelectItem>
                          <SelectItem value="socially">Socialmente</SelectItem>
                          <SelectItem value="frequently">Frequentemente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nível de Estresse</Label>
                      <Select value={anamnesisForm.stress_level} onValueChange={v => updateAnamnesis('stress_level', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixo</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="high">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="biometrics">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2"><Scale className="h-5 w-5 text-primary" /> Avaliações Físicas</CardTitle>
                <Button onClick={openNewAssessment} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" /> Nova Avaliação</Button>
              </CardHeader>
              <CardContent>
                {assessments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">Nenhuma avaliação registrada.</div>
                ) : (
                  <div className="space-y-4">
                    {assessments.map(assessment => (
                      <div key={assessment.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => openEditAssessment(assessment)}>
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-500/10 p-2 rounded-full"><Scale className="h-5 w-5 text-blue-500" /></div>
                          <div>
                            <h4 className="font-bold text-foreground">{new Date(assessment.date).toLocaleDateString()}</h4>
                            <p className="text-sm text-muted-foreground">{assessment.weight} kg â€¢ {assessment.body_fat_percentage}% GC</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={assessment.measurements?.status === 'completed' ? 'default' : 'outline'}>{assessment.measurements?.status === 'completed' ? 'Finalizada' : 'Rascunho'}</Badge>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteAssessment(assessment.id) }} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
              <DialogContent className="bg-card border-border text-foreground max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingAssessmentId ? 'Editar Avaliação' : 'Nova Avaliação'}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Ruler className="h-4 w-4" /> Dados Básicos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Data</Label><Input type="date" value={newAssessment.date} onChange={e => setNewAssessment({ ...newAssessment, date: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Peso (kg)</Label><Input type="number" value={newAssessment.weight} onChange={e => setNewAssessment({ ...newAssessment, weight: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Altura (cm)</Label><Input type="number" value={newAssessment.height} onChange={e => setNewAssessment({ ...newAssessment, height: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Idade</Label><Input type="number" value={newAssessment.age} onChange={e => setNewAssessment({ ...newAssessment, age: Number(e.target.value) })} /></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4" /> Dobras Cutâneas (mm)</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(SKINFOLD_LABELS).map(([key, label]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-xs">{label}</Label>
                          <Input type="number" className="h-8" value={newAssessment.skinfolds[key as keyof typeof newAssessment.skinfolds]} onChange={e => updateNested('skinfolds', key, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-semibold flex items-center gap-2"><Ruler className="h-4 w-4" /> Circunferências (cm)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(CIRCUMFERENCE_LABELS).map(([key, label]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-xs">{label}</Label>
                          <Input type="number" className="h-8" value={newAssessment.circumferences[key as keyof typeof newAssessment.circumferences]} onChange={e => updateNested('circumferences', key, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => handleSaveAssessment('draft')}>Salvar Rascunho</Button>
                  <Button onClick={() => handleSaveAssessment('completed')}>Finalizar Avaliação</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-card border-border w-full">
              <CardHeader className="p-6 border-b border-border">
                <CardTitle className="text-foreground text-xl flex items-center gap-2">
                  <Activity className="h-6 w-6 text-orange-500" /> Histórico de Execução
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {historySessions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Nenhum treino realizado ainda.</div>
                ) : (
                  <div className="space-y-4">
                    {historySessions.map(session => (
                      <div
                        key={session.id}
                        className="bg-muted/50 p-5 rounded-xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => handleHistorySessionClick(session)}
                      >
                        <div className="flex items-center gap-5 w-full md:w-auto">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${session.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`} >
                            {session.status === 'completed' ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-foreground">{session.workout?.name || 'Treino Avulso'}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(session.created_at).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.duration_seconds ? `${Math.floor(session.duration_seconds / 60)} min` : '--'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={session.status === 'completed' ? 'default' : 'destructive'} className="capitalize">{session.status === 'completed' ? 'Concluído' : 'Abandonado'}</Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isHistoryDetailOpen} onOpenChange={setIsHistoryDetailOpen}>
              <DialogContent className="bg-card border-border text-foreground sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{selectedHistorySession?.workout?.name}</DialogTitle>
                  <div className="text-sm text-muted-foreground flex gap-3">
                    <span>{selectedHistorySession && new Date(selectedHistorySession.ended_at).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>{selectedHistorySession && formatDuration(selectedHistorySession.duration_seconds)}</span>
                  </div>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4 mt-4">
                  {historyLogsLoading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                  ) : historyLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhum registro de exercício encontrado.</div>
                  ) : (
                    <div className="space-y-4">
                      {historyLogs.map((log, index) => (
                        <div key={log.id || index} className="bg-muted p-4 rounded-lg border border-border">
                          <h4 className="font-bold text-foreground mb-2">{log.exercise?.name || 'Exercício'}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-background p-2 rounded border border-border">
                              <span className="text-muted-foreground block text-xs uppercase">Carga</span>
                              <span className="font-mono font-bold">{log.weight} kg</span>
                            </div>
                            <div className="bg-background p-2 rounded border border-border">
                              <span className="text-muted-foreground block text-xs uppercase">Repetições</span>
                              <span className="font-mono font-bold">{log.reps}</span>
                            </div>
                          </div>
                          {log.notes && (
                            <div className="mt-2 text-sm text-muted-foreground italic border-t border-border/50 pt-2">
                              "{log.notes}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="workouts">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2"><Dumbbell className="h-5 w-5 text-primary" /> Treinos Atribuídos</CardTitle>
                <Button onClick={() => setIsAssignWorkoutOpen(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" /> Atribuir Treino</Button>
              </CardHeader>
              <CardContent>
                {clientWorkouts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">Nenhum treino atribuído.</div>
                ) : (
                  <div className="space-y-4">
                    {clientWorkouts.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-full"><Dumbbell className="h-5 w-5 text-primary" /></div>
                          <div>
                            <h4 className="font-bold text-foreground">{item.workout?.name}</h4>
                            <p className="text-sm text-muted-foreground">Início: {new Date(item.start_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveAssignment('client_workouts', item.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isAssignWorkoutOpen} onOpenChange={setIsAssignWorkoutOpen}>
              <DialogContent className="bg-card border-border text-foreground">
                <DialogHeader><DialogTitle>Atribuir Treino</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Selecione o Treino</Label>
                    <Select value={selectedWorkoutId} onValueChange={setSelectedWorkoutId}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {availableWorkouts.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                </div>
                <DialogFooter><Button onClick={handleAssignWorkout} disabled={!selectedWorkoutId}>Confirmar</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="meal-plans">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2"><Utensils className="h-5 w-5 text-primary" /> Dietas Atribuídas</CardTitle>
                <Button onClick={() => setIsAssignMealPlanOpen(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" /> Atribuir Dieta</Button>
              </CardHeader>
              <CardContent>
                {clientMealPlans.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">Nenhuma dieta atribuída.</div>
                ) : (
                  <div className="space-y-4">
                    {clientMealPlans.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-500/10 p-2 rounded-full"><Utensils className="h-5 w-5 text-green-500" /></div>
                          <div>
                            <h4 className="font-bold text-foreground">{item.meal_plan?.name}</h4>
                            <p className="text-sm text-muted-foreground">Início: {new Date(item.start_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveAssignment('client_meal_plans', item.id)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Dialog open={isAssignMealPlanOpen} onOpenChange={setIsAssignMealPlanOpen}>
              <DialogContent className="bg-card border-border text-foreground">
                <DialogHeader><DialogTitle>Atribuir Dieta</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Selecione a Dieta</Label>
                    <Select value={selectedMealPlanId} onValueChange={setSelectedMealPlanId}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {availableMealPlans.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                </div>
                <DialogFooter><Button onClick={handleAssignMealPlan} disabled={!selectedMealPlanId}>Confirmar</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="info">
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-foreground">Informações Pessoais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-muted-foreground">Nome Completo</Label><div className="font-medium">{clientProfile?.full_name}</div></div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="font-medium flex items-center gap-2">
                      <span>{clientProfile?.email || 'Não informado'}</span>
                      {clientProfile?.email && (
                        <a
                          href={`mailto:${clientProfile.email}`}
                          className="text-primary hover:text-primary/80"
                          title="Enviar Email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Telefone</Label>
                    <div className="font-medium flex items-center gap-2">
                      {clientProfile?.phone ? (
                        <>
                          <span>{clientProfile.phone}</span>
                          <a
                            href={`tel:${clientProfile.phone.replace(/\D/g, '')}`}
                            className="text-primary hover:text-primary/80"
                            title="Ligar"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        </>
                      ) : 'Não informado'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground">WhatsApp</Label>
                    <div className="font-medium flex items-center gap-2">
                      {clientProfile?.whatsapp ? (
                        <>
                          <span>{clientProfile.whatsapp}</span>
                          <a
                            href={`https://wa.me/${clientProfile.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                            title="Abrir WhatsApp"
                          >
                            <i className="fa-brands fa-whatsapp text-lg" />
                          </a>
                        </>
                      ) : 'Não informado'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Telegram</Label>
                    <div className="font-medium flex items-center gap-2">
                      {clientProfile?.telegram ? (
                        <>
                          <span>{clientProfile.telegram}</span>
                          <a
                            href={`https://t.me/${clientProfile.telegram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                            title="Abrir Telegram"
                          >
                            <i className="fa-brands fa-telegram text-lg" />
                          </a>
                        </>
                      ) : 'Não informado'}
                    </div>
                  </div>

                  <div className="space-y-1"><Label className="text-muted-foreground">CPF</Label><div className="font-medium">{clientProfile?.cpf || 'Não informado'}</div></div>
                  <div className="space-y-1"><Label className="text-muted-foreground">Data de Nascimento</Label><div className="font-medium">{clientProfile?.data_nascimento ? new Date(clientProfile.data_nascimento).toLocaleDateString() : 'Não informado'}</div></div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="space-y-1"><Label className="text-muted-foreground">Nome do Pai</Label><div className="font-medium">{clientProfile?.nome_pai || 'Não informado'}</div></div>
                    <div className="space-y-1"><Label className="text-muted-foreground">Nome da Mãe</Label><div className="font-medium">{clientProfile?.nome_mae || 'Não informado'}</div></div>
                    <div className="space-y-1"><Label className="text-muted-foreground">Responsável Legal</Label><div className="font-medium">{clientProfile?.responsavel_legal || 'Não informado'}</div></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  )
}

export default ClientDetails
