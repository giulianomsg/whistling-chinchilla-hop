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
import { Slider } from '@/components/ui/slider'
import { Loader2, Save, Upload, User, Shield, Award, Phone, Camera, RotateCcw, ZoomIn } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'

// --- UTILITÁRIOS DE IMAGEM INTEGRADOS ---

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

// Função principal que gera o arquivo recortado
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('No 2d context')

  // Configura o canvas para o tamanho exato do recorte
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
    }, 'image/jpeg', 0.95) // Alta qualidade
  })
}

const ProfileSettings: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // --- Estados do Formulário ---
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
  const [userRole, setUserRole] = useState<string>('')

  // --- Estados do Recorte ---
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Carregar dados
  useEffect(() => {
    if (user) fetchFreshData()
  }, [user])

  const fetchFreshData = async () => {
    if (!user) return
    try {
      // Busca profile
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileError) throw profileError

      const newForm = { ...formData }
      newForm.fullName = profile.full_name || ''
      newForm.phone = profile.phone || ''
      newForm.avatarUrl = profile.avatar_url || ''
      setUserRole(profile.role)

      // Busca detalhes
      if (profile.role === 'professional') {
        const { data: profData } = await supabase.from('professional_details').select('*').eq('profile_id', user.id).maybeSingle()
        if (profData) {
          newForm.bio = profData.bio || ''
          newForm.specialty = ['personal_trainer', 'nutritionist'].includes(profData.specialty) ? profData.specialty : ''
          newForm.consultationPrice = profData.consultation_price ? profData.consultation_price.toString() : ''
          const certData = profData.certifications as any
          newForm.certifications = (typeof profData.certifications === 'string' ? profData.certifications : certData?.raw_text) || ''
        }
      } else if (profile.role === 'client') {
        const { data: clientData } = await supabase.from('client_details').select('*').eq('profile_id', user.id).maybeSingle()
        if (clientData) {
          newForm.goals = clientData.goals || ''
          newForm.restrictions = clientData.health_restrictions || ''
        }
      }
      setFormData(newForm)
    } catch (error) {
      console.error(error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // --- Seleção de Arquivo ---
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
      event.target.value = '' // Limpa input
    }
  }

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // --- Processamento e Upload ---
  const handleConfirmUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return
    
    try {
      setUploading(true)
      
      // 1. Processa o recorte no Canvas e gera Blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      
      // 2. Prepara arquivo para Upload
      const fileName = `avatar-${Date.now()}.jpg`
      const filePath = `${user.id}/${fileName}`
      const processedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' })

      // 3. Upload Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, processedFile, { upsert: true })

      if (uploadError) throw uploadError

      // 4. URL Pública
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const finalUrl = `${publicUrl}?t=${Date.now()}` // Cache busting

      // 5. Atualiza Banco
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: finalUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (dbError) throw dbError

      // 6. Atualiza Estado Local
      setFormData(prev => ({ ...prev, avatarUrl: finalUrl }))
      await supabase.auth.updateUser({ data: { avatar_url: finalUrl } })
      
      setIsCropDialogOpen(false)
      showSuccess('Foto atualizada com sucesso!')
    } catch (error: any) {
      console.error('Erro upload:', error)
      showError('Erro ao salvar foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  // --- Salvar Dados de Texto ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      // 1. Profiles
      const { error: profileError } = await supabase.from('profiles')
        .update({ 
          full_name: formData.fullName,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (profileError) throw profileError

      // 2. Auth Metadata Sync
      await supabase.auth.updateUser({
        data: { full_name: formData.fullName, phone: formData.phone }
      })

      // 3. Detalhes Específicos
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
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' })
        
        if (clientError) throw clientError
      }

      showSuccess('Dados salvos com sucesso!')
      // Recarrega para garantir sincronia
      await fetchFreshData()

    } catch (error: any) {
      console.error(error)
      showError(error.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <User className="text-primary" /> Configurações de Perfil
        </h1>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Info Pessoal */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Informações Públicas</CardTitle>
              <CardDescription className="text-gray-400">Dados visíveis na plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-white/10 shadow-xl ring-2 ring-primary/20">
                  <AvatarImage src={formData.avatarUrl} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-slate-800 text-primary font-bold">
                    {formData.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelect} className="hidden" disabled={uploading} />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    Alterar Foto
                  </Button>
                </div>
              </div>

              {/* Inputs */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Nome Completo</Label>
                    <Input value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/>
                  </div>
                  <div>
                    <Label className="text-gray-300">Telefone</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="bg-black/20 border-white/10 text-white pl-10" placeholder="(00) 00000-0000"/>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-white/5 border-white/5 text-gray-500 mt-1.5 cursor-not-allowed"/>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campos Condicionais */}
          {userRole === 'professional' && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl animate-in slide-in-from-bottom-4">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="text-purple-400"/> Dados Profissionais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Tipo de Profissional <span className="text-red-400">*</span></Label>
                    <Select onValueChange={(v) => handleInputChange('specialty', v)} value={formData.specialty}>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="personal_trainer">Personal Trainer</SelectItem>
                        <SelectItem value="nutritionist">Nutricionista</SelectItem>
                      </SelectContent>
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
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl animate-in slide-in-from-bottom-4">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Shield className="text-green-400"/> Ficha do Aluno</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-gray-300">Objetivos</Label><Textarea value={formData.goals} onChange={e => handleInputChange('goals', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/></div>
                <div><Label className="text-gray-300">Restrições</Label><Textarea value={formData.restrictions} onChange={e => handleInputChange('restrictions', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/></div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button type="submit" disabled={loading} className="bg-primary text-black hover:bg-primary/80 font-bold px-8 min-w-[150px]">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Tudo
            </Button>
          </div>
        </form>

        {/* DIALOG DE RECORTE (CROPPER) */}
        <Dialog open={isCropDialogOpen} onOpenChange={(open) => { if(!open) setIsCropDialogOpen(false) }}>
          <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[500px] h-[550px] flex flex-col">
            <DialogHeader>
              <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
              <DialogDescription>Arraste e aplique zoom para enquadrar seu rosto.</DialogDescription>
            </DialogHeader>
            
            <div className="relative flex-1 bg-black w-full overflow-hidden rounded-md my-4 border border-white/10">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1} // Quadrado 1:1
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round" // Visual redondo para avatar
                  showGrid={true}
                />
              )}
            </div>

            <div className="space-y-4 px-2">
              <div className="flex items-center gap-4">
                <ZoomIn className="h-4 w-4 text-gray-400" />
                <Slider 
                  value={[zoom]} 
                  min={1} 
                  max={3} 
                  step={0.1} 
                  onValueChange={(val) => setZoom(val[0])}
                  className="flex-1 cursor-pointer"
                />
              </div>
              
              <DialogFooter className="flex gap-2 justify-between sm:justify-end mt-2">
                <Button variant="ghost" onClick={() => { setIsCropDialogOpen(false); setImageSrc(null); }} className="text-gray-400 hover:text-white">
                  Cancelar
                </Button>
                <Button onClick={handleConfirmUpload} disabled={uploading} className="bg-primary text-black hover:bg-primary/90 font-bold px-6">
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Confirmar e Salvar
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}

export default ProfileSettings