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
import { Loader2, Save, Upload, User, Shield, Award, Phone, Camera, HeartPulse, Activity, Apple, ZoomIn } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'

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

// --- DICIONÁRIOS (Sincronizados com ClientDetails) ---
const COMMON_CONDITIONS = ['Diabetes', 'Hipertensão', 'Asma', 'Artrite', 'Problema Renal', 'Anemia', 'Problemas Oculares', 'Obesidade', 'Colesterol Alto']
const COMMON_SYMPTOMS = ['Dor no Peito', 'Falta de Ar', 'Tontura', 'Palpitações', 'Dores Articulares', 'Dor nas Costas', 'Fraqueza', 'Tosse com Sangue']
const WORK_ACTIVITIES = ['Sentar na cadeira', 'Ficar de pé', 'Caminhar', 'Levantar peso', 'Dirigir']

const ProfileSettings: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // --- Estados do Formulário Geral ---
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
    bio: '',
    specialty: '',
    consultationPrice: '',
    certifications: '',
    goals: '',
    restrictions: ''
  })
  
  // --- Estado da Anamnese Completa (JSONB) - ESTRUTURA PADRONIZADA ---
  const [anamnesisForm, setAnamnesisForm] = useState({
    // Clínico
    diagnosed_conditions: [] as string[],
    symptoms: [] as string[],
    family_history: '',
    medications: '',
    surgeries: '',
    injuries: '',
    allergies: '',
    
    // Hábitos
    smoker: false,
    alcohol: 'never',
    occupation: '',
    work_hours: '',
    work_activities: [] as string[],
    stress_level: '',
    sleep_hours: '',
    sleep_quality: '',
    
    // Nutricional
    water_intake: '',
    diet_history: '',
    food_aversions: '',
    supplements: '',
    activity_level: 'sedentary'
  })

  const [userRole, setUserRole] = useState<string>('')

  // --- Estados do Recorte ---
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Função de Carregamento OTIMIZADA ---
  // Removemos qualquer dependência de 'formData' ou 'anamnesisForm' aqui dentro.
  const fetchFreshData = useCallback(async () => {
    if (!user) return
    try {
      // Não ative setLoading se já estiver carregando para evitar loops em edge cases,
      // mas aqui vamos forçar apenas no mount.
      
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileError) throw profileError

      // Construímos o objeto do ZERO, sem ler o estado anterior (formData)
      const newFormData = {
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatar_url || '',
        bio: '', // Default
        specialty: '', // Default
        consultationPrice: '', // Default
        certifications: '', // Default
        goals: '', // Default
        restrictions: '' // Default
      }
      
      setUserRole(profile.role)

      if (profile.role === 'professional') {
        const { data: profData } = await supabase.from('professional_details').select('*').eq('profile_id', user.id).maybeSingle()
        if (profData) {
          newFormData.bio = profData.bio || ''
          newFormData.specialty = ['personal_trainer', 'nutritionist'].includes(profData.specialty) ? profData.specialty : ''
          newFormData.consultationPrice = profData.consultation_price ? profData.consultation_price.toString() : ''
          const certData = profData.certifications as any
          newFormData.certifications = (typeof profData.certifications === 'string' ? profData.certifications : certData?.raw_text) || ''
        }
      } else if (profile.role === 'client') {
        const { data: clientData } = await supabase.from('client_details').select('*').eq('profile_id', user.id).maybeSingle()
        if (clientData) {
          newFormData.goals = clientData.goals || ''
          newFormData.restrictions = clientData.health_restrictions || ''
          
          if (clientData.anamnesis_data) {
            const data = typeof clientData.anamnesis_data === 'string' 
              ? JSON.parse(clientData.anamnesis_data) 
              : clientData.anamnesis_data
            
            // Atualizamos a Anamnese do ZERO também
            setAnamnesisForm({
                // Defaults
                diagnosed_conditions: [],
                symptoms: [],
                family_history: '',
                medications: '',
                surgeries: '',
                injuries: '',
                allergies: '',
                smoker: false,
                alcohol: 'never',
                occupation: '',
                work_hours: '',
                work_activities: [],
                stress_level: '',
                sleep_hours: '',
                sleep_quality: '',
                water_intake: '',
                diet_history: '',
                food_aversions: '',
                supplements: '',
                activity_level: 'sedentary',
                // Override com dados do banco
                ...data,
                // Garantia de Arrays
                diagnosed_conditions: data.diagnosed_conditions || [],
                symptoms: data.symptoms || [],
                work_activities: data.work_activities || []
            })
          }
        }
      }
      // Atualiza o form geral de uma vez
      setFormData(newFormData)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    }
  }, [user?.id]) // Dependência ÚNICA e imutável (string)

  // --- Efeito Principal ---
  useEffect(() => {
    if (user?.id) {
        setLoading(true)
        fetchFreshData().finally(() => setLoading(false))
    }
  }, [user?.id, fetchFreshData])

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
        .update({ full_name: formData.fullName, phone: formData.phone, updated_at: new Date().toISOString() })
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
      // Recarrega os dados para garantir sincronia
      await fetchFreshData()

    } catch (error: any) {
      showError(error.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

  const renderAvatar = () => {
    const src = formData.avatarUrl ? `${formData.avatarUrl}?t=${Date.now()}` : ''
    return (
      <Avatar className="w-32 h-32 border-4 border-white/10 shadow-xl ring-2 ring-primary/20">
        <AvatarImage src={src} className="object-cover" />
        <AvatarFallback className="text-3xl bg-slate-800 text-primary font-bold">
          {formData.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <User className="text-primary" /> Configurações de Perfil
        </h1>

        <form onSubmit={handleSave} className="space-y-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Informações Pessoais</CardTitle>
              <CardDescription className="text-gray-400">Dados visíveis na plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                {renderAvatar()}
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelect} className="hidden" disabled={uploading} />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    Alterar Foto
                  </Button>
                </div>
              </div>
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="text-gray-300">Nome Completo</Label><Input value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/></div>
                  <div><Label className="text-gray-300">Telefone</Label><div className="relative mt-1.5"><Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="bg-black/20 border-white/10 text-white pl-10"/></div></div>
                </div>
                <div><Label className="text-gray-300">Email</Label><Input value={user?.email || ''} disabled className="bg-white/5 border-white/5 text-gray-500 mt-1.5 cursor-not-allowed"/></div>
              </div>
            </CardContent>
          </Card>

          {userRole === 'professional' && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="text-purple-400"/> Dados Profissionais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Área de Atuação <span className="text-red-400">*</span></Label>
                    <Select onValueChange={(v) => handleInputChange('specialty', v)} value={formData.specialty}>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white"><SelectItem value="personal_trainer">Personal Trainer</SelectItem><SelectItem value="nutritionist">Nutricionista</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-gray-300">Preço Consulta (R$)</Label><Input type="number" value={formData.consultationPrice} onChange={e => handleInputChange('consultationPrice', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/></div>
                </div>
                <div><Label className="text-gray-300">Biografia</Label><Textarea value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5 min-h-[100px]"/></div>
                <div><Label className="text-gray-300">Certificações</Label><Textarea value={formData.certifications} onChange={e => handleInputChange('certifications', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/></div>
              </CardContent>
            </Card>
          )}

          {userRole === 'client' && (
            <div className="space-y-6">
              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><Shield className="text-green-400"/> Ficha de Anamnese</CardTitle>
                  <CardDescription className="text-gray-400">Preencha com atenção. Seus dados ajudam a montar o treino ideal.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="medical" className="w-full">
                    <TabsList className="bg-black/20 border border-white/10 w-full justify-start mb-6 h-auto flex-wrap">
                      <TabsTrigger value="medical" className="h-10 flex-1 min-w-[100px] data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-gray-400"><HeartPulse className="w-4 h-4 mr-2"/> Clínico</TabsTrigger>
                      <TabsTrigger value="habits" className="h-10 flex-1 min-w-[100px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-gray-400"><Activity className="w-4 h-4 mr-2"/> Hábitos</TabsTrigger>
                      <TabsTrigger value="nutri" className="h-10 flex-1 min-w-[100px] data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400"><Apple className="w-4 h-4 mr-2"/> Nutrição</TabsTrigger>
                    </TabsList>

                    <TabsContent value="medical" className="space-y-6">
                      <div>
                        <Label className="text-gray-400 mb-3 block text-xs uppercase tracking-wider">Condições Diagnosticadas</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {COMMON_CONDITIONS.map(cond => (
                            <div 
                              key={cond} 
                              className={`flex items-center space-x-2 p-3 rounded border cursor-pointer transition-colors ${anamnesisForm.diagnosed_conditions?.includes(cond) ? 'bg-red-500/20 border-red-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`} 
                              onClick={() => toggleAnamnesisList('diagnosed_conditions', cond)}
                            >
                              <Checkbox checked={anamnesisForm.diagnosed_conditions?.includes(cond)} className="pointer-events-none border-white/30" />
                              <span className={`text-xs font-bold ${anamnesisForm.diagnosed_conditions?.includes(cond) ? 'text-red-200' : 'text-gray-400'}`}>{cond}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-400 mb-3 block text-xs uppercase tracking-wider">Sintomas Recorrentes</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {COMMON_SYMPTOMS.map(sym => (
                            <div 
                              key={sym} 
                              className={`flex items-center space-x-2 p-3 rounded border cursor-pointer transition-colors ${anamnesisForm.symptoms?.includes(sym) ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`} 
                              onClick={() => toggleAnamnesisList('symptoms', sym)}
                            >
                              <Checkbox checked={anamnesisForm.symptoms?.includes(sym)} className="pointer-events-none border-white/30" />
                              <span className={`text-xs font-bold ${anamnesisForm.symptoms?.includes(sym) ? 'text-yellow-200' : 'text-gray-400'}`}>{sym}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><Label className="text-gray-300 mb-2 block">Histórico Médico Familiar</Label><Textarea value={anamnesisForm.family_history} onChange={e => updateAnamnesis('family_history', e.target.value)} className="bg-black/20 border-white/10 mt-1.5 min-h-[80px]"/></div>
                        <div><Label className="text-gray-300 mb-2 block">Medicamentos</Label><Textarea value={anamnesisForm.medications} onChange={e => updateAnamnesis('medications', e.target.value)} className="bg-black/20 border-white/10 mt-1.5 min-h-[80px]"/></div>
                        <div><Label className="text-gray-300 mb-2 block">Lesões / Dores</Label><Textarea value={anamnesisForm.injuries} onChange={e => updateAnamnesis('injuries', e.target.value)} className="bg-black/20 border-white/10 mt-1.5 min-h-[80px]"/></div>
                        <div><Label className="text-gray-300 mb-2 block">Cirurgias / Alergias</Label><Textarea value={anamnesisForm.surgeries} onChange={e => updateAnamnesis('surgeries', e.target.value)} className="bg-black/20 border-white/10 mt-1.5 min-h-[80px]"/></div>
                      </div>
                    </TabsContent>

                    <TabsContent value="habits" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between bg-black/20 p-4 rounded border border-white/5">
                          <Label className="text-gray-300">Fumante?</Label>
                          <Switch checked={anamnesisForm.smoker} onCheckedChange={c => updateAnamnesis('smoker', c)} />
                        </div>
                        <div>
                          <Label className="text-gray-300 mb-2 block">Consumo de Álcool</Label>
                          <Select value={anamnesisForm.alcohol} onValueChange={v => updateAnamnesis('alcohol', v)}>
                            <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Selecione..."/></SelectTrigger>
                            <SelectContent className="bg-slate-900 text-white border-white/10"><SelectItem value="never">Nunca</SelectItem><SelectItem value="socially">Socialmente</SelectItem><SelectItem value="frequently">Frequentemente</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div><Label className="text-gray-300 mb-2 block">Profissão</Label><Input value={anamnesisForm.occupation} onChange={e => updateAnamnesis('occupation', e.target.value)} className="bg-black/20 border-white/10"/></div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div><Label className="text-gray-300 mb-2 block">Sono (h)</Label><Input type="number" value={anamnesisForm.sleep_hours} onChange={e => updateAnamnesis('sleep_hours', e.target.value)} className="bg-black/20 border-white/10"/></div>
                          <div>
                            <Label className="text-gray-300 mb-2 block">Qualidade</Label>
                            <Select value={anamnesisForm.sleep_quality} onValueChange={v => updateAnamnesis('sleep_quality', v)}>
                              <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="..."/></SelectTrigger>
                              <SelectContent className="bg-slate-900 text-white border-white/10"><SelectItem value="good">Boa</SelectItem><SelectItem value="average">Média</SelectItem><SelectItem value="bad">Ruim</SelectItem></SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300 mb-3 block">Atividades de Trabalho</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {WORK_ACTIVITIES.map(act => (
                            <div 
                              key={act} 
                              className="flex items-center space-x-2 cursor-pointer"
                              onClick={() => toggleAnamnesisList('work_activities', act)}
                            >
                              <Checkbox checked={anamnesisForm.work_activities?.includes(act)} className="pointer-events-none border-white/30"/>
                              <span className="text-sm text-gray-400">{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="nutri" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label className="text-gray-300 mb-2 block">Água (L/dia)</Label><Input value={anamnesisForm.water_intake} onChange={e => updateAnamnesis('water_intake', e.target.value)} className="bg-black/20 border-white/10"/></div>
                        <div><Label className="text-gray-300 mb-2 block">Suplementos</Label><Input value={anamnesisForm.supplements} onChange={e => updateAnamnesis('supplements', e.target.value)} className="bg-black/20 border-white/10"/></div>
                        <div className="md:col-span-2"><Label className="text-gray-300 mb-2 block">Histórico Alimentar / Aversões</Label><Textarea value={anamnesisForm.diet_history} onChange={e => updateAnamnesis('diet_history', e.target.value)} className="bg-black/20 border-white/10 min-h-[100px]"/></div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
                <CardContent className="space-y-4 pt-6">
                  <div><Label className="text-gray-300">Objetivo Principal (Resumo)</Label><Textarea value={formData.goals} onChange={e => handleInputChange('goals', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/></div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button type="submit" disabled={loading} className="bg-primary text-black hover:bg-primary/80 font-bold px-8 min-w-[150px]">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Tudo
            </Button>
          </div>
        </form>

        <Dialog open={isCropDialogOpen} onOpenChange={(open) => { if(!open) setIsCropDialogOpen(false) }}>
          <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[500px] h-[550px] flex flex-col">
            <DialogHeader><DialogTitle>Ajustar Foto</DialogTitle><DialogDescription>Enquadre seu rosto.</DialogDescription></DialogHeader>
            <div className="relative flex-1 bg-black w-full overflow-hidden rounded-md my-4 border border-white/10">
              {imageSrc && <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} cropShape="round" showGrid={true} />}
            </div>
            <div className="space-y-4 px-2">
              <div className="flex items-center gap-4"><ZoomIn className="h-4 w-4 text-gray-400" /><Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(val) => setZoom(val[0])} className="flex-1 cursor-pointer" /></div>
              <DialogFooter className="flex gap-2 justify-between sm:justify-end mt-2"><Button variant="ghost" onClick={() => { setIsCropDialogOpen(false); setImageSrc(null); }} className="text-gray-400 hover:text-white">Cancelar</Button><Button onClick={handleConfirmUpload} disabled={uploading} className="bg-primary text-black hover:bg-primary/90 font-bold px-6">{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Confirmar e Salvar</Button></DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ProfileSettings