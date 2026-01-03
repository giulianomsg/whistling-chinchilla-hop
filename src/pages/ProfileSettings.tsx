import React, { useState, useEffect, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Save, Upload, User, Shield, Award, Phone, Camera, HeartPulse, Activity, Apple, ZoomIn, FileText, Plus, Trash2, Calendar, Clock, CheckCircle, AlertCircle, Scale, Ruler, Dumbbell, ChevronRight, Trophy } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { AchievementsList } from '@/components/gamification/AchievementsList'
import { calculateBiometrics, calculateCompletion } from '@/utils/biometrics'
import { useStrengthData } from '@/hooks/useStrengthData'
import StrengthRadar from '@/components/analytics/StrengthRadar'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'
import GoalsManager from '@/components/goals/GoalsManager'


// --- UTILITÁRIOS DE IMAGEM ---
const sanitizeFileName = (fileName: string): string => {
  const name = fileName.substring(0, fileName.lastIndexOf('.'))
  const sanitized = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  return `${sanitized}-${Date.now()}.jpg`
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('No 2d context')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas is empty'))
    }, 'image/jpeg', 0.95)
  })
}

// --- DICIONÁRIOS ---
const COMMON_CONDITIONS = ['Diabetes', 'Hipertensão', 'Asma', 'Artrite', 'Problema Renal', 'Anemia', 'Problemas Oculares', 'Obesidade', 'Colesterol Alto']
const COMMON_SYMPTOMS = ['Dor no Peito', 'Falta de Ar', 'Tontura', 'Palpitações', 'Dores Articulares', 'Dor nas Costas', 'Fraqueza', 'Tosse com Sangue']
const WORK_ACTIVITIES = ['Sentar na cadeira', 'Ficar de pé', 'Caminhar', 'Levantar peso', 'Dirigir']
const SKINFOLD_LABELS: Record<string, string> = { triceps: 'Tríceps', biceps: 'Bíceps', subscapular: 'Subescapular', chest: 'Peitoral', axillary: 'Axilar Média', suprailiac: 'Supra-ilíaca', abdominal: 'Abdominal', thigh: 'Coxa', calf: 'Panturrilha' }
const CIRCUMFERENCE_LABELS: Record<string, string> = { shoulder: 'Ombros', chest: 'Tórax', arm_right: 'Braço Dir.', arm_left: 'Braço Esq.', waist: 'Cintura', abdomen: 'Abdômen', hips: 'Quadril', thigh_right: 'Coxa Dir.', thigh_left: 'Coxa Esq.', calf_right: 'Panturrilha Dir.', calf_left: 'Panturrilha Esq.' }


// --- STATE PADRÃO DA ANAMNESE ---
const DEFAULT_ANAMNESIS = {
  diagnosed_conditions: [] as string[],
  symptoms: [] as string[],
  family_history: '',
  medications: '',
  surgeries: '',
  injuries: '',
  allergies: '',
  smoker: false,
  alcohol: 'never',
  occupation: '',
  work_hours: '',
  work_activities: [] as string[],
  stress_level: '',
  sleep_hours: '',
  sleep_quality: '',
  water_intake: '',
  diet_history: '',
  food_aversions: '',
  supplements: '',
  activity_level: 'sedentary'
}

const ProfileSettings: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // --- Estados do Formulário Geral ---
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
    coverUrl: '', // Added coverUrl
    dataNascimento: '',
    nomePai: '',
    nomeMae: '',
    responsavelLegal: '',
    cpf: '',
    bio: '',
    specialty: [] as string[],
    consultationPrice: '',
    certifications: '',
    goals: '',
    restrictions: '',
    whatsapp: '',
    telegram: ''
  })

  // State to track what we are uploading
  const [uploadType, setUploadType] = useState<'avatar' | 'cover'>('avatar');

  // --- Estado da Anamnese Completa ---
  const [anamnesisForm, setAnamnesisForm] = useState(DEFAULT_ANAMNESIS)
  const [userRole, setUserRole] = useState<string>('')

  // --- Estados do Recorte ---
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)

  // --- Estados das Novas Abas (Cliente) ---
  const [progressPhotos, setProgressPhotos] = useState<any[]>([])
  const [assessments, setAssessments] = useState<any[]>([])
  const [historySessions, setHistorySessions] = useState<any[]>([])
  const [historyLogs, setHistoryLogs] = useState<any[]>([])
  const [historyLogsLoading, setHistoryLogsLoading] = useState(false)
  const [selectedHistorySession, setSelectedHistorySession] = useState<any>(null)

  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false)
  const [newPhoto, setNewPhoto] = useState({ date: new Date().toISOString().split('T')[0], notes: '', file: null as File | null })

  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false)
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null)
  const initialAssessmentState = {
    date: new Date().toISOString().split('T')[0],
    weight: '', height: '',
    skinfolds: { triceps: '', biceps: '', subscapular: '', chest: '', axillary: '', suprailiac: '', abdominal: '', thigh: '', calf: '' },
    circumferences: { shoulder: '', chest: '', arm_right: '', arm_left: '', waist: '', abdomen: '', hips: '', thigh_right: '', thigh_left: '', calf_right: '', calf_left: '' },
    notes: ''
  }
  const [newAssessment, setNewAssessment] = useState(initialAssessmentState)
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false)
  const { strengthStats, loading: strengthLoading, overallLevel } = useStrengthData(user?.id)

  // --- EFEITO DE CARREGAMENTO INICIAL ---
  useEffect(() => {
    let mounted = true
    const userId = user?.id

    if (userId) {
      const loadData = async () => {
        if (mounted) setLoading(true)

        try {
          const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single()
          if (profileError) throw profileError

          if (!mounted) return

          const newFormData = {
            fullName: profile.full_name || '',
            phone: profile.phone || '',
            avatarUrl: profile.avatar_url || '',
            coverUrl: '', // Default empty
            dataNascimento: profile.data_nascimento || '',
            nomePai: profile.nome_pai || '',
            nomeMae: profile.nome_mae || '',
            responsavelLegal: profile.responsavel_legal || '',
            cpf: profile.cpf || '',
            whatsapp: '',
            telegram: '',
            bio: '', specialty: [] as string[], consultationPrice: '', certifications: '', goals: '', restrictions: ''
          }

          let role = profile.role
          let newAnamnesis = { ...DEFAULT_ANAMNESIS }

          if (role === 'professional' || role === 'admin') {
            const { data: profData } = await supabase.from('professional_details').select('*').eq('profile_id', userId).maybeSingle()
            if (profData) {
              newFormData.bio = profData.bio || ''
              newFormData.coverUrl = profData.cover_url || ''

              // Handle specialty as array or legacy string
              let loadedSpecialty = profData.specialty;
              if (typeof loadedSpecialty === 'string') {
                // Legacy single string
                loadedSpecialty = [loadedSpecialty];
              } else if (!Array.isArray(loadedSpecialty)) {
                // Null or undefined
                loadedSpecialty = [];
              }
              newFormData.specialty = loadedSpecialty;

              newFormData.consultationPrice = profData.consultation_price ? profData.consultation_price.toString() : ''
              const certData = profData.certifications as any
              newFormData.certifications = (typeof profData.certifications === 'string' ? profData.certifications : certData?.raw_text) || ''
              newFormData.whatsapp = profData.whatsapp || ''
              newFormData.telegram = profData.telegram || ''
            }
          } else if (role === 'client') {
            // ... existing client logic ...
            const { data: clientData } = await supabase.from('client_details').select('*').eq('profile_id', userId).maybeSingle()
            if (clientData) {
              newFormData.coverUrl = clientData.cover_url || ''
              newFormData.goals = clientData.goals || ''
              newFormData.restrictions = clientData.health_restrictions || ''
              newFormData.whatsapp = clientData.whatsapp || ''
              newFormData.telegram = clientData.telegram || ''
              if (clientData.anamnesis_data) {
                const rawData = typeof clientData.anamnesis_data === 'string' ? JSON.parse(clientData.anamnesis_data) : clientData.anamnesis_data
                newAnamnesis = { ...DEFAULT_ANAMNESIS, ...rawData, diagnosed_conditions: rawData.diagnosed_conditions || [], symptoms: rawData.symptoms || [], work_activities: rawData.work_activities || [] }
              }
              const { data: cPhotos } = await supabase.from('progress_photos').select('*').eq('client_id', userId).order('date', { ascending: false })
              const { data: cAssessments } = await supabase.from('biometric_data').select('*').eq('client_id', userId).order('date', { ascending: false })
              const { data: cHistory } = await supabase.from('workout_sessions').select(`*, workout:workouts(name)`).eq('client_id', userId).order('created_at', { ascending: false }).limit(20)

              if (mounted) {
                setProgressPhotos(cPhotos || [])
                setAssessments(cAssessments || [])
                setHistorySessions(cHistory || [])
              }
            }
          }

          if (mounted) {
            setFormData(newFormData)
            setUserRole(role)
            setAnamnesisForm(newAnamnesis)
          }
        } catch (error) {
          console.error('Erro loadData:', error)
        } finally {
          if (mounted) setLoading(false)
        }
      }
      loadData()
    }
    return () => { mounted = false }
  }, [user?.id])

  // ...

  const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null)
        setUploadType(type)
        setIsCropDialogOpen(true)
        setZoom(1)
        setCrop({ x: 0, y: 0 })
      })
      reader.readAsDataURL(file)
      event.target.value = ''
    }
  }

  // ... 

  const handleConfirmUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return
    try {
      setUploading(true)
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const fileName = sanitizeFileName(uploadType === 'avatar' ? 'avatar.jpg' : 'cover.jpg')
      // Use distinct path for cover if desired, but reusing avatar logic is fine if path differs
      // For cover, we might want fewer restrictions, but cropping is good.
      // Let's store covers in 'avatars' bucket under 'covers/' prefix or just root with name?
      // User folders are good: user_id/avatar.jpg, user_id/cover.jpg

      const filePath = `${user.id}/${fileName}`
      const processedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' })

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, processedFile, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const finalUrl = `${publicUrl}?t=${Date.now()}`

      if (uploadType === 'avatar') {
        await supabase.from('profiles').update({ avatar_url: finalUrl, updated_at: new Date().toISOString() }).eq('id', user.id)
        setFormData(prev => ({ ...prev, avatarUrl: finalUrl }))
        await supabase.auth.updateUser({ data: { avatar_url: finalUrl } })
      } else {
        // Update professional or client details for cover
        if (userRole === 'professional' || userRole === 'admin') {
          await supabase.from('professional_details').update({ cover_url: finalUrl, updated_at: new Date().toISOString() }).eq('profile_id', user.id)
        } else if (userRole === 'client') {
          await supabase.from('client_details').update({ cover_url: finalUrl, updated_at: new Date().toISOString() }).eq('profile_id', user.id)
        }
        setFormData(prev => ({ ...prev, coverUrl: finalUrl }))
      }

      setIsCropDialogOpen(false)
      showSuccess(uploadType === 'avatar' ? 'Foto atualizada!' : 'Capa atualizada!')
    } catch (error: any) {
      showError('Erro ao salvar imagem.')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  // ... existing handleSave ...

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateAnamnesis = (field: string, value: any) => {
    setAnamnesisForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleAnamnesisList = (field: 'diagnosed_conditions' | 'symptoms' | 'work_activities', item: string) => {
    setAnamnesisForm(prev => {
      const list = prev[field] || []
      return list.includes(item)
        ? { ...prev, [field]: list.filter(i => i !== item) }
        : { ...prev, [field]: [...list, item] }
    })
  }

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const { error: profileError } = await supabase.from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          data_nascimento: formData.dataNascimento || null,
          nome_pai: formData.nomePai || null,
          nome_mae: formData.nomeMae || null,
          responsavel_legal: formData.responsavelLegal || null,
          cpf: formData.cpf || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      await supabase.auth.updateUser({ data: { full_name: formData.fullName, phone: formData.phone } })

      if (userRole === 'professional' || userRole === 'admin') {
        if (!formData.specialty || formData.specialty.length === 0) throw new Error('Selecione pelo menos um Tipo de Profissional')
        const price = formData.consultationPrice ? parseFloat(formData.consultationPrice.replace(',', '.')) : null

        const { error: profError } = await supabase.from('professional_details').upsert({
          profile_id: user.id,
          bio: formData.bio,
          specialty: formData.specialty as any,
          consultation_price: price,
          certifications: { raw_text: formData.certifications },
          whatsapp: formData.whatsapp,
          telegram: formData.telegram,
          cover_url: formData.coverUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' })

        if (profError) throw profError

      } else if (userRole === 'client') {
        const { error: clientError } = await supabase.from('client_details').upsert({
          profile_id: user.id,
          goals: formData.goals,
          health_restrictions: formData.restrictions,
          anamnesis_data: anamnesisForm,
          whatsapp: formData.whatsapp,
          telegram: formData.telegram,
          cover_url: formData.coverUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' })

        if (clientError) throw clientError
      }

      showSuccess('Perfil salvo com sucesso!')

    } catch (error: any) {
      showError(error.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async () => {
    if (!newPhoto.file || !user) return
    setUploading(true)
    try {
      const fileExt = newPhoto.file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('progress-photos').upload(fileName, newPhoto.file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('progress-photos').getPublicUrl(fileName)
      const { error: dbError } = await supabase.from('progress_photos').insert({
        client_id: user.id, photo_url: publicUrl, date: newPhoto.date, notes: newPhoto.notes
      })
      if (dbError) throw dbError
      showSuccess('Foto adicionada!')
      setIsAddPhotoOpen(false)
      setNewPhoto({ date: new Date().toISOString().split('T')[0], notes: '', file: null })
      const { data } = await supabase.from('progress_photos').select('*').eq('client_id', user.id).order('date', { ascending: false })
      setProgressPhotos(data || [])
    } catch (e: any) { showError('Erro no upload: ' + e.message) }
    finally { setUploading(false) }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Excluir foto?')) return
    try {
      await supabase.from('progress_photos').delete().eq('id', photoId)
      showSuccess('Foto removida.')
      setProgressPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (e) { showError('Erro ao excluir') }
  }

  const openEditAssessment = (assessment: any) => {
    setEditingAssessmentId(assessment.id)
    const measures = typeof assessment.measurements === 'string' ? JSON.parse(assessment.measurements) : assessment.measurements
    setNewAssessment({
      date: assessment.date, weight: assessment.weight, height: assessment.height,
      skinfolds: measures.skinfolds || initialAssessmentState.skinfolds,
      circumferences: measures.circumferences || initialAssessmentState.circumferences,
      notes: assessment.notes || ''
    })
    setIsNewAssessmentOpen(true)
  }

  const openNewAssessment = () => { setEditingAssessmentId(null); setNewAssessment(initialAssessmentState); setIsNewAssessmentOpen(true); }

  const updateNested = (section: 'skinfolds' | 'circumferences', field: string, value: string) => {
    setNewAssessment(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  const handleSaveAssessment = async (status: 'draft' | 'completed') => {
    if (!user) return
    try {
      const calculated = calculateBiometrics({
        gender: 'male',
        age: 25,
        weight: Number(newAssessment.weight),
        height: Number(newAssessment.height),
        skinfolds: Object.fromEntries(Object.entries(newAssessment.skinfolds).map(([k, v]) => [k, Number(v)]))
      })

      const completion = calculateCompletion({ ...newAssessment, gender: 'male', age: 25 })

      const measurementsData = {
        skinfolds: newAssessment.skinfolds, circumferences: newAssessment.circumferences,
        protocol: calculated.protocol, bmi: calculated.bmi, lean_mass: calculated.leanMass, fat_mass: calculated.fatMass,
        status: status, completion: completion
      }

      const payload: any = {
        client_id: user.id, date: newAssessment.date, weight: Number(newAssessment.weight), height: Number(newAssessment.height),
        body_fat_percentage: calculated.bodyFat, muscle_mass: calculated.leanMass,
        measurements: measurementsData, notes: newAssessment.notes
      }

      if (editingAssessmentId) await supabase.from('biometric_data').update(payload).eq('id', editingAssessmentId)
      else await supabase.from('biometric_data').insert(payload)

      showSuccess(status === 'draft' ? 'Rascunho salvo!' : 'Avaliação salva!')
      setIsNewAssessmentOpen(false)
      const { data } = await supabase.from('biometric_data').select('*').eq('client_id', user.id).order('date', { ascending: false })
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
      .select(`*, exercise:exercises_library(name)`)
      .eq('workout_session_id', session.id)
      .order('completed_at', { ascending: true })

    setHistoryLogs(data || [])
    setHistoryLogsLoading(false)
  }

  const renderAvatar = () => {
    const src = formData.avatarUrl || ''
    return (
      <Avatar className="w-32 h-32 border-4 border-background shadow-xl ring-2 ring-primary/20">
        <AvatarImage src={src} className="object-cover" />
        <AvatarFallback className="text-3xl bg-muted text-primary font-bold">
          {formData.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // ...

  const renderPersonalTab = () => (
    <Card className="bg-card/50 backdrop-blur-md border-border shadow-xl">
      <CardHeader>
        <CardTitle className="text-foreground">Informações de Perfil</CardTitle>
        <CardDescription className="text-muted-foreground">Personalize como você aparece na plataforma.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Visual Header Editor */}
        <div className="relative mb-12 rounded-xl border border-border bg-muted overflow-visible">
          {/* Cover Area */}
          <div className="h-36 md:h-52 w-full relative overflow-hidden rounded-t-xl group">
            <img
              src={formData.coverUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
              alt="Capa"
              className="w-full h-full object-cover transition-opacity hover:opacity-90"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <input ref={coverInputRef} type="file" accept="image/*" onChange={(e) => onFileSelect(e, 'cover')} className="hidden" disabled={uploading} />
              <Button variant="secondary" size="sm" onClick={() => coverInputRef.current?.click()} className="gap-2">
                <Camera className="h-4 w-4" /> Alterar Capa
              </Button>
            </div>
          </div>

          {/* Avatar Area - Overlapping */}
          <div className="absolute -bottom-10 left-6 sm:left-10 flex items-end">
            <div className="relative group">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-card shadow-xl ring-2 ring-border">
                <AvatarImage src={formData.avatarUrl || ''} className="object-cover" />
                <AvatarFallback className="text-3xl font-bold bg-muted text-foreground">
                  {formData.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-6 w-6 text-white" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => onFileSelect(e, 'avatar')} className="hidden" disabled={uploading} />
            </div>
          </div>
        </div>

        {/* Form Fields - Pushed down by margin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div><Label className="text-muted-foreground">Nome Completo</Label><Input value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
          <div><Label className="text-muted-foreground">Telefone</Label><div className="relative mt-1.5"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="bg-background border-border text-foreground pl-10" /></div></div>

          {/* ... other personal fields ... */}
          <div><Label className="text-muted-foreground">Data de Nascimento</Label><Input type="date" value={formData.dataNascimento} onChange={e => handleInputChange('dataNascimento', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
          <div><Label className="text-muted-foreground">CPF</Label><Input value={formData.cpf} onChange={e => handleInputChange('cpf', e.target.value)} className="bg-background border-border text-foreground mt-1.5" placeholder="000.000.000-00" /></div>

          <div><Label className="text-muted-foreground">WhatsApp</Label><div className="relative mt-1.5"><Phone className="absolute left-3 top-3 h-4 w-4 text-green-500" /><Input value={formData.whatsapp} onChange={e => handleInputChange('whatsapp', e.target.value)} className="bg-background border-border text-foreground pl-10" placeholder="(00) 00000-0000" /></div></div>
          <div><Label className="text-muted-foreground">Telegram (Username)</Label><div className="relative mt-1.5"><Phone className="absolute left-3 top-3 h-4 w-4 text-blue-500" /><Input value={formData.telegram} onChange={e => handleInputChange('telegram', e.target.value)} className="bg-background border-border text-foreground pl-10" placeholder="@usuario" /></div></div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label className="text-muted-foreground">Nome do Pai</Label><Input value={formData.nomePai} onChange={e => handleInputChange('nomePai', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
            <div><Label className="text-muted-foreground">Nome da Mãe</Label><Input value={formData.nomeMae} onChange={e => handleInputChange('nomeMae', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
            <div><Label className="text-muted-foreground">Responsável Legal</Label><Input value={formData.responsavelLegal} onChange={e => handleInputChange('responsavelLegal', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
          </div>
        </div>
        <div><Label className="text-muted-foreground">Email</Label><Input value={user?.email || ''} disabled className="bg-muted border-border text-muted-foreground mt-1.5 cursor-not-allowed" /></div>
      </CardContent>
    </Card>
  )

  // ... replace the value="personal" content with {renderPersonalTab()}
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
          <User className="text-primary" /> Configurações de Perfil
        </h1>

        <form onSubmit={handleSave} className="space-y-8">
          <Tabs defaultValue="personal" className="w-full">
            <div className="w-full overflow-x-auto pb-2">
              <TabsList className="bg-muted/50 p-1 rounded-lg flex w-max h-auto gap-2">
                <TabsTrigger value="personal" className="px-4">Pessoal</TabsTrigger>
                {(userRole === 'professional' || userRole === 'admin') && <TabsTrigger value="professional" className="px-4">Profissional</TabsTrigger>}
                {userRole === 'client' && (
                  <>
                    <TabsTrigger value="photos" className="px-4">Fotos</TabsTrigger>
                    <TabsTrigger value="assessments" className="px-4">Avaliações</TabsTrigger>
                    <TabsTrigger value="goals" className="px-4">Metas</TabsTrigger>
                    <TabsTrigger value="anamnesis" className="px-4">Anamnese</TabsTrigger>
                    <TabsTrigger value="history" className="px-4">Histórico</TabsTrigger>
                    <TabsTrigger value="performance" className="px-4">Performance</TabsTrigger>
                    <TabsTrigger value="achievements" className="px-4">Conquistas</TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <TabsContent value="personal" className="mt-6 space-y-6">
              {renderPersonalTab()}
            </TabsContent>

            {(userRole === 'professional' || userRole === 'admin') && (
              <TabsContent value="professional" className="mt-6 space-y-6">
                <Card className="bg-card/50 backdrop-blur-md border-border shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-foreground">Dados Profissionais</CardTitle>
                    <CardDescription className="text-muted-foreground">Especialidade e detalhes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-foreground">Tipos de Profissional</Label>
                        <div className="grid grid-cols-1 gap-2 border border-border rounded-md p-3 bg-card/30">
                          {[
                            { id: 'personal_trainer', label: 'Personal Trainer' },
                            { id: 'nutritionist', label: 'Nutricionista' },
                            { id: 'sports_doctor', label: 'Médico do Esporte / Nutrólogo' },
                            { id: 'clinic', label: 'Clínica / Estúdio' },
                            { id: 'performance_coach', label: 'Consultor de Alta Performance' }
                          ].map((type) => (
                            <div key={type.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={type.id}
                                checked={Array.isArray(formData.specialty) ? formData.specialty.includes(type.id) : false}
                                onCheckedChange={(checked) => {
                                  const current = Array.isArray(formData.specialty) ? formData.specialty : [];
                                  let updated;
                                  if (checked) {
                                    updated = [...current, type.id];
                                  } else {
                                    updated = current.filter(s => s !== type.id);
                                  }
                                  handleInputChange('specialty', updated as any);
                                }}
                              />
                              <label htmlFor={type.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                {type.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div><Label className="text-muted-foreground">Valor da Consulta (R$)</Label><Input type="number" step="0.01" value={formData.consultationPrice} onChange={e => handleInputChange('consultationPrice', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                        <div><Label className="text-muted-foreground">Biografia / Sobre Mim</Label><Textarea value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} className="bg-background border-border text-foreground mt-1.5 min-h-[100px]" /></div>
                      </div>
                    </div>
                    <div><Label className="text-muted-foreground">Certificações (CRN / CREF)</Label><Textarea value={formData.certifications} onChange={e => handleInputChange('certifications', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {userRole === 'client' && (
              <>
                <TabsContent value="photos" className="mt-6">
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
                </TabsContent>



                <TabsContent value="assessments" className="mt-6">
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
                            <div key={assessment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors" onClick={() => openEditAssessment(assessment)}>
                              <div className="flex items-center gap-4">
                                <div className="bg-blue-500/10 p-2 rounded-full"><Scale className="h-5 w-5 text-blue-500" /></div>
                                <div>
                                  <h4 className="font-bold text-foreground">{new Date(assessment.date).toLocaleDateString()}</h4>
                                  <p className="text-sm text-muted-foreground">{assessment.weight} kg • {assessment.body_fat_percentage ? `${assessment.body_fat_percentage}% GC` : 'Sem GC'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteAssessment(assessment.id) }} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>



                <TabsContent value="goals" className="mt-6">
                  <GoalsManager clientId={user?.id} />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
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
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.duration_seconds ? formatDuration(session.duration_seconds) : '--'}</span>
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
                </TabsContent>



                <TabsContent value="anamnesis" className="mt-6 space-y-6">
                  <Card className="bg-card/50 backdrop-blur-md border-border shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2"><Activity className="text-primary" /> Ficha de Anamnese</CardTitle>
                      <CardDescription className="text-muted-foreground">Informações de saúde essenciais.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">

                      {/* Objetivos e Restrições */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><Label className="text-muted-foreground">Objetivo Principal</Label><Textarea value={formData.goals} onChange={e => handleInputChange('goals', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                        <div><Label className="text-muted-foreground">Restrições de Saúde</Label><Textarea value={formData.restrictions} onChange={e => handleInputChange('restrictions', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                      </div>

                      {/* Condições e Sintomas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-lg font-semibold text-foreground">Condições Diagnosticadas</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {COMMON_CONDITIONS.map(c => (
                              <div key={c} className="flex items-center space-x-2">
                                <Checkbox id={`cond-${c}`} checked={anamnesisForm.diagnosed_conditions.includes(c)} onCheckedChange={() => toggleAnamnesisList('diagnosed_conditions', c)} />
                                <label htmlFor={`cond-${c}`} className="text-sm text-muted-foreground cursor-pointer">{c}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-lg font-semibold text-foreground">Sintomas Frequentes</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {COMMON_SYMPTOMS.map(s => (
                              <div key={s} className="flex items-center space-x-2">
                                <Checkbox id={`symp-${s}`} checked={anamnesisForm.symptoms.includes(s)} onCheckedChange={() => toggleAnamnesisList('symptoms', s)} />
                                <label htmlFor={`symp-${s}`} className="text-sm text-muted-foreground cursor-pointer">{s}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Histórico Médico */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground">Histórico Médico</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label className="text-muted-foreground">Histórico Familiar</Label><Textarea value={anamnesisForm.family_history} onChange={e => updateAnamnesis('family_history', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                          <div><Label className="text-muted-foreground">Medicamentos em Uso</Label><Textarea value={anamnesisForm.medications} onChange={e => updateAnamnesis('medications', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                          <div><Label className="text-muted-foreground">Cirurgias Prévias</Label><Textarea value={anamnesisForm.surgeries} onChange={e => updateAnamnesis('surgeries', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                          <div><Label className="text-muted-foreground">Lesões</Label><Textarea value={anamnesisForm.injuries} onChange={e => updateAnamnesis('injuries', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                          <div><Label className="text-muted-foreground">Alergias</Label><Textarea value={anamnesisForm.allergies} onChange={e => updateAnamnesis('allergies', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                        </div>
                      </div>

                      {/* Estilo de Vida */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground">Estilo de Vida</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center justify-between p-3 border border-border rounded-md">
                            <Label className="text-muted-foreground">Fumante?</Label>
                            <Switch checked={anamnesisForm.smoker} onCheckedChange={v => updateAnamnesis('smoker', v)} />
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Consumo de Álcool</Label>
                            <Select value={anamnesisForm.alcohol} onValueChange={v => updateAnamnesis('alcohol', v)}>
                              <SelectTrigger className="bg-background border-border text-foreground mt-1.5"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-popover border-border"><SelectItem value="never">Nunca</SelectItem><SelectItem value="socially">Socialmente</SelectItem><SelectItem value="frequently">Frequentemente</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Nível de Atividade</Label>
                            <Select value={anamnesisForm.activity_level} onValueChange={v => updateAnamnesis('activity_level', v)}>
                              <SelectTrigger className="bg-background border-border text-foreground mt-1.5"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-popover border-border"><SelectItem value="sedentary">Sedentário</SelectItem><SelectItem value="light">Leve</SelectItem><SelectItem value="moderate">Moderado</SelectItem><SelectItem value="intense">Intenso</SelectItem></SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label className="text-muted-foreground">Profissão</Label><Input value={anamnesisForm.occupation} onChange={e => updateAnamnesis('occupation', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                          <div><Label className="text-muted-foreground">Horas de Trabalho/Dia</Label><Input value={anamnesisForm.work_hours} onChange={e => updateAnamnesis('work_hours', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground mb-2 block">Atividades no Trabalho</Label>
                          <div className="flex flex-wrap gap-4">
                            {WORK_ACTIVITIES.map(w => (
                              <div key={w} className="flex items-center space-x-2">
                                <Checkbox id={`work-${w}`} checked={anamnesisForm.work_activities.includes(w)} onCheckedChange={() => toggleAnamnesisList('work_activities', w)} />
                                <label htmlFor={`work-${w}`} className="text-sm text-muted-foreground cursor-pointer">{w}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sono e Nutrição */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground">Sono e Nutrição</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div><Label className="text-muted-foreground">Horas de Sono</Label><Input value={anamnesisForm.sleep_hours} onChange={e => updateAnamnesis('sleep_hours', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                          <div>
                            <Label className="text-muted-foreground">Qualidade do Sono</Label>
                            <Select value={anamnesisForm.sleep_quality} onValueChange={v => updateAnamnesis('sleep_quality', v)}>
                              <SelectTrigger className="bg-background border-border text-foreground mt-1.5"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-popover border-border"><SelectItem value="good">Boa</SelectItem><SelectItem value="average">Média</SelectItem><SelectItem value="poor">Ruim</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div><Label className="text-muted-foreground">Água (Litros/dia)</Label><Input value={anamnesisForm.water_intake} onChange={e => updateAnamnesis('water_intake', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label className="text-muted-foreground">Histórico de Dietas</Label><Textarea value={anamnesisForm.diet_history} onChange={e => updateAnamnesis('diet_history', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                          <div><Label className="text-muted-foreground">Aversões Alimentares</Label><Textarea value={anamnesisForm.food_aversions} onChange={e => updateAnamnesis('food_aversions', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </TabsContent>



                <TabsContent value="performance" className="mt-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground"><Trophy className="h-5 w-5 text-yellow-500" /> Perfil de Força (Estimado)</CardTitle>
                      <CardDescription>Baseado nos seus recordes (1RM) registrados nos treinos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {strengthLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                      ) : strengthStats.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">Sem dados suficientes. Registre cargas nos treinos (Squat, Bench, Deadlift, Overhead).</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="bg-muted/50 rounded-xl p-4">
                            <StrengthRadar stats={strengthStats} />
                            <div className="text-center mt-[-20px] mb-4">
                              <Badge className="bg-primary text-primary-foreground text-lg px-6 py-2 shadow-lg">Nível Geral: {overallLevel}</Badge>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {strengthStats.map((s) => (
                              <div key={s.subject} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors">
                                <div>
                                  <span className="block font-bold text-foreground text-lg">{s.subject}</span>
                                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Dumbbell className="h-3 w-3" /> 1RM Est: {s.val} kg</span>
                                </div>
                                <div className="text-right">
                                  <Badge variant={s.level === 'Elite' ? 'default' : s.level === 'Avançado' ? 'secondary' : 'outline'} className={`mb-1 ${s.level === 'Elite' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}>
                                    {s.level}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground font-mono">Score: {s.A.toFixed(1)}/5.0</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* Seção de Analytics Detalhado */}
                  <AnalyticsDashboard clientId={user?.id} />
                </TabsContent>



                <TabsContent value="achievements" className="mt-6">
                  <AchievementsList />
                </TabsContent>


              </>
            )}
          </Tabs>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/80 font-bold px-8 min-w-[150px]">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Tudo
            </Button>
          </div>
        </form >

        <Dialog open={isCropDialogOpen} onOpenChange={(open) => { if (!open) setIsCropDialogOpen(false) }}>
          <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-[500px] h-[550px] flex flex-col">
            <DialogHeader>
              <DialogTitle>Ajustar Foto</DialogTitle>
              <DialogDescription>Enquadre seu rosto para a foto de perfil.</DialogDescription>
            </DialogHeader>
            <div className="relative flex-1 bg-black w-full overflow-hidden rounded-md my-4 border border-border">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={uploadType === 'avatar' ? 1 : 32 / 9} // ~3.55 ratio, wide enough for banners
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape={uploadType === 'avatar' ? 'round' : 'rect'}
                  showGrid={true}
                />
              )}
            </div>
            <div className="space-y-4 px-2">
              <div className="flex items-center gap-4"><ZoomIn className="h-4 w-4 text-muted-foreground" /><Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(val) => setZoom(val[0])} className="flex-1 cursor-pointer" /></div>
              <DialogFooter className="flex gap-2 justify-between sm:justify-end mt-2"><Button variant="ghost" onClick={() => { setIsCropDialogOpen(false); setImageSrc(null); }} className="text-muted-foreground hover:text-foreground">Cancelar</Button><Button onClick={handleConfirmUpload} disabled={uploading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Confirmar e Salvar</Button></DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogs adicionais para o Cliente */}
        <Dialog open={isAddPhotoOpen} onOpenChange={setIsAddPhotoOpen}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Nova Foto de Progresso</DialogTitle>
              <DialogDescription>Adicione uma foto para acompanhar sua evolução.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={newPhoto.date} onChange={e => setNewPhoto({ ...newPhoto, date: e.target.value })} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={newPhoto.notes} onChange={e => setNewPhoto({ ...newPhoto, notes: e.target.value })} placeholder="Opcional..." className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Foto</Label>
                <Input type="file" accept="image/*" onChange={e => setNewPhoto({ ...newPhoto, file: e.target.files?.[0] || null })} className="bg-background border-border" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handlePhotoUpload} disabled={uploading || !newPhoto.file}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar Foto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAssessmentId ? 'Editar Avaliação' : 'Nova Avaliação'}</DialogTitle>
              <DialogDescription>Insira os dados da avaliação física. O cálculo de gordura e massa magra será feito automaticamente.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Ruler className="h-4 w-4" /> Dados Básicos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Data</Label><Input type="date" value={newAssessment.date} onChange={e => setNewAssessment({ ...newAssessment, date: e.target.value })} className="bg-background border-border" /></div>
                  <div className="space-y-2"><Label>Peso (kg)</Label><Input type="number" value={newAssessment.weight} onChange={e => setNewAssessment({ ...newAssessment, weight: e.target.value })} className="bg-background border-border" /></div>
                  <div className="space-y-2"><Label>Altura (cm)</Label><Input type="number" value={newAssessment.height} onChange={e => setNewAssessment({ ...newAssessment, height: e.target.value })} className="bg-background border-border" /></div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Activity className="h-4 w-4" /> Dobras Cutâneas (mm)</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(SKINFOLD_LABELS).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-xs">{label}</Label>
                      <Input type="number" className="h-8 bg-background border-border" value={newAssessment.skinfolds[key as keyof typeof newAssessment.skinfolds]} onChange={e => updateNested('skinfolds', key, e.target.value)} />
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
                      <Input type="number" className="h-8 bg-background border-border" value={newAssessment.circumferences[key as keyof typeof newAssessment.circumferences]} onChange={e => updateNested('circumferences', key, e.target.value)} />
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

        <Dialog open={isHistoryDetailOpen} onOpenChange={setIsHistoryDetailOpen}>
          <DialogContent className="bg-card border-border text-foreground sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedHistorySession?.workout?.name}</DialogTitle>
              <DialogDescription>
                Detalhes do treino realizado em {selectedHistorySession && new Date(selectedHistorySession.ended_at).toLocaleDateString('pt-BR')}
              </DialogDescription>
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
      </div >
    </div >
  )
}

export default ProfileSettings