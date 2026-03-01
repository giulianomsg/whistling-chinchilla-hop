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
  User, Mail, Phone, ArrowLeft, Dumbbell, Utensils, Trash2,
  Loader2, Plus,
  FileText, Save, HeartPulse, Activity, Apple, Scale, Ruler, TrendingUp,
  Pencil, LayoutDashboard, Trophy, MessageSquare, Camera, Image as ImageIcon,
  AlertTriangle, Stethoscope, Calendar, Clock, CheckCircle, AlertCircle, Play, ChevronRight, ExternalLink, Target
} from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { isSameDay, isAfter, isBefore, startOfDay, format } from 'date-fns'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { FolderTabs, FolderTabsContent, FolderTabsList, FolderTabsTrigger } from '@/components/ui/folder-tabs'
import { supabase } from '@/integrations/supabase/client'
import { useFeedback } from '@/components/ui/CapiFitFeedback'
import { showSuccess, showError } from '@/utils/toast'
import { calculateBiometrics, classifyBMI, calculateCompletion } from '@/utils/biometrics'
import { AchievementsList } from '@/components/gamification/AchievementsList'
import { sanitizeAlpha, sanitizeFloatInput, sanitizeNumeric } from '@/utils/masks'

import StrengthRadar from '@/components/analytics/StrengthRadar'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import { useStrengthData } from '@/hooks/useStrengthData'
import GoalsManager from '@/components/goals/GoalsManager'
import WorkoutHistoryFeed from '@/components/client/WorkoutHistoryFeed'
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
  const { confirm } = useFeedback()
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
  const [scheduledWorkouts, setScheduledWorkouts] = useState<any[]>([])


  // ... existing imports ...

  // ... existing imports ...

  // Inside ClientDetails component:
  const { strengthStats, dotsScore, overallLevel } = useStrengthData(id)

  const [selectedAgendaDate, setSelectedAgendaDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState('09:00')

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

  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [selectedAgendaDetails, setSelectedAgendaDetails] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user) return
      setLoading(true)
      try {
        const profileRes = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
        const detailsRes = await supabase.from('client_details').select('*').eq('profile_id', id).maybeSingle()
        if (detailsRes.error) console.error('Error fetching details:', detailsRes.error)
        console.log('Details Res Data:', detailsRes.data)
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
        setAvailableWorkouts(myWorkouts.data || [])
        setAvailableMealPlans(myMealPlans.data || [])

        // Agenda Fetch
        const { data: sWorkouts } = await supabase.from('scheduled_workouts').select(`*, workout:workouts(name, id)`).eq('client_id', id).order('scheduled_at', { ascending: true })
        setScheduledWorkouts(sWorkouts || [])

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

    const fetchAgenda = async () => {
      if (!id) return
      const { data } = await supabase.from('scheduled_workouts').select(`*, workout:workouts(name, id)`).eq('client_id', id).order('scheduled_at', { ascending: true })
      setScheduledWorkouts(data || [])
    }

    const fetchHistory = async () => {
      if (!id) return
      const { data } = await supabase.from('workout_sessions').select(`*, workout:workouts(name)`).eq('client_id', id).order('created_at', { ascending: false }).limit(20)
      setHistorySessions(data || [])
    }


    // Realtime Subscription
    const channel = supabase
      .channel(`client-details-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scheduled_workouts', filter: `client_id=eq.${id}` },
        () => fetchAgenda()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workout_sessions', filter: `client_id=eq.${id}` },
        () => fetchHistory()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id, user])


  const handleAssignWorkout = async () => {
    try {
      if (activeTab === 'agenda') {
        if (!selectedAgendaDate || !selectedTime) return

        // Parse DateTime
        const [hours, minutes] = selectedTime.split(':').map(Number)
        const scheduledDateTime = new Date(selectedAgendaDate)
        scheduledDateTime.setHours(hours, minutes, 0, 0)

        if (isBefore(scheduledDateTime, new Date())) {
          showError('Não é possível agendar no passado.')
          return
        }

        // Conflict Check
        const { data: isAvailable, error: conflictError } = await supabase.rpc('check_professional_availability', {
          p_professional_id: user.id,
          p_start_time: scheduledDateTime.toISOString(),
          p_duration_minutes: 60, // Default 1h
          p_exclude_schedule_id: null
        })

        if (conflictError) {
          console.error("Conflict check error", conflictError)
          // Proceed with caution or block? Let's block if confirmed false.
          // If RPC fails (e.g. migration not applied), we might want to allow. 
          // But assuming it works:
        }

        if (isAvailable === false) {
          const confirmed = await confirm({
            title: "Conflito de Horário",
            description: "Você já tem um agendamento nesse horário (ou muito próximo). Deseja continuar mesmo assim?",
            variant: "default",
            confirmText: "Sim, Continuar",
            cancelText: "Cancelar"
          })
          if (!confirmed) return
        }

        const { error } = await supabase.from('scheduled_workouts').insert({
          client_id: id,
          workout_id: selectedWorkoutId,
          created_by: user!.id,
          scheduled_at: scheduledDateTime.toISOString(),
          status: 'pending_approval',
          professional_id: user.id,
          notes: 'Agendado pelo professor'
        })
        if (error) throw error
        showSuccess('Treino agendado (Aguardando cliente)')
        // Refresh agenda
        const { data } = await supabase.from('scheduled_workouts').select(`*, workout:workouts(name, id)`).eq('client_id', id).order('scheduled_at', { ascending: true })
        setScheduledWorkouts([...(data || [])]) // Spread to ensure new ref
      } else {
        // Regular Assignment (Client_Workouts)
        const { error } = await supabase.from('client_workouts').insert({ client_id: id, workout_id: selectedWorkoutId, professional_id: user!.id, start_date: startDate, status: 'active' })
        if (error) throw error
        showSuccess('Treino atribuído!')

        // Get Workout Name
        const workoutName = availableWorkouts.find(w => w.id === selectedWorkoutId)?.name || 'Novo Treino'

        // Notify Client
        await supabase.from('chat_messages').insert({
          sender_id: user.id,
          receiver_id: id,
          content: `💪 Um novo treino "${workoutName}" foi atribuído a você!`,
          message_type: 'text'
        })

        const { data } = await supabase.from('client_workouts').select(`*, workout:workouts(*)`).eq('client_id', id).order('created_at', { ascending: false })
        setClientWorkouts(data || [])
        setActiveTab('workouts')
      }
      setIsAssignWorkoutOpen(false)
    } catch (err) { showError('Erro ao atribuir') }
  }

  const handleAssignMealPlan = async () => {
    try {
      const { error } = await supabase.from('client_meal_plans').insert({ client_id: id, meal_plan_id: selectedMealPlanId, nutritionist_id: user!.id, start_date: startDate, status: 'active' })
      if (error) throw error
      showSuccess('Dieta atribuída!')

      // Get Meal Plan Name
      const planName = availableMealPlans.find(p => p.id === selectedMealPlanId)?.name || 'Nova Dieta'

      // Notify Client
      await supabase.from('chat_messages').insert({
        sender_id: user.id,
        receiver_id: id,
        content: `🥗 Uma nova dieta "${planName}" foi atribuída a você!`,
        message_type: 'text'
      })

      setIsAssignMealPlanOpen(false)
      const { data } = await supabase.from('client_meal_plans').select(`*, meal_plan:meal_plans(*)`).eq('client_id', id).order('created_at', { ascending: false })
      setClientMealPlans(data || [])
      setActiveTab('meal-plans')
    } catch (err) { showError('Erro ao atribuir') }
  }

  const handleRemoveAssignment = async (table: 'client_workouts' | 'client_meal_plans', itemId: string) => {
    try {
      // Get item name for notification
      let itemName = 'Item'
      if (table === 'client_workouts') {
        itemName = clientWorkouts.find(i => i.id === itemId)?.workout?.name || 'Treino'
      } else {
        itemName = clientMealPlans.find(i => i.id === itemId)?.meal_plan?.name || 'Dieta'
      }

      const { error } = await supabase.from(table).delete().eq('id', itemId)
      if (error) throw error
      showSuccess('Removido!')

      if (table === 'client_workouts') setClientWorkouts(prev => prev.filter(i => i.id !== itemId))
      else setClientMealPlans(prev => prev.filter(i => i.id !== itemId))

      // Notify Client
      await supabase.from('chat_messages').insert({
        sender_id: user!.id,
        receiver_id: id,
        content: `🗑️ O ${table === 'client_workouts' ? 'treino' : 'plano alimentar'} "${itemName}" foi removido do seu perfil.`,
        message_type: 'text'
      })
    } catch (err) { showError('Erro ao remover') }
  }

  const handleSaveAnamnesis = async () => {
    try {
      const { error } = await supabase.from('client_details').upsert({ profile_id: id, anamnesis_data: anamnesisForm, updated_at: new Date().toISOString() })
      if (error) throw error
      showSuccess('Anamnese completa salva!')

      // Notify Client
      await supabase.from('chat_messages').insert({
        sender_id: user!.id,
        receiver_id: id,
        content: `📋 Sua ficha de anamnese foi atualizada pelo profissional.`,
        message_type: 'text'
      })
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

      // Notify Client
      const action = status === 'draft' ? 'salvo como rascunho' : 'finalizado'
      await supabase.from('chat_messages').insert({
        sender_id: user!.id,
        receiver_id: id,
        content: `📊 Uma nova avaliação física (${new Date(newAssessment.date).toLocaleDateString('pt-BR')}) foi registrada e o status é: ${action}.`,
        message_type: 'text'
      })

    } catch (e: any) { console.error(e); showError('Erro ao salvar avaliação') }
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!await confirm({ title: "Excluir Avaliação?", description: "Esta ação é irreversível.", variant: "destructive", confirmText: "Excluir", cancelText: "Cancelar" })) return
    try {
      const assessmentDate = assessments.find(a => a.id === assessmentId)?.date
      await supabase.from('biometric_data').delete().eq('id', assessmentId)
      showSuccess('Avaliação excluída.')
      setAssessments(prev => prev.filter(a => a.id !== assessmentId))

      // Notify Client
      if (assessmentDate) {
        await supabase.from('chat_messages').insert({
          sender_id: user!.id,
          receiver_id: id,
          content: `🗑️ A avaliação física de ${new Date(assessmentDate).toLocaleDateString('pt-BR')} foi removida.`,
          message_type: 'text'
        })
      }
    } catch (e) { showError('Erro ao excluir') }
  }

  const updateNested = (section: 'skinfolds' | 'circumferences', field: string, value: string) => {
    const clean = sanitizeFloatInput(value)
    setNewAssessment(prev => ({ ...prev, [section]: { ...prev[section], [field]: clean } }))
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

      // Notify Client
      await supabase.from('chat_messages').insert({
        sender_id: user.id,
        receiver_id: id,
        content: `📸 Uma nova foto de progresso de ${new Date(newPhoto.date).toLocaleDateString('pt-BR')} foi adicionada ao seu perfil.`,
        message_type: 'text'
      })

      setIsAddPhotoOpen(false)
      setNewPhoto({ date: new Date().toISOString().split('T')[0], notes: '', file: null })
      const { data } = await supabase.from('progress_photos').select('*').eq('client_id', id).order('date', { ascending: false })
      setProgressPhotos(data || [])
    } catch (e: any) { showError('Erro no upload: ' + e.message) }
    finally { setUploadingPhoto(false) }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!await confirm({ title: "Excluir Foto?", description: "Esta ação é irreversível.", variant: "destructive", confirmText: "Excluir", cancelText: "Cancelar" })) return
    try {
      const photoDate = progressPhotos.find(p => p.id === photoId)?.date
      await supabase.from('progress_photos').delete().eq('id', photoId)
      showSuccess('Foto removida.')
      setProgressPhotos(prev => prev.filter(p => p.id !== photoId))

      // Notify Client
      if (photoDate) {
        await supabase.from('chat_messages').insert({
          sender_id: user!.id,
          receiver_id: id,
          content: `🗑️ A foto de progresso de ${new Date(photoDate).toLocaleDateString('pt-BR')} foi removida.`,
          message_type: 'text'
        })
      }
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

  // --- Agenda Handlers ---
  const handleApproveSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase.from('scheduled_workouts').update({
        status: 'confirmed',
        confirmed_by: user!.id,
        confirmed_at: new Date().toISOString()
      }).eq('id', scheduleId)
      if (error) throw error
      showSuccess('Treino confirmado!')

      // Notify Client via Chat
      const schedule = scheduledWorkouts.find(s => s.id === scheduleId)
      if (schedule && user) {
        const dateStr = format(new Date(schedule.scheduled_at), "dd/MM 'às' HH:mm")
        await supabase.from('chat_messages').insert({
          sender_id: user.id,
          receiver_id: id,
          content: `✅ Seu treino agendado para ${dateStr} foi confirmado!`,
          message_type: 'text'
        })
      }

      // Force refresh
      const { data } = await supabase.from('scheduled_workouts').select(`*, workout:workouts(name, id)`).eq('client_id', id).order('scheduled_at', { ascending: true })
      setScheduledWorkouts([...(data || [])])
    } catch (e) { showError('Erro ao confirmar') }
  }

  const handleRejectSchedule = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId)
    setRejectionReason('')
    setIsRejectDialogOpen(true)
  }

  const confirmRejection = async () => {
    try {
      const { error } = await supabase.from('scheduled_workouts').update({
        status: 'rejected',
        rejection_reason: rejectionReason
      }).eq('id', selectedScheduleId)

      if (error) throw error
      showSuccess('Solicitação rejeitada.')

      // Notify Client via Chat
      const schedule = scheduledWorkouts.find(s => s.id === selectedScheduleId)
      if (schedule && user) {
        const dateStr = format(new Date(schedule.scheduled_at), "dd/MM 'às' HH:mm")
        await supabase.from('chat_messages').insert({
          sender_id: user.id,
          receiver_id: id,
          content: `❌ Sua solicitação de treino para ${dateStr} foi rejeitada. Motivo: ${rejectionReason}`,
          message_type: 'text'
        })
      }

      const { data } = await supabase.from('scheduled_workouts').select(`*, workout:workouts(name, id)`).eq('client_id', id).order('scheduled_at', { ascending: true })
      setScheduledWorkouts(data || [])
      setIsRejectDialogOpen(false)
    } catch (e) { showError('Erro ao rejeitar') }
  }

  const handleProSchedule = async () => {
    // Note: This function logic works alongside handleAssignWorkout but needs to differentiate context. 
    // For now, let's assume if we are in 'agenda' tab, handleAssignWorkout uses specific logic, OR we make a dedicated new function.
    // Let's modify handleAssignWorkout instead to support agenda.
  }

  const getDayContent = (day: Date) => {
    const daySchedules = scheduledWorkouts.filter(s => isSameDay(new Date(s.scheduled_at), day))
    const dayHistory = historySessions.filter(s => isSameDay(new Date(s.created_at), day))

    if (daySchedules.length === 0 && dayHistory.length === 0) return null

    const hasPending = daySchedules.some(s => s.status === 'pending_approval' || s.status === 'pending')
    const hasConfirmed = daySchedules.some(s => s.status === 'confirmed')
    const hasHistory = dayHistory.length > 0

    // Priority: Pending > Confirmed > History
    let colorClass = 'bg-gray-400'
    if (hasPending) colorClass = 'bg-yellow-500'
    else if (hasConfirmed) colorClass = 'bg-blue-500'
    else if (hasHistory) colorClass = 'bg-green-500'

    return <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${colorClass}`} />
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

  const handleCancelWithReason = async () => {
    if (!cancellationReason.trim()) { showError('Informe o motivo'); return; }
    try {
      const { error } = await supabase.from('scheduled_workouts').update({
        status: 'cancelled',
        cancellation_reason: cancellationReason,
        cancelled_by: user!.id,
        cancelled_at: new Date().toISOString()
      }).eq('id', selectedScheduleId)
      if (error) throw error
      showSuccess('Agendamento cancelado.')

      // Notify Client via Chat
      const schedule = scheduledWorkouts.find(s => s.id === selectedScheduleId)
      if (schedule && user) {
        const dateStr = format(new Date(schedule.scheduled_at), "dd/MM 'às' HH:mm")
        await supabase.from('chat_messages').insert({
          sender_id: user.id,
          receiver_id: id,
          content: `⚠️ O agendamento para ${dateStr} foi cancelado. Motivo: ${cancellationReason}`,
          message_type: 'text'
        })
      }

      // Refresh logic
      const { data } = await supabase.from('scheduled_workouts').select(`*, workout:workouts(name, id)`).eq('client_id', id).order('scheduled_at', { ascending: true })
      setScheduledWorkouts([...(data || [])])
      setIsCancelDialogOpen(false)
      setCancellationReason('')
    } catch (e) { showError('Erro ao cancelar') }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!await confirm({ title: "Excluir Agendamento?", description: "Deseja excluir este agendamento permanentemente?", variant: "destructive", confirmText: "Excluir", cancelText: "Cancelar" })) return

    try {
      const { error } = await supabase.from('scheduled_workouts').delete().eq('id', scheduleId)
      if (error) throw error
      showSuccess('Agendamento excluído.')
      setScheduledWorkouts(prev => prev.filter(s => s.id !== scheduleId))
    } catch (e) {
      console.error('Erro delete:', e)
      showError('Erro ao excluir agendamento')
    }
  }

  return (
    <div className="min-h-screen bg-background py-4 md:py-8 w-full overflow-x-hidden">
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/clients')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {clientProfile?.full_name || 'Detalhes do Aluno'}
            </h1>
            <p className="text-muted-foreground">
              Gerencie treinos, dietas e evolução.
            </p>
          </div>
        </div>
        <FolderTabs value={activeTab} onValueChange={setActiveTab} className="space-y-0 w-full">
          <FolderTabsList className="bg-transparent p-0 justify-start">
            <FolderTabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" /> Visão Geral</FolderTabsTrigger>
            <FolderTabsTrigger value="photos"><Camera className="w-4 h-4 mr-2" /> Fotos</FolderTabsTrigger>
            <FolderTabsTrigger value="anamnesis"><FileText className="w-4 h-4 mr-2" /> Anamnese</FolderTabsTrigger>
            <FolderTabsTrigger value="biometrics"><Scale className="w-4 h-4 mr-2" /> Biometria</FolderTabsTrigger>
            <FolderTabsTrigger value="history"><Activity className="w-4 h-4 mr-2" /> Histórico</FolderTabsTrigger>
            <FolderTabsTrigger value="workouts">Treinos</FolderTabsTrigger>
            <FolderTabsTrigger value="meal-plans">Dietas</FolderTabsTrigger>
            <FolderTabsTrigger value="achievements"><Trophy className="w-4 h-4 mr-2" /> Conquistas</FolderTabsTrigger>
            <FolderTabsTrigger value="info">Info</FolderTabsTrigger>
            <FolderTabsTrigger value="agenda"><Calendar className="w-4 h-4 mr-2" /> Agenda</FolderTabsTrigger>
            <FolderTabsTrigger value="goals"><Dumbbell className="w-4 h-4 mr-2" /> Metas</FolderTabsTrigger>
            <FolderTabsTrigger value="performance"><TrendingUp className="w-4 h-4 mr-2" /> Performance</FolderTabsTrigger>
          </FolderTabsList>

          <FolderTabsContent value="goals">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Metas Principais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg border border-border min-h-[100px] whitespace-pre-wrap">
                    {clientDetails?.goals || "O aluno ainda não definiu suas metas e objetivos."}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-500" /> Restrições de Saúde</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg border border-border min-h-[100px] whitespace-pre-wrap">
                    {clientDetails?.health_restrictions || "Nenhuma restrição de saúde informada."}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Metas Específicas</h3>
              <GoalsManager clientId={id} />
            </div>
          </FolderTabsContent>

          <FolderTabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border md:col-span-2">
                <CardHeader><CardTitle>Perfil de Força (Nível)</CardTitle></CardHeader>
                <CardContent>
                  <StrengthRadar stats={strengthStats} />
                  <div className="grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground mt-4">
                    {strengthStats.map(s => (
                      <div key={s.subject} className="bg-muted p-2 rounded">
                        <div className="font-bold text-foreground">{s.subject}</div>
                        <div>{s.val}kg (1RM)</div>
                        <div className="text-blue-500">Nível {s.A.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader><CardTitle>Score DOTS</CardTitle></CardHeader>
                  <CardContent className="text-center">
                    <div className="text-5xl font-black text-blue-500 mb-2">{dotsScore.toFixed(0)}</div>
                    <p className="text-sm text-muted-foreground">Pontos de Força Relativa</p>
                    <div className="mt-4 text-xs text-muted-foreground text-left bg-muted p-3 rounded">
                      O coeficiente DOTS é o padrão ouro do Powerlifting para comparar atletas de diferentes pesos e sexos.
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader><CardTitle>Nível Estimado</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {strengthStats.map(s => (
                        <div key={s.subject} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                          <span>{s.subject}</span>
                          <Badge variant="outline" className={
                            s.level === 'Elite' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                              s.level === 'Avançado' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                s.level === 'Intermediário' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                  'text-muted-foreground'
                          }>{s.level}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-3 mt-6">
                <AnalyticsDashboard clientId={id} />
              </div>

            </div>
          </FolderTabsContent>
          <FolderTabsContent value="agenda">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Calendar Column */}
              <div className="md:col-span-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4 flex justify-center">
                    <CalendarComponent
                      mode="single"
                      selected={selectedAgendaDate}
                      onSelect={setSelectedAgendaDate}
                      locale={ptBR}
                      className="rounded-md border border-border"
                      components={{
                        DayContent: (props) => (
                          <div className="relative flex items-center justify-center w-full h-full text-sm">
                            {props.date.getDate()}
                            {getDayContent(props.date)}
                          </div>
                        )
                      }}
                    />
                  </CardContent>
                </Card>
                <div className="mt-4 flex gap-4 justify-center text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span>Pendente</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span>Confirmado</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span>Concluído</span></div>
                </div>
              </div>

              {/* Details Column */}
              <div className="md:col-span-8 space-y-6">
                <Card className="bg-card border-border min-h-[400px]">
                  <CardHeader className="border-b border-border flex flex-row justify-between items-center">
                    <CardTitle>{selectedAgendaDate ? format(selectedAgendaDate, "d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}</CardTitle>
                    {selectedAgendaDate && (
                      <Button
                        size="sm"
                        onClick={() => { setStartDate(selectedAgendaDate.toISOString().split('T')[0]); setIsAssignWorkoutOpen(true) }}
                        disabled={isBefore(startOfDay(selectedAgendaDate), startOfDay(new Date()))}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Agendar Treino
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {scheduledWorkouts.filter(s => selectedAgendaDate && isSameDay(new Date(s.scheduled_at), selectedAgendaDate)).length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">Nenhum agendamento para este dia.</div>
                    ) : (
                      scheduledWorkouts
                        .filter(s => selectedAgendaDate && isSameDay(new Date(s.scheduled_at), selectedAgendaDate))
                        .map(schedule => (
                          <div key={schedule.id} className="bg-muted p-4 rounded-lg border border-border flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-foreground">{schedule.workout?.name}</h4>
                              <div className="flex items-center gap-2 text-sm mt-1">
                                <Badge
                                  variant={
                                    schedule.status === 'confirmed' ? 'default' :
                                      schedule.status === 'cancelled' ? 'destructive' : 'outline'
                                  }
                                  className={`cursor-pointer hover:opacity-80 ${schedule.status === 'pending_approval' ? 'border-yellow-500 text-yellow-600' : ''}`}
                                  onClick={() => setSelectedAgendaDetails(schedule)}
                                >
                                  {schedule.status === 'pending_approval' ? 'Aguardando Aprovação' :
                                    schedule.status === 'confirmed' ? 'Confirmado' :
                                      schedule.status === 'cancelled' ? 'Cancelado' : schedule.status}
                                </Badge>
                                {schedule.created_by !== id && schedule.created_by === user?.id && <span className="text-xs text-muted-foreground">(Criado por você)</span>}
                                {schedule.created_by === id && <span className="text-xs text-muted-foreground">(Solicitado pelo aluno)</span>}
                              </div>
                            </div>
                            {/* Actions for Pro */}
                            <div className="flex items-center gap-2">
                              {schedule.status === 'pending_approval' && schedule.created_by === id ? (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setSelectedScheduleId(schedule.id); setIsRejectDialogOpen(true) }}>Rejeitar</Button>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveSchedule(schedule.id)}>Aprovar</Button>
                                </div>
                              ) : (
                                (schedule.status === 'confirmed' || schedule.status === 'pending_approval') ? (
                                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => { setSelectedScheduleId(schedule.id); setIsCancelDialogOpen(true) }}>Cancelar</Button>
                                ) : (
                                  (schedule.status === 'cancelled' || schedule.status === 'rejected') && (
                                    <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => handleDeleteSchedule(schedule.id)} title="Excluir permanentemente">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )
                                )
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </CardContent>

                  {/* History Section for the day */}
                  <div className="border-t border-border p-6 pt-2">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Histórico do Dia</h4>
                    {historySessions.filter(s => selectedAgendaDate && isSameDay(new Date(s.created_at), selectedAgendaDate)).length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhum treino realizado.</p>
                    ) : (
                      <div className="space-y-2">
                        {historySessions
                          .filter(s => selectedAgendaDate && isSameDay(new Date(s.created_at), selectedAgendaDate))
                          .map(session => (
                            <div
                              key={session.id}
                              className="bg-muted/50 p-3 rounded border border-border flex justify-between items-center cursor-pointer hover:bg-muted"
                              onClick={() => handleHistorySessionClick(session)}
                            >
                              <span className="text-sm font-medium">{session.workout?.name || 'Treino'}</span>
                              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                {session.status === 'completed' ? 'Concluído' : 'Incompleto'}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </FolderTabsContent>
          <FolderTabsContent value="achievements">
            <AchievementsList />
          </FolderTabsContent>
          <FolderTabsContent value="dashboard" className="space-y-6">
            {/* Reimagined Visual Header */}
            <div className="relative rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-8">
              {/* Cover Image */}
              <div className="h-32 md:h-48 w-full bg-muted relative">
                <img
                  src={clientProfile?.cover_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              {/* Profile Info Overlay */}
              <div className="px-6 pb-6 relative flex flex-col md:flex-row items-end md:items-end gap-6 -mt-12 md:-mt-16">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-card shadow-xl">
                  <AvatarImage src={clientProfile?.avatar_url} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-muted text-foreground">
                    {clientProfile?.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2 pt-2 md:pt-0 mb-1">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-md md:drop-shadow-none md:text-foreground mix-blend-difference md:mix-blend-normal text-white md:text-inherit">
                      {clientProfile?.full_name}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                        Nível {currentLevel}
                      </Badge>
                      <Badge variant="outline" className="bg-background/50 backdrop-blur max-w-[300px] truncate" title={clientDetails?.goals || 'Sem objetivo definido'}>
                        {clientDetails?.goals || 'Sem objetivo definido'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground items-center">
                    <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-full border border-border/50">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px]" title={clientProfile?.email}>{clientProfile?.email || 'N/A'}</span>
                    </div>
                    {clientProfile?.phone && (
                      <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-full border border-border/50">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{clientProfile.phone}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {clientProfile?.whatsapp && (
                        <a href={`https://wa.me/${clientProfile.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors" title="WhatsApp">
                          <i className="fa-brands fa-whatsapp text-sm" />
                        </a>
                      )}
                      {clientProfile?.telegram && (
                        <a href={`https://t.me/${clientProfile.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors" title="Telegram">
                          <i className="fa-brands fa-telegram text-sm" />
                        </a>
                      )}
                    </div>
                  </div>
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
              {/* Goals & Restrictions Summary Card */}
              <Card className="lg:col-span-3 bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground"><Target className="h-5 w-5 text-primary" /> Metas & Restrições</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Objetivo Principal</Label>
                    <div className="p-3 bg-muted/50 rounded-md border border-border text-sm font-medium min-h-[60px]">
                      {clientDetails?.goals || 'Não definido'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" /> Restrições de Saúde</Label>
                    <div className="p-3 bg-muted/50 rounded-md border border-border text-sm font-medium min-h-[60px]">
                      {clientDetails?.health_restrictions || 'Nenhuma restrição'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> Metas Específicas</Label>
                    <div className="min-h-[60px]">
                      <GoalsManager clientId={id} simplified={true} />
                    </div>
                  </div>
                </CardContent>
              </Card>

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
          </FolderTabsContent>

          <FolderTabsContent value="photos">
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
          </FolderTabsContent>

          <FolderTabsContent value="anamnesis">
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
          </FolderTabsContent>

          <FolderTabsContent value="biometrics">
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
                      <div className="space-y-2"><Label>Peso (kg)</Label><Input type="text" inputMode="decimal" value={newAssessment.weight} onChange={e => setNewAssessment({ ...newAssessment, weight: sanitizeFloatInput(e.target.value) })} className="bg-background border-border" /></div>
                      <div className="space-y-2"><Label>Altura (cm)</Label><Input type="text" inputMode="decimal" value={newAssessment.height} onChange={e => setNewAssessment({ ...newAssessment, height: sanitizeFloatInput(e.target.value) })} className="bg-background border-border" /></div>
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
          </FolderTabsContent>

          <FolderTabsContent value="history">
            <div className="w-full">
              <WorkoutHistoryFeed clientId={id!} />
            </div>
          </FolderTabsContent>

          <FolderTabsContent value="workouts">
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


          </FolderTabsContent>
          <FolderTabsContent value="meal-plans">
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
          </FolderTabsContent>

          <FolderTabsContent value="info">
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
          </FolderTabsContent>
        </FolderTabs>



        <Dialog open={isAssignWorkoutOpen} onOpenChange={setIsAssignWorkoutOpen}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader><DialogTitle>Atribuir Treino</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <div className="border rounded p-2 text-sm">{selectedAgendaDate ? format(selectedAgendaDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione no calendário'}</div>
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Selecione o Treino</Label>
                <Select value={selectedWorkoutId} onValueChange={setSelectedWorkoutId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {availableWorkouts.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter><Button onClick={handleAssignWorkout} disabled={!selectedWorkoutId}>Confirmar</Button></DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader><DialogTitle>Rejeitar Solicitação</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <Label>Motivo da Rejeição</Label>
              <Textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Por que você está rejeitando este horário?"
                className="resize-none"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmRejection} disabled={!rejectionReason.trim()}>Rejeitar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader><DialogTitle>Cancelar Agendamento</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <Label>Motivo do Cancelamento</Label>
              <Textarea
                value={cancellationReason}
                onChange={e => setCancellationReason(e.target.value)}
                placeholder="Motivo do cancelamento (Obrigatório)"
                className="resize-none"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>Voltar</Button>
              <Button variant="destructive" onClick={handleCancelWithReason} disabled={!cancellationReason.trim()}>Confirmar Cancelamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedAgendaDetails} onOpenChange={(open) => !open && setSelectedAgendaDetails(null)}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader><DialogTitle>Detalhes do Agendamento</DialogTitle></DialogHeader>
            {selectedAgendaDetails && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Horário</div>
                    <div className="font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> {format(new Date(selectedAgendaDetails.scheduled_at), "dd/MM 'às' HH:mm")}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Treino</div>
                    <div className="font-medium">{selectedAgendaDetails.workout?.name}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <Badge
                    variant={selectedAgendaDetails.status === 'confirmed' ? 'default' : selectedAgendaDetails.status === 'cancelled' ? 'destructive' : 'outline'}
                    className={selectedAgendaDetails.status === 'pending_approval' ? 'border-yellow-500 text-yellow-600' : ''}
                  >
                    {selectedAgendaDetails.status === 'pending_approval' ? 'Pendente' :
                      selectedAgendaDetails.status === 'confirmed' ? 'Confirmado' :
                        selectedAgendaDetails.status === 'cancelled' ? 'Cancelado' : selectedAgendaDetails.status}
                  </Badge>
                </div>
                {selectedAgendaDetails.created_at && (
                  <div className="text-xs text-muted-foreground pt-1 border-t mt-2">
                    Solicitado em: {format(new Date(selectedAgendaDetails.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    {selectedAgendaDetails.created_by === user?.id && " (Por você)"}
                  </div>
                )}
                {selectedAgendaDetails.confirmed_by && selectedAgendaDetails.confirmed_at && (
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Confirmado em: {format(new Date(selectedAgendaDetails.confirmed_at), "dd/MM/yyyy 'às' HH:mm")}
                    {selectedAgendaDetails.confirmed_by === user?.id && " (Por você)"}
                  </div>
                )}
                {selectedAgendaDetails.cancelled_by && selectedAgendaDetails.cancelled_at && (
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Cancelado em: {format(new Date(selectedAgendaDetails.cancelled_at), "dd/MM/yyyy 'às' HH:mm")}
                    {selectedAgendaDetails.cancelled_by === user?.id && " (Por você)"}
                  </div>
                )}
                {selectedAgendaDetails.cancellation_reason && (
                  <div className="space-y-1">
                    <div className="text-xs text-red-500 font-medium">Motivo do Cancelamento</div>
                    <div className="text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded border border-red-100 dark:border-red-800">
                      {selectedAgendaDetails.cancellation_reason}
                    </div>
                  </div>
                )}
                <DialogFooter><Button onClick={() => setSelectedAgendaDetails(null)}>Fechar</Button></DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div >
    </div >
  )
}


export default ClientDetails
