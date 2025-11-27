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
import { Loader2, Save, Upload, User, Shield, Award, Phone, Camera, HeartPulse, Activity, Apple, ZoomIn, FileText } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { AchievementsList } from '@/components/gamification/AchievementsList'

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
    dataNascimento: '',
    nomePai: '',
    nomeMae: '',
    responsavelLegal: '',
    cpf: '',
    bio: '',
    specialty: '',
    consultationPrice: '',
    certifications: '',
    goals: '',
    restrictions: ''
  })

  // --- Estado da Anamnese Completa ---
  const [anamnesisForm, setAnamnesisForm] = useState(DEFAULT_ANAMNESIS)
  const [userRole, setUserRole] = useState<string>('')

  // --- Estados do Recorte ---
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
            dataNascimento: profile.data_nascimento || '',
            nomePai: profile.nome_pai || '',
            nomeMae: profile.nome_mae || '',
            responsavelLegal: profile.responsavel_legal || '',
            cpf: profile.cpf || '',
            bio: '', specialty: '', consultationPrice: '', certifications: '', goals: '', restrictions: ''
          }

          let role = profile.role
          let newAnamnesis = { ...DEFAULT_ANAMNESIS }

          if (role === 'professional') {
            const { data: profData } = await supabase.from('professional_details').select('*').eq('profile_id', userId).maybeSingle()
            if (profData) {
              newFormData.bio = profData.bio || ''
              newFormData.specialty = ['personal_trainer', 'nutritionist'].includes(profData.specialty) ? profData.specialty : ''
              newFormData.consultationPrice = profData.consultation_price ? profData.consultation_price.toString() : ''
              const certData = profData.certifications as any
              newFormData.certifications = (typeof profData.certifications === 'string' ? profData.certifications : certData?.raw_text) || ''
            }
          } else if (role === 'client') {
            const { data: clientData } = await supabase.from('client_details').select('*').eq('profile_id', userId).maybeSingle()
            if (clientData) {
              newFormData.goals = clientData.goals || ''
              newFormData.restrictions = clientData.health_restrictions || ''

              if (clientData.anamnesis_data) {
                const rawData = typeof clientData.anamnesis_data === 'string' ? JSON.parse(clientData.anamnesis_data) : clientData.anamnesis_data
                // Merge seguro
                newAnamnesis = {
                  ...DEFAULT_ANAMNESIS,
                  ...rawData,
                  diagnosed_conditions: rawData.diagnosed_conditions || [],
                  symptoms: rawData.symptoms || [],
                  work_activities: rawData.work_activities || []
                }
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

  const handleInputChange = (field: string, value: string) => {
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

  const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null)
        setIsCropDialogOpen(true)
        setZoom(1)
        setCrop({ x: 0, y: 0 })
      })
      reader.readAsDataURL(file)
      event.target.value = ''
    }
  }

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleConfirmUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return
    try {
      setUploading(true)
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const fileName = sanitizeFileName('avatar.jpg')
      const filePath = `${user.id}/${fileName}`
      const processedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' })

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, processedFile, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const finalUrl = `${publicUrl}?t=${Date.now()}`

      await supabase.from('profiles').update({ avatar_url: finalUrl, updated_at: new Date().toISOString() }).eq('id', user.id)

      setFormData(prev => ({ ...prev, avatarUrl: finalUrl }))
      await supabase.auth.updateUser({ data: { avatar_url: finalUrl } })

      setIsCropDialogOpen(false)
      showSuccess('Foto atualizada!')
    } catch (error: any) {
      showError('Erro ao salvar foto.')
    } finally {
      setUploading(false)
    }
  }

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

      if (userRole === 'professional') {
        if (!formData.specialty) throw new Error('Selecione o Tipo de Profissional')
        const price = formData.consultationPrice ? parseFloat(formData.consultationPrice.replace(',', '.')) : null

        const { error: profError } = await supabase.from('professional_details').upsert({
          profile_id: user.id,
          bio: formData.bio,
          specialty: formData.specialty,
          consultation_price: price,
          certifications: { raw_text: formData.certifications },
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' })

        if (profError) throw profError

      } else if (userRole === 'client') {
        const { error: clientError } = await supabase.from('client_details').upsert({
          profile_id: user.id,
          goals: formData.goals,
          health_restrictions: formData.restrictions,
          anamnesis_data: anamnesisForm,
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

  if (authLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
          <User className="text-primary" /> Configurações de Perfil
        </h1>

        <form onSubmit={handleSave} className="space-y-8">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="personal">Pessoal</TabsTrigger>
              {userRole === 'professional' && <TabsTrigger value="professional">Profissional</TabsTrigger>}
              {userRole === 'client' && <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>}
              {userRole === 'client' && <TabsTrigger value="achievements">Conquistas</TabsTrigger>}
            </TabsList>

            <TabsContent value="personal" className="mt-6 space-y-6">
              <Card className="bg-card/50 backdrop-blur-md border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Informações Pessoais</CardTitle>
                  <CardDescription className="text-muted-foreground">Dados visíveis na plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-4">
                    {renderAvatar()}
                    <div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelect} className="hidden" disabled={uploading} />
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-card border-border hover:bg-accent text-foreground gap-2">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        Alterar Foto
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-muted-foreground">Nome Completo</Label><Input value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                      <div><Label className="text-muted-foreground">Telefone</Label><div className="relative mt-1.5"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="bg-background border-border text-foreground pl-10" /></div></div>
                      <div><Label className="text-muted-foreground">Data de Nascimento</Label><Input type="date" value={formData.dataNascimento} onChange={e => handleInputChange('dataNascimento', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                      <div><Label className="text-muted-foreground">CPF</Label><Input value={formData.cpf} onChange={e => handleInputChange('cpf', e.target.value)} className="bg-background border-border text-foreground mt-1.5" placeholder="000.000.000-00" /></div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label className="text-muted-foreground">Nome do Pai</Label><Input value={formData.nomePai} onChange={e => handleInputChange('nomePai', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                        <div><Label className="text-muted-foreground">Nome da Mãe</Label><Input value={formData.nomeMae} onChange={e => handleInputChange('nomeMae', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                        <div><Label className="text-muted-foreground">Responsável Legal</Label><Input value={formData.responsavelLegal} onChange={e => handleInputChange('responsavelLegal', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                      </div>
                    </div>
                    <div><Label className="text-muted-foreground">Email</Label><Input value={user?.email || ''} disabled className="bg-muted border-border text-muted-foreground mt-1.5 cursor-not-allowed" /></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {userRole === 'professional' && (
              <TabsContent value="professional" className="mt-6 space-y-6">
                <Card className="bg-card/50 backdrop-blur-md border-border shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-foreground">Dados Profissionais</CardTitle>
                    <CardDescription className="text-muted-foreground">Especialidade e detalhes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Tipo de Profissional</Label>
                        <Select value={formData.specialty} onValueChange={v => handleInputChange('specialty', v)}>
                          <SelectTrigger className="bg-background border-border text-foreground mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent className="bg-popover text-popover-foreground border-border">
                            <SelectItem value="personal_trainer">Personal Trainer</SelectItem>
                            <SelectItem value="nutritionist">Nutricionista</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-muted-foreground">Valor da Consulta (R$)</Label><Input type="number" step="0.01" value={formData.consultationPrice} onChange={e => handleInputChange('consultationPrice', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                    </div>
                    <div><Label className="text-muted-foreground">Biografia / Sobre Mim</Label><Textarea value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} className="bg-background border-border text-foreground mt-1.5 min-h-[100px]" /></div>
                    <div><Label className="text-muted-foreground">Certificações (CRN / CREF)</Label><Textarea value={formData.certifications} onChange={e => handleInputChange('certifications', e.target.value)} className="bg-background border-border text-foreground mt-1.5" /></div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {userRole === 'client' && (
              <>
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
            <DialogHeader><DialogTitle>Ajustar Foto</DialogTitle><DialogDescription>Enquadre seu rosto.</DialogDescription></DialogHeader>
            <div className="relative flex-1 bg-black w-full overflow-hidden rounded-md my-4 border border-border">
              {imageSrc && <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} cropShape="round" showGrid={true} />}
            </div>
            <div className="space-y-4 px-2">
              <div className="flex items-center gap-4"><ZoomIn className="h-4 w-4 text-muted-foreground" /><Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(val) => setZoom(val[0])} className="flex-1 cursor-pointer" /></div>
              <DialogFooter className="flex gap-2 justify-between sm:justify-end mt-2"><Button variant="ghost" onClick={() => { setIsCropDialogOpen(false); setImageSrc(null); }} className="text-muted-foreground hover:text-foreground">Cancelar</Button><Button onClick={handleConfirmUpload} disabled={uploading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Confirmar e Salvar</Button></DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div >
    </div >
  )
}

export default ProfileSettings