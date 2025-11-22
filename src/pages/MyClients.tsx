import React, { useState, useEffect } from 'react'
// ... imports ...
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Users, Plus, Search, Mail, Calendar, Clock, Loader2, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/utils/toast'

// ... interfaces ...
interface ClientProfile { id: string, email: string, full_name: string | null, avatar_url: string | null, phone: string | null, role: string, created_at: string }
interface ClientProfessional { id: string, client_id: string, professional_id: string, status: string, started_at: string, ended_at: string | null, notes: string | null, client: ClientProfile }

const MyClients: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [clients, setClients] = useState<ClientProfessional[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientNotes, setNewClientNotes] = useState('')

  const fetchClients = async () => {
    if (!user) return
    setPageLoading(true)
    try {
      const { data, error } = await supabase.from('client_professionals').select(`*, client:profiles!client_id(*)`).eq('professional_id', user.id).order('started_at', { ascending: false })
      if (error) throw error
      setClients((data as any) || [])
    } catch (error) { console.error(error); showError('Erro ao carregar clientes') } 
    finally { setPageLoading(false) }
  }

  const findClientByEmail = async (email: string) => {
    if (!user) return null
    try {
      const { data } = await supabase.rpc('find_client_by_email', { client_email: email })
      return data?.[0]
    } catch (error) { return null }
  }

  // RESET AO ABRIR
  const openAddDialog = () => {
    setNewClientEmail('')
    setNewClientName('')
    setNewClientPhone('')
    setNewClientNotes('')
    setIsAddDialogOpen(true)
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newClientEmail.trim()) return
    setAddLoading(true)
    try {
      const client = await findClientByEmail(newClientEmail.trim())
      if (!client) { showError('Cliente não encontrado.'); return }
      
      const { error: linkError } = await supabase.rpc('link_client_and_update_profile', {
        p_client_id: client.id, p_notes: newClientNotes || null, p_full_name: newClientName || null, p_phone: newClientPhone || null
      })
      if (linkError) throw linkError

      showSuccess('Cliente adicionado com sucesso!')
      setIsAddDialogOpen(false)
      fetchClients()
    } catch (error: any) { showError(error?.message || 'Erro ao adicionar cliente') } 
    finally { setAddLoading(false) }
  }

  useEffect(() => { if (!loading && user) fetchClients() }, [user?.id, loading])

  // ... filteredClients, getInitials, getStatusInfo (iguais) ...
  const filteredClients = clients.filter(client => {
    if (!searchTerm.trim()) return true
    const searchLower = searchTerm.toLowerCase()
    return (client.client?.full_name?.toLowerCase() || '').includes(searchLower) || (client.client?.email?.toLowerCase() || '').includes(searchLower)
  })
  const getInitials = (name: string | null, email: string) => (name || email).substring(0, 2).toUpperCase()
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active': return { className: 'bg-green-500/20 text-green-400 border-green-500/50', icon: <CheckCircle className="h-3 w-3" />, text: 'Ativo' }
      case 'inactive': return { className: 'bg-gray-500/20 text-gray-400 border-gray-500/50', icon: <XCircle className="h-3 w-3" />, text: 'Inativo' }
      default: return { className: 'bg-gray-500/20 text-gray-400', icon: <Clock className="h-3 w-3" />, text: status }
    }
  }

  if (loading || pageLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Users className="h-8 w-8 text-primary"/> Meus Clientes</h1>
          
          {/* BOTÃO CORRIGIDO */}
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/80 text-black font-semibold">
            <Plus className="h-4 w-4 mr-2" /> Adicionar
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
              <DialogHeader><DialogTitle>Adicionar Novo Cliente</DialogTitle></DialogHeader>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div><Label>Email *</Label><Input type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} required className="bg-black/20 border-white/10" placeholder="email@exemplo.com"/></div>
                <div><Label>Nome (Opcional)</Label><Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="bg-black/20 border-white/10"/></div>
                <div><Label>Telefone (Opcional)</Label><Input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="bg-black/20 border-white/10"/></div>
                <div><Label>Notas</Label><Textarea value={newClientNotes} onChange={(e) => setNewClientNotes(e.target.value)} className="bg-black/20 border-white/10"/></div>
                <Button type="submit" disabled={addLoading} className="w-full bg-primary text-black">{addLoading ? <Loader2 className="animate-spin"/> : 'Adicionar'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista e Busca (Mantida igual) */}
        <div className="relative mb-6"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64 bg-white/5 border-white/10 text-white"/></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredClients.map((cp) => {
            const statusInfo = getStatusInfo(cp.status)
            return (
              <Card key={cp.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => navigate(`/app/clients/${cp.client.id}`)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-white/10"><AvatarImage src={cp.client.avatar_url || ''}/><AvatarFallback className="bg-slate-800 text-primary font-bold">{getInitials(cp.client.full_name, cp.client.email)}</AvatarFallback></Avatar>
                      <div><h3 className="font-semibold text-white group-hover:text-primary transition-colors">{cp.client.full_name || 'Sem Nome'}</h3><p className="text-xs text-gray-400 truncate max-w-[150px]">{cp.client.email}</p></div>
                    </div>
                    <Badge variant="outline" className={`border-0 ${statusInfo.className}`}><span className="flex items-center gap-1">{statusInfo.icon} {statusInfo.text}</span></Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-400 mt-2">
                    <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5"/><span>Desde {new Date(cp.started_at).toLocaleDateString('pt-BR')}</span></div>
                    {cp.client.phone && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5"/><span>{cp.client.phone}</span></div>}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end"><Button variant="ghost" size="sm" className="text-primary p-0 h-auto">Ver Detalhes <ArrowRight className="ml-1 h-3 w-3"/></Button></div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MyClients