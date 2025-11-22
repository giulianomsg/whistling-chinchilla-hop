import React, { useState, useEffect, useRef } from 'react'
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
import { Loader2, Save, Upload, User, Shield, Award, Phone, Camera, AlertTriangle } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'

// --- Utilitários de Imagem ---
const sanitizeFileName = (fileName: string): string => {
  const name = fileName.substring(0, fileName.lastIndexOf('.'))
  const ext = fileName.substring(fileName.lastIndexOf('.') + 1)
  const sanitized = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  return `${sanitized}-${Date.now()}.${ext}`
}

const resizeImage = (file: File, maxWidth = 800, maxHeight = 800): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = URL.createObjectURL(file)
    image.onload = () => {
      const canvas = document.createElement('canvas')
      let width = image.width
      let height = image.height
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Falha canvas')); return }
      ctx.drawImage(image, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Falha blob'))
      }, file.type, 0.85)
    }
    image.onerror = (error) => reject(error)
  })
}

const ProfileSettings: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Estado unificado para garantir integridade
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    avatarUrl: '',
    // Profissional
    bio: '',
    specialty: '',
    consultationPrice: '',
    certifications: '',
    // Cliente
    goals: '',
    restrictions: ''
  })
  
  // Estado para Role (para evitar depender do profile context que pode estar desatualizado)
  const [userRole, setUserRole] = useState<string>('')

  // Preview Imagem
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Carregar dados DIRETAMENTE do banco ao montar (Bypass Context)
  useEffect(() => {
    if (user) fetchFreshData()
  }, [user])

  const fetchFreshData = async () => {
    if (!user) return
    try {
      setLoading(true)
      
      // 1. Busca Profile Base
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      const newForm = { ...formData }
      newForm.fullName = profile.full_name || ''
      newForm.phone = profile.phone || ''
      newForm.avatarUrl = profile.avatar_url || '' // Cache bust será adicionado na renderização
      setUserRole(profile.role)

      // 2. Busca Dados Específicos
      if (profile.role === 'professional') {
        const { data: profData } = await supabase.from('professional_details').select('*').eq('profile_id', user.id).maybeSingle()
        if (profData) {
          newForm.bio = profData.bio || ''
          newForm.specialty = ['personal_trainer', 'nutritionist'].includes(profData.specialty) ? profData.specialty : ''
          newForm.consultationPrice = profData.consultation_price ? profData.consultation_price.toString() : ''
          
          // Tratamento JSONB certifications
          let certText = ''
          if (profData.certifications) {
            if (typeof profData.certifications === 'string') certText = profData.certifications
            else if (typeof profData.certifications === 'object') certText = (profData.certifications as any).raw_text || ''
          }
          newForm.certifications = certText
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
      console.error('Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // --- Lógica de Imagem ---
  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      const objectUrl = URL.createObjectURL(file)
      setPreviewImage(objectUrl)
      setSelectedFile(file)
      setIsCropDialogOpen(true)
      event.target.value = ''
    }
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile || !user) return
    try {
      setUploading(true)
      setIsCropDialogOpen(false)

      const blob = await resizeImage(selectedFile, 800, 800)
      const processedFile = new File([blob], selectedFile.name, { type: selectedFile.type })
      const fileName = sanitizeFileName(selectedFile.name)
      const filePath = `${user.id}/${fileName}`

      // 1. Upload Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, processedFile, { upsert: true })

      if (uploadError) throw uploadError

      // 2. Get URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      // 3. Update Profile
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (dbError) throw dbError

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }))
      
      // Forçar atualização no Auth User Metadata também (opcional, mas bom para sync)
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })

      showSuccess('Foto atualizada com sucesso!')
    } catch (error: any) {
      console.error(error)
      showError('Erro no upload: ' + error.message)
    } finally {
      setUploading(false)
      setPreviewImage(null)
      setSelectedFile(null)
    }
  }

  // --- Salvar Geral ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      // 1. Atualizar Tabela PUBLIC.PROFILES (Fonte da verdade do app)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: formData.fullName,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (profileError) throw new Error('Erro perfil: ' + profileError.message)

      // 2. Atualizar AUTH.USERS (Para manter metadados sincronizados)
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName, phone: formData.phone }
      })
      if (authError) console.warn('Aviso: Metadados de auth não sincronizados', authError)

      // 3. Atualizar Detalhes Específicos
      if (userRole === 'professional') {
        if (!formData.specialty) throw new Error('Especialidade é obrigatória.')
        
        const price = formData.consultationPrice ? parseFloat(formData.consultationPrice.replace(',', '.')) : null

        const { error: profError } = await supabase.from('professional_details').upsert({
          profile_id: user.id,
          bio: formData.bio,
          specialty: formData.specialty,
          consultation_price: price,
          certifications: { raw_text: formData.certifications },
          updated_at: new Date().toISOString()
        })
        if (profError) throw new Error('Erro dados profissionais: ' + profError.message)

      } else if (userRole === 'client') {
        const { error: clientError } = await supabase.from('client_details').upsert({
          profile_id: user.id,
          goals: formData.goals,
          health_restrictions: formData.restrictions,
          updated_at: new Date().toISOString()
        })
        if (clientError) throw new Error('Erro ficha aluno: ' + clientError.message)
      }

      showSuccess('Perfil salvo com sucesso!')
      await fetchFreshData() // Recarrega dados para garantir visualização correta

    } catch (error: any) {
      console.error(error)
      showError(error.message || 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

  // Helper para renderizar Avatar com cache bust
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
              
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                {renderAvatar()}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    Alterar Foto
                  </Button>
                </div>
              </div>

              {/* Dados Básicos */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Nome Completo</Label>
                    <Input 
                      value={formData.fullName} 
                      onChange={e => handleInputChange('fullName', e.target.value)} 
                      className="bg-black/20 border-white/10 text-white mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Telefone</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        value={formData.phone} 
                        onChange={e => handleInputChange('phone', e.target.value)} 
                        className="bg-black/20 border-white/10 text-white pl-10"
                        placeholder="(00) 00000-0000"
                      />
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

          {/* Profissional */}
          {userRole === 'professional' && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="text-purple-400"/> Perfil Profissional</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Área de Atuação <span className="text-red-400">*</span></Label>
                    <Select onValueChange={(v) => handleInputChange('specialty', v)} value={formData.specialty}>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="personal_trainer">Personal Trainer</SelectItem>
                        <SelectItem value="nutritionist">Nutricionista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Preço Consulta (R$)</Label>
                    <Input type="number" step="0.01" value={formData.consultationPrice} onChange={e => handleInputChange('consultationPrice', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/>
                  </div>
                </div>
                <div><Label className="text-gray-300">Biografia</Label><Textarea value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5 min-h-[100px]"/></div>
                <div><Label className="text-gray-300">Certificações</Label><Textarea value={formData.certifications} onChange={e => handleInputChange('certifications', e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/></div>
              </CardContent>
            </Card>
          )}

          {/* Cliente */}
          {userRole === 'client' && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
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

        {/* Dialog Preview */}
        <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Foto</DialogTitle>
              <DialogDescription>Confirme para atualizar sua foto de perfil.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-6">
              {previewImage && (
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary/30">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4 flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-yellow-500"/> A imagem será otimizada.</p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsCropDialogOpen(false)} className="text-gray-400 hover:text-white">Cancelar</Button>
              <Button onClick={handleConfirmUpload} disabled={uploading} className="bg-primary text-black hover:bg-primary/90">
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ProfileSettings