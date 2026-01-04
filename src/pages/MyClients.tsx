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

import { ExpandableImage } from '@/components/ui/expandable-image'


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
            id, full_name, email, phone, avatar_url, cover_url, level,
            client_workouts:client_workouts!client_id(id, status),
            client_meal_plans:client_meal_plans!client_id(id, status),
            other_links:client_professionals!client_id(
              professional:profiles!professional_id(
                id, full_name, avatar_url, role,
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
      const { error } = await supabase.rpc('link_client_via_email', {
        client_email: newClientEmail.trim()
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

  // Tradução de Especialidade (Simplificada)
  const getSpecialtyLabel = (spec: string | any) => {
    if (typeof spec !== 'string') return 'Profissional';
    const map: Record<string, string> = {
      'personal_trainer': 'Personal',
      'nutritionist': 'Nutri',
      'sports_doctor': 'Médico',
      'performance_coach': 'Coach',
      'clinic': 'Clínica'
    };
    return map[spec] || 'Prof.';
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2"><User className="text-blue-500" /> Meus Alunos</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie planos e acompanhe o progresso.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild><Button className="bg-primary text-primary-foreground hover:bg-primary/80 font-bold"><Plus className="mr-2 h-4 w-4" /> Novo Aluno</Button></DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                <div className="text-sm text-muted-foreground mb-4">
                  Digite o email do aluno para vinculá-lo à sua conta.
                </div>
              </DialogHeader>
              <form onSubmit={handleAddClient} className="space-y-4 mt-4">
                <div><Label>Email do Aluno</Label><Input value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="bg-muted border-border mt-1.5 text-foreground" placeholder="email@exemplo.com" /></div>
                <DialogFooter><Button type="submit" disabled={addingClient} className="bg-green-600 text-white hover:bg-green-700 w-full">{addingClient ? <Loader2 className="animate-spin h-4 w-4" /> : 'Vincular'}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- Busca --- */}
        <div className="relative mb-6"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-card border-border text-foreground" /></div>

        {/* --- Lista de Cards --- */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed"><h3 className="text-lg font-medium text-foreground">Nenhum aluno encontrado</h3></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map((item) => {
              const client = item.client || {}
              const hasActiveWorkout = client.client_workouts?.some((w: any) => w.status === 'active')
              const hasActiveMealPlan = client.client_meal_plans?.some((m: any) => m.status === 'active')

              // Filter other professionals
              const otherProfessionals = client.other_links
                ?.map((link: any) => link.professional)
                .filter((p: any) => p && p.id !== user?.id) || []

              const linkedDate = item.started_at ? format(new Date(item.started_at), "d MMM, yyyy", { locale: ptBR }) : '--'

              return (
                <Card key={item.id} className="border-border hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col group h-full shadow-lg bg-card">
                  {/* Cover Image */}
                  <div className="h-28 w-full bg-muted relative">
                    <ExpandableImage
                      src={client.cover_url}
                      alt="Capa"
                      type="cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border z-50">
                          <DropdownMenuItem onClick={() => handleRemoveClient(item.id)} className="text-destructive focus:text-destructive cursor-pointer"><UserX className="mr-2 h-4 w-4" /> Desvincular Aluno</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CardContent className="pt-0 relative flex-1 flex flex-col px-5 pb-5">
                    {/* Avatar overlapping */}
                    <div className="-mt-12 mb-3 flex justify-between items-end">
                      <ExpandableImage
                        src={client.avatar_url}
                        alt={client.full_name}
                        type="avatar"
                        className="h-24 w-24 border-4 border-card bg-card shadow-md rounded-full"
                      />
                      {client.level && (
                        <Badge className="mb-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20 gap-1 hidden sm:flex">
                          <Trophy className="h-3 w-3" /> Lvl {client.level}
                        </Badge>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-foreground leading-tight truncate" title={client.full_name}>{client.full_name || 'Aluno Sem Nome'}</h3>
                      <p className="text-sm text-muted-foreground truncate">{client.email}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className={`text-[10px] px-2 h-6 ${hasActiveWorkout ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' : 'opacity-50'}`}>
                          <Dumbbell className="h-3 w-3 mr-1" /> {hasActiveWorkout ? 'Treino OK' : 'Sem Treino'}
                        </Badge>
                        <Badge variant="secondary" className={`text-[10px] px-2 h-6 ${hasActiveMealPlan ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' : 'opacity-50'}`}>
                          <Utensils className="h-3 w-3 mr-1" /> {hasActiveMealPlan ? 'Dieta OK' : 'Sem Dieta'}
                        </Badge>
                      </div>
                    </div>

                    {/* Equipe Multidisciplinar (Miniaturas) */}
                    <div className="mt-auto pt-4 border-t border-border">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1">
                        <Users className="h-3 w-3" /> Equipe ({otherProfessionals.length + 1})
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2 pl-1">
                          {/* Self */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative z-20 hover:z-30 transition-all cursor-default">
                                  <Avatar className="h-8 w-8 ring-2 ring-background border border-border">
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">EU</AvatarFallback>
                                  </Avatar>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">Você</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Others */}
                          {otherProfessionals.slice(0, 4).map((prof: any) => (
                            <TooltipProvider key={prof.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative hover:z-30 transition-all">
                                    <ExpandableImage
                                      src={prof.avatar_url}
                                      alt={prof.full_name}
                                      type="avatar"
                                      className="h-8 w-8 ring-2 ring-background border border-border rounded-full"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  <div className="font-bold">{prof.full_name}</div>
                                  <div className="text-[10px] opacity-80">{getSpecialtyLabel(prof.details?.specialty?.[0])}</div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          {otherProfessionals.length > 4 && (
                            <div className="h-8 w-8 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              +{otherProfessionals.length - 4}
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] text-muted-foreground ml-auto bg-muted/50 px-2 py-1 rounded-md">Desde {linkedDate}</span>
                      </div>

                      <Button
                        onClick={() => navigate(`/app/clients/${client.id}`)}
                        className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:shadow-md transition-all font-semibold"
                      >
                        Gerenciar Aluno
                      </Button>
                    </div>
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