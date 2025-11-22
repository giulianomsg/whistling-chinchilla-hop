import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Search, Plus, MoreVertical, Phone, Mail, 
  Loader2, Dumbbell, UserX, User, Trophy // Trophy adicionado
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const MyClients: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClientEmail, setNewClientEmail] = useState('')
  const [addingClient, setAddingClient] = useState(false)

  const fetchClients = async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('client_professionals')
        .select(`
          id, status,
          client:profiles!client_id (
            id, full_name, email, phone, avatar_url, level, current_xp
          )
        `)
        .eq('professional_id', user.id)
        .eq('status', 'active')
      
      if (error) throw error
      setClients((data || []).filter(item => item.client !== null))
    } catch (error) {
      console.error(error)
      showError('Erro ao carregar alunos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (!authLoading && user) fetchClients() }, [user, authLoading])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientEmail.trim()) return
    setAddingClient(true)
    try {
      const { data: foundUser } = await supabase.from('profiles').select('id').eq('email', newClientEmail.trim()).eq('role', 'client').maybeSingle()
      if (!foundUser) throw new Error('Aluno não encontrado.')

      const { error } = await supabase.from('client_professionals').insert({ client_id: foundUser.id, professional_id: user!.id, status: 'active' })
      if (error) throw error

      showSuccess('Aluno vinculado!')
      setNewClientEmail('')
      setIsAddDialogOpen(false)
      fetchClients()
    } catch (error: any) { showError(error.message) } 
    finally { setAddingClient(false) }
  }

  const handleRemoveClient = async (linkId: string) => {
    await supabase.from('client_professionals').update({ status: 'inactive' }).eq('id', linkId)
    fetchClients()
  }

  const filteredClients = clients.filter(item => {
    const term = searchTerm.toLowerCase()
    return (item.client?.full_name?.toLowerCase() || '').includes(term) || (item.client?.email?.toLowerCase() || '').includes(term)
  })

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div><h1 className="text-3xl font-bold text-white flex items-center gap-2"><User className="text-blue-400" /> Meus Alunos</h1></div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild><Button className="bg-primary text-black hover:bg-primary/80 font-bold"><Plus className="mr-2 h-4 w-4" /> Novo Aluno</Button></DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
              <DialogHeader><DialogTitle>Adicionar Novo Aluno</DialogTitle></DialogHeader>
              <form onSubmit={handleAddClient} className="space-y-4 mt-4">
                <div><Label>Email do Aluno</Label><Input value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="bg-black/20 border-white/10 mt-1.5 text-white"/></div>
                <DialogFooter><Button type="submit" disabled={addingClient} className="bg-green-600 text-white hover:bg-green-700 w-full">{addingClient ? <Loader2 className="animate-spin h-4 w-4" /> : 'Vincular'}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white"/></div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10 border-dashed"><h3 className="text-lg font-medium text-white">Nenhum aluno encontrado</h3></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((item) => {
              const client = item.client || {}
              return (
                <Card key={item.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-white/10"><AvatarImage src={client.avatar_url || ''} /><AvatarFallback className="bg-slate-800 text-primary font-bold">{client.full_name?.[0] || '?'}</AvatarFallback></Avatar>
                        <div>
                          <CardTitle className="text-base text-white truncate max-w-[150px]">{client.full_name || 'Sem nome'}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="h-5 px-1.5 bg-green-500/10 text-green-400 border-none">Ativo</Badge>
                            {/* EXIBIÇÃO DO NÍVEL AQUI */}
                            <Badge variant="outline" className="h-5 px-1.5 border-yellow-500/30 text-yellow-400 flex items-center gap-1"><Trophy className="h-3 w-3"/> Lvl {client.level || 1}</Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400 hover:text-white -mr-2"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white">
                          <DropdownMenuItem onClick={() => navigate(`/app/clients/${client.id}`)} className="hover:bg-white/10 cursor-pointer"><Dumbbell className="mr-2 h-4 w-4" /> Ver Treinos</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/app/chat`)} className="hover:bg-white/10 cursor-pointer"><Mail className="mr-2 h-4 w-4" /> Enviar Mensagem</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveClient(item.id)} className="text-red-400 hover:bg-red-900/20 cursor-pointer"><UserX className="mr-2 h-4 w-4" /> Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span className="truncate">{client.email}</span></div>
                      {client.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{client.phone}</span></div>}
                    </div>
                    <Button onClick={() => navigate(`/app/clients/${client.id}`)} className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-primary" variant="ghost">Gerenciar</Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyClients