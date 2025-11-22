import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Save, Upload, User, Shield, Award, Phone } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'

const ProfileSettings: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Estado Base (Tabela: profiles)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  // Estado Profissional (Tabela: professional_details)
  const [bio, setBio] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [consultationPrice, setConsultationPrice] = useState('') // Corrigido para consultation_price
  const [certifications, setCertifications] = useState('') // Mapeado para JSONB

  // Estado Aluno (Tabela: client_details)
  const [goals, setGoals] = useState('')
  const [restrictions, setRestrictions] = useState('')

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
          setSpecialty(data.specialty || '')
          setConsultationPrice(data.consultation_price?.toString() || '')
          // Extrair texto do JSONB certifications
          const certData = data.certifications as any
          setCertifications(certData?.raw_text || '') 
        }
      } else if (profile.role === 'client') {
        const { data } = await supabase.from('client_details').select('*').eq('profile_id', user.id).maybeSingle()
        if (data) {
          setGoals(data.goals || '')
          setRestrictions(data.health_restrictions || '')
        }
      }
    } catch (error) {
      console.error('Error fetching details:', error)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) throw new Error('Selecione uma imagem.')

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload para bucket 'avatars' (verificado em storage.buckets no SQL)
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user!.id)
      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      showSuccess('Avatar atualizado!')
    } catch (error: any) {
      showError(error.message || 'Erro no upload')
    } finally {
      setUploading(false)
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
      
      if (profileError) throw profileError

      // 2. Atualizar Detalhes Específicos
      if (profile?.role === 'professional') {
        const { error } = await supabase.from('professional_details').upsert({
          profile_id: user.id,
          bio,
          specialty,
          consultation_price: parseFloat(consultationPrice) || 0,
          certifications: { raw_text: certifications }, // Salvando como JSON
          updated_at: new Date().toISOString()
        })
        if (error) throw error
      } else if (profile?.role === 'client') {
        const { error } = await supabase.from('client_details').upsert({
          profile_id: user.id,
          goals,
          health_restrictions: restrictions,
          updated_at: new Date().toISOString()
        })
        if (error) throw error
      }

      showSuccess('Perfil salvo com sucesso!')
    } catch (error) {
      showError('Erro ao salvar perfil')
      console.error(error)
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
          {/* Avatar & Info Básica */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Informações Públicas</CardTitle>
              <CardDescription className="text-gray-400">Sua identidade na plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-white/10 shadow-xl">
                  <AvatarImage src={avatarUrl || ''} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-slate-800 text-primary font-bold">
                    {fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="relative">
                  <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
                  <Label htmlFor="avatar-upload" className={`cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? 'Enviando...' : 'Alterar Foto'}
                  </Label>
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Nome Completo</Label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/>
                  </div>
                  <div>
                    <Label className="text-gray-300">Telefone</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-black/20 border-white/10 text-white pl-10" placeholder="(00) 00000-0000"/>
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

          {/* Campos Profissionais */}
          {profile?.role === 'professional' && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Award className="text-purple-400"/> Perfil Profissional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Especialidade</Label>
                    <Input value={specialty} onChange={e => setSpecialty(e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5" placeholder="Ex: Hipertrofia"/>
                  </div>
                  <div>
                    <Label className="text-gray-300">Preço Consulta (R$)</Label>
                    <Input type="number" value={consultationPrice} onChange={e => setConsultationPrice(e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Biografia</Label>
                  <Textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5 min-h-[100px]"/>
                </div>
                <div>
                  <Label className="text-gray-300">Certificações</Label>
                  <Textarea value={certifications} onChange={e => setCertifications(e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5" placeholder="CREF, Cursos..."/>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campos Aluno */}
          {profile?.role === 'client' && (
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Shield className="text-green-400"/> Ficha do Aluno</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Objetivos</Label>
                  <Textarea value={goals} onChange={e => setGoals(e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/>
                </div>
                <div>
                  <Label className="text-gray-300">Restrições de Saúde</Label>
                  <Textarea value={restrictions} onChange={e => setRestrictions(e.target.value)} className="bg-black/20 border-white/10 text-white mt-1.5"/>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="bg-primary text-black hover:bg-primary/80 font-bold px-8 shadow-lg transition-all hover:scale-105">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileSettings