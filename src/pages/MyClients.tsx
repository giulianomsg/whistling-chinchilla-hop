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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { 
  Search, Plus, MoreVertical, Phone, Mail, 
  Loader2, Dumbbell, UserX, User, Trophy, Calendar, Utensils, Users, Check
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
          id, status, started_at,
          client:profiles!client_id (
            id, full_name, email, phone, avatar_url, level,
            client_workouts:client_workouts!client_id(id, status),
            client_meal_plans:client_meal_plans!client_id(id, status),
            other_links:client_professionals!client_id(
              professional:profiles!professional_id(
                id, full_name, avatar_url,
                details:professional_details(specialty)
              )
            )
          )
        `)
        .eq('professional_id', user.id)
        .eq('status', 'active')
      
      if (error) throw error
      setClients((data || []).filter(item => item.client !== null))

    } catch (error: any) {
      console.error(error)
      showError('Erro ao carregar alunos: ' + error.message)
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

      const { error } = await supabase.from('client_professionals').insert({ 
        client_id: foundUser.id, 
        professional_id: user!.id, 
        status: 'active',
        started_at: new Date().toISOString()
      })
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

  const translateSpecialty = (spec: string) => {
    if (spec === 'personal_trainer') return 'Personal Trainer'
    if (spec === 'nutritionist') return 'Nutricionista'
    return 'Profissional'
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2"><User className="text-blue-400" /> Meus Alunos</h1>
            <p className="text-gray-400 text-sm mt-1">Gerencie planos e acompanhe o progresso.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild><Button className="bg-primary text-black hover:bg-primary/80 font-bold"><Plus className="mr-2 h-4 w-4" /> Novo Aluno</Button></DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
              <DialogHeader><DialogTitle>Adicionar Novo Aluno</DialogTitle></DialogHeader>
              <form onSubmit={handleAddClient} className="space-y-4 mt-4">
                <div><Label>Email do Aluno</Label><Input value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="bg-black/20 border-white/10 mt-1.5 text-white" placeholder="email@exemplo.com"/></div>
                <DialogFooter><Button type="submit" disabled={addingClient} className="bg-green-600 text-white hover:bg-green-700 w-full">{addingClient ? <Loader2 className="animate-spin h-4 w-4" /> : 'Vincular'}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- Busca --- */}
        <div className="relative mb-6"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" /><Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/10 text-white"/></div>

        {/* --- Lista de Cards --- */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10 border-dashed"><h3 className="text-lg font-medium text-white">Nenhum aluno encontrado</h3></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((item) => {
              const client = item.client || {}
              
              const hasActiveWorkout = client.client_workouts?.some((w: any) => w.status === 'active')
              const hasActiveMealPlan = client.client_meal_plans?.some((m: any) => m.status === 'active')
              
              // Filtra outros profissionais (exclui o usuário atual)
              const otherProfessionals = client.other_links
                ?.map((link: any) => link.professional)
                .filter((p: any) => p && p.id !== user?.id) || []
              
              const linkedDate = item.started_at ? format(new Date(item.started_at), "dd/MM/yyyy", { locale: ptBR }) : '--/--/----'

              return (
                <Card key={item.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all group flex flex-col h-full shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="border-2 border-white/10 h-12 w-12 flex-shrink-0">
                          <AvatarImage src={client.avatar_url || ''} />
                          <AvatarFallback className="bg-slate-800 text-primary font-bold">{client.full_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <CardTitle className="text-base text-white truncate" title={client.full_name}>{client.full_name || 'Sem nome'}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                             <Badge variant="outline" className="h-5 px-1.5 border-yellow-500/30 text-yellow-400 flex items-center gap-1 text-[10px] whitespace-nowrap"><Trophy className="h-3 w-3"/> Lvl {client.level || 1}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-gray-400 hover:text-white -mr-2 h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white z-50">
                          <DropdownMenuItem onClick={() => navigate(`/app/clients/${client.id}`)} className="hover:bg-white/10 cursor-pointer"><Dumbbell className="mr-2 h-4 w-4" /> Detalhes & Treinos</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/app/chat`)} className="hover:bg-white/10 cursor-pointer"><Mail className="mr-2 h-4 w-4" /> Enviar Mensagem</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveClient(item.id)} className="text-red-400 hover:bg-red-900/20 cursor-pointer"><UserX className="mr-2 h-4 w-4" /> Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col gap-4">
                    {/* Dados de Vinculação */}
                    <div className="space-y-1.5 text-xs text-gray-400">
                      <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 flex-shrink-0" /><span className="truncate">{client.email}</span></div>
                      <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 flex-shrink-0" /><span className="truncate">Vinculado em: {linkedDate}</span></div>
                    </div>

                    {/* Badges de Status */}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className={`text-[10px] border whitespace-nowrap ${hasActiveWorkout ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                        <Dumbbell className="h-3 w-3 mr-1" /> {hasActiveWorkout ? 'Treino Ativo' : 'Sem Treino'}
                      </Badge>
                      <Badge variant="secondary" className={`text-[10px] border whitespace-nowrap ${hasActiveMealPlan ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                        <Utensils className="h-3 w-3 mr-1" /> {hasActiveMealPlan ? 'Dieta Ativa' : 'Sem Dieta'}
                      </Badge>
                    </div>

                    {/* SEÇÃO EQUIPE MULTIDISCIPLINAR */}
                    <div className="mt-auto pt-3 border-t border-white/5">
                      <p className="text-[10px] text-gray-500 mb-2 uppercase font-semibold tracking-wider flex items-center gap-1"><Users className="h-3 w-3"/> Equipe Multidisciplinar</p>
                      
                      {/* Renderização Condicional Inteligente */}
                      {otherProfessionals.length > 0 ? (
                        <TooltipProvider delayDuration={0}>
                          <div className="flex -space-x-2 overflow-hidden pl-1 py-1">
                            {otherProfessionals.map((prof: any) => (
                              <Tooltip key={prof.id}>
                                <TooltipTrigger asChild>
                                  <div className="relative inline-block group/avatar">
                                    <Avatar className="h-8 w-8 rounded-full ring-2 ring-slate-950 cursor-pointer border border-white/10 hover:z-10 transition-transform hover:scale-110 bg-slate-800">
                                      <AvatarImage src={prof.avatar_url || ''} />
                                      <AvatarFallback className="bg-slate-700 text-gray-300 text-[10px]">{prof.full_name?.[0] || 'P'}</AvatarFallback>
                                    </Avatar>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 border-white/10 text-white text-xs z-50 shadow-xl p-2">
                                  <p className="font-bold text-sm mb-0.5">{prof.full_name}</p>
                                  <p className="text-primary text-xs flex items-center gap-1">
                                    <Badge className="h-1.5 w-1.5 rounded-full bg-primary p-0 mr-1" />
                                    {translateSpecialty(prof.details?.specialty)}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </TooltipProvider>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 italic py-1">
                          <Check className="h-3 w-3 text-gray-600"/>
                          <span>Gerenciado apenas por você.</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Botão com a cor do seu print (Roxo/Primary) */}
                    <Button 
                      onClick={() => navigate(`/app/clients/${client.id}`)} 
                      className="w-full mt-2 bg-primary hover:bg-primary/90 text-black font-semibold transition-all shadow-lg shadow-primary/20" 
                    >
                      Gerenciar Aluno
                    </Button>
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