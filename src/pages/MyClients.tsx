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
  Calendar, Loader2, Dumbbell, UserX, User
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
  
  // Estado para Adicionar Novo Aluno
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClientEmail, setNewClientEmail] = useState('')
  const [addingClient, setAddingClient] = useState(false)

  const fetchClients = async () => {
    if (!user) return
    try {
      setLoading(true)
      // Busca a relação e faz o join com a tabela profiles (alias: client)
      const { data, error } = await supabase
        .from('client_professionals')
        .select(`
          id,
          status,
          client:profiles!client_id (
            id,
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('professional_id', user.id)
        .eq('status', 'active')
      
      if (error) throw error
      
      // Filtra entradas onde o perfil do cliente pode ser null devido a RLS antiga
      const validClients = (data || []).filter(item => item.client !== null)
      setClients(validClients)
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
      showError('Não foi possível carregar a lista de alunos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) fetchClients()
  }, [user, authLoading])

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientEmail.trim()) return

    setAddingClient(true)
    try {
      // 1. Buscar ID do cliente pelo email (Usando a RPC function para segurança ou query direta se RLS permitir)
      const { data: foundUser, error: searchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newClientEmail.trim())
        .eq('role', 'client')
        .maybeSingle()

      if (searchError || !foundUser) {
        throw new Error('Aluno não encontrado. Verifique o email ou se ele já se cadastrou como "Aluno".')
      }

      // 2. Criar Vínculo via RPC (Recomendado conforme seu SQL) ou Insert direto
      // Vamos tentar insert direto primeiro, se falhar usamos a RPC
      const { error: linkError } = await supabase
        .from('client_professionals')
        .insert({
          client_id: foundUser.id,
          professional_id: user!.id,
          status: 'active'
        })

      if (linkError) {
        if (linkError.code === '23505') throw new Error('Este aluno já está vinculado a você.')
        throw linkError
      }

      showSuccess('Aluno vinculado com sucesso!')
      setNewClientEmail('')
      setIsAddDialogOpen(false)
      fetchClients()

    } catch (error: any) {
      showError(error.message || 'Erro ao adicionar aluno')
    } finally {
      setAddingClient(false)
    }
  }

  const handleRemoveClient = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('client_professionals')
        .update({ status: 'inactive' })
        .eq('id', linkId)

      if (error) throw error
      showSuccess('Aluno removido.')
      fetchClients()
    } catch (error) {
      showError('Erro ao remover aluno.')
    }
  }

  // Filtragem local
  const filteredClients = clients.filter(item => {
    const name = item.client?.full_name?.toLowerCase() || ''
    const email = item.client?.email?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return name.includes(search) || email.includes(search)
  })

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <User className="text-blue-400" /> Meus Alunos
            </h1>
            <p className="text-gray-400">Gerencie seus alunos e acompanhe o progresso.</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-black hover:bg-primary/80 font-bold">
                <Plus className="mr-2 h-4 w-4" /> Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Aluno</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddClient} className="space-y-4 mt-4">
                <div>
                  <Label>Email do Aluno</Label>
                  <Input 
                    placeholder="exemplo@email.com" 
                    value={newClientEmail}
                    onChange={e => setNewClientEmail(e.target.value)}
                    className="bg-black/20 border-white/10 mt-1.5 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    O aluno já deve ter criado uma conta no CapiFit com a função "Aluno".
                  </p>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addingClient} className="bg-green-600 text-white hover:bg-green-700 w-full">
                    {addingClient ? <Loader2 className="animate-spin h-4 w-4" /> : 'Vincular Aluno'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Buscar por nome ou email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Lista de Clientes */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10 border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white">Nenhum aluno encontrado</h3>
            <p className="text-gray-400 mt-1 mb-4">Adicione alunos pelo email para começar.</p>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="border-white/10 text-white hover:bg-white/10">
              Adicionar Aluno
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((item) => {
              // PROTEÇÃO CONTRA CRASH: Optional Chaining e valores padrão
              const clientData = item.client || {}
              const initials = clientData.full_name ? clientData.full_name[0].toUpperCase() : clientData.email?.[0].toUpperCase() || '?'

              return (
                <Card key={item.id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="border-2 border-white/10">
                          {/* AQUI ESTAVA O ERRO: item.client.avatar_url quebrava se client fosse null */}
                          <AvatarImage src={clientData.avatar_url || ''} />
                          <AvatarFallback className="bg-slate-800 text-primary font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base text-white truncate max-w-[150px]">
                            {clientData.full_name || 'Sem nome'}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Badge variant="secondary" className="h-5 px-1.5 bg-green-500/10 text-green-400 border-none">Ativo</Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white -mr-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white">
                          <DropdownMenuItem onClick={() => navigate(`/app/clients/${clientData.id}`)} className="hover:bg-white/10 cursor-pointer">
                            <Dumbbell className="mr-2 h-4 w-4" /> Ver Treinos
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/app/chat`)} className="hover:bg-white/10 cursor-pointer">
                            <Mail className="mr-2 h-4 w-4" /> Enviar Mensagem
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveClient(item.id)} className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer">
                            <UserX className="mr-2 h-4 w-4" /> Remover Aluno
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{clientData.email}</span>
                      </div>
                      {clientData.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{clientData.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => navigate(`/app/clients/${clientData.id}`)} 
                      className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-primary" 
                      variant="ghost"
                    >
                      Gerenciar
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