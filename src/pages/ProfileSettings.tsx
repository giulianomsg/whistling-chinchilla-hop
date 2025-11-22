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

// --- Utilitários de Imagem Locais (para garantir que funcionem sem dependência externa) ---
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
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Estados do Formulário Base
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  // Estados Profissional
  const [bio, setBio] = useState('')
  // O valor inicial deve ser válido para o Select ou vazio
  const [specialty, setSpecialty] = useState<string>('') 
  const [consultationPrice, setConsultationPrice] = useState('')
  const [certifications, setCertifications] = useState('')

  // Estados Cliente
  const [goals, setGoals] = useState('')
  const [restrictions, setRestrictions] = useState('')

  // Estado para Preview da Imagem
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setAvatarUrl(profile.avatar_url)
      fetchRoleDetails()
    }
  }, [profile])

  const fetchRoleDetails = async () => {
    if (!user || !profile) return
    try {
      if (profile.role === 'professional') {
        const { data } = await supabase.from('professional_details').select('*').eq('profile_id', user.id).maybeSingle()
        if (data) {
          setBio(data.bio || '')
          // Garante que o valor vindo do banco seja um dos permitidos, senão fica vazio
          const validSpecialty = ['personal_trainer', 'nutritionist'].includes(data.specialty) ? data.specialty : ''
          setSpecialty(validSpecialty)
          
          setConsultationPrice(data.consultation_price ? data.consultation_price.toString() : '')
          
          // Tratamento robusto para o JSONB
          let certText = ''
          if (data.certifications) {
            if (typeof data.certifications === 'string') certText = data.certifications
            else if (typeof data.certifications === 'object') certText = (data.certifications as any).raw_text || ''
          }
          setCertifications(certText)
        }
      } else if (profile.role === 'client') {
        const { data } = await supabase.from('client_details').select('*').eq('profile_id', user.id).maybeSingle()
        if (data) {
          setGoals(data.goals || '')
          setRestrictions(data.health_restrictions || '')
        }
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error)
    }
  }

  // 1. Seleção do Arquivo
  const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      const objectUrl = URL.createObjectURL(file)
      setPreviewImage(objectUrl)
      setSelectedFile(file)
      setIsCropDialogOpen(true)
      event.target.value = '' // Reset input
    }
  }

  // 2. Upload da Foto
  const handleConfirmUpload = async () => {
    if (!selectedFile || !user) return
    
    try {
      setUploading(true)
      setIsCropDialogOpen(false) 

      const blob = await resizeImage(selectedFile, 800, 800)
      const processedFile = new File([blob], selectedFile.name, { type: selectedFile.type })
      const fileName = sanitizeFileName(selectedFile.name)
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, processedFile, { upsert: true })

      if (uploadError) throw uploadError

      // Adiciona timestamp para evitar cache do navegador
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlWithTimestamp, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrlWithTimestamp)
      showSuccess('Foto de perfil atualizada!')
    } catch (error: any) {
      console.error('Erro upload:', error)
      showError(error.message || 'Erro ao atualizar foto')
    } finally {
      setUploading(false)
      setPreviewImage(null)
      setSelectedFile(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      // 1. Atualizar Profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (profileError) throw new Error('Erro ao salvar dados básicos: ' + profileError.message)

      // 2. Atualizar Tabelas Específicas
      if (profile?.role === 'professional') {
        // Validação da Constraint do Banco
        if (!specialty) throw new Error('Selecione o Tipo de Profissional (obrigatório pelo sistema).')

        const priceNumber = consultationPrice === '' ? null : parseFloat(consultationPrice.replace(',', '.'))
        
        const { error } = await supabase.from('professional_details').upsert({
          profile_id: user.id,
          bio: bio,
          specialty: specialty, // Aqui vai 'personal_trainer' ou 'nutritionist'
          consultation_price: priceNumber,
          certifications: { raw_text: certifications }, 
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' })

        if (error) throw new Error('Erro ao salvar dados profissionais: ' + error.message)

      } else if (profile?.role === 'client') {
        const { error } = await supabase.from('client_details').upsert({
          profile_id: user.id,
          goals: goals,
          health_restrictions: restrictions,
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' })

        if (error) throw new Error('Erro ao salvar ficha do aluno: ' + error.message)
      }

      showSuccess('Perfil salvo com sucesso!')
    } catch (error: any) {
      console.error(error)
      showError(error.message || 'Erro ao salvar perfil')
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
          {/* Seção 1: Identidade */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Informações Públicas</CardTitle>
              <CardDescription className="text-gray-400">Como você aparece para outros usuários.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Avatar Area */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-white/10 shadow-xl ring-2 ring-primary/20">
                  <AvatarImage src={avatarUrl || ''} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-slate-800 text-primary font-bold">
                    {fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
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

              {/* Inputs Básicos */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Nome Completo</Label>
                    <Input 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      className="bg-black/20 border-white/10 text-white mt-1.5"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Telefone</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        className="bg-black/20 border-white/10 text-white pl-10"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <Input 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-white/5 border-white/5 text-gray-500 mt-1.5 cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Profissional */}
          {profile?.role === 'professional' && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl animate-in slide-in-from-bottom-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="text-purple-400"/> Perfil Profissional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Tipo de Profissional <span className="text-red-400">*</span></Label>
                    {/* CORREÇÃO DO ERRO DE CONSTRAINT: Usando Select com valores fixos do banco */}
                    <Select onValueChange={setSpecialty} value={specialty}>
                      <SelectTrigger className="bg-black/20 border-white/10 text-white mt-1.5">
                        <SelectValue placeholder="Selecione sua área..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="personal_trainer">Personal Trainer</SelectItem>
                        <SelectItem value="nutritionist">Nutricionista</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-gray-500 mt-1">Campo obrigatório para registro no sistema.</p>
                  </div>
                  <div>
                    <Label className="text-gray-300">Preço Consulta (R$)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={consultationPrice} 
                      onChange={e => setConsultationPrice(e.target.value)} 
                      className="bg-black/20 border-white/10 text-white mt-1.5"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Biografia & Especialidades</Label>
                  <Textarea 
                    value={bio} 
                    onChange={e => setBio(e.target.value)} 
                    className="bg-black/20 border-white/10 text-white mt-1.5 min-h-[100px]"
                    placeholder="Descreva suas especialidades (ex: Hipertrofia, Yoga), metodologia e experiência..."
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Certificações</Label>
                  <Textarea 
                    value={certifications} 
                    onChange={e => setCertifications(e.target.value)} 
                    className="bg-black/20 border-white/10 text-white mt-1.5"
                    placeholder="CREF, CRN, Pós-graduações..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção 3: Aluno */}
          {profile?.role === 'client' && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl animate-in slide-in-from-bottom-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="text-green-400"/> Ficha do Aluno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Objetivos</Label>
                  <Textarea 
                    value={goals} 
                    onChange={e => setGoals(e.target.value)} 
                    className="bg-black/20 border-white/10 text-white mt-1.5"
                    placeholder="Ex: Hipertrofia, Perda de peso..."
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Restrições / Lesões</Label>
                  <Textarea 
                    value={restrictions} 
                    onChange={e => setRestrictions(e.target.value)} 
                    className="bg-black/20 border-white/10 text-white mt-1.5"
                    placeholder="Ex: Dor no joelho, Cirurgia no ombro..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Barra de Ação */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-primary text-black hover:bg-primary/80 font-bold px-8 min-w-[150px]"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Tudo
            </Button>
          </div>
        </form>

        {/* Dialog de Preview/Recorte de Imagem - CORRIGIDO com DialogTitle */}
        <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Foto de Perfil</DialogTitle>
              <DialogDescription>Pré-visualização da sua nova imagem. Ela será redimensionada automaticamente.</DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center py-6">
              {previewImage && (
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary/30">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-yellow-500"/>
                Confirme para salvar.
              </p>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsCropDialogOpen(false)} className="text-gray-400 hover:text-white">
                Cancelar
              </Button>
              <Button onClick={handleConfirmUpload} disabled={uploading} className="bg-primary text-black hover:bg-primary/90">
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Confirmar Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}

export default ProfileSettings