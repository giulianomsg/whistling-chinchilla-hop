import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldCheck, UserCog, Search } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemSettings } from "@/components/admin/SystemSettings";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns'

interface UserData {
    id: string
    email: string
    full_name: string
    role: 'admin' | 'professional' | 'client'
    created_at: string
    last_sign_in_at: string
}

const AdminUsers: React.FC = () => {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.rpc('get_all_users')
            if (error) throw error
            setUsers(data)
        } catch (error: any) {
            console.error(error)
            showError('Erro ao carregar usuários: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleUpdateRole = async (userId: string, newRole: 'client' | 'professional' | 'admin') => {
        try {
            setActionLoading(userId)
            const { error } = await supabase.rpc('admin_update_user_role', {
                target_user_id: userId,
                new_role: newRole
            })
            if (error) throw error

            showSuccess(`Usuário atualizado para ${newRole === 'admin' ? 'Administrador' : newRole === 'professional' ? 'Profissional' : 'Aluno'}!`)
            fetchUsers()
        } catch (error: any) {
            console.error(error)
            showError('Erro ao atualizar papel: ' + error.message)
        } finally {
            setActionLoading(null)
        }
    }

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="text-primary" /> Painel Administrativo
                </h1>
                <p className="text-muted-foreground">Gestão global do sistema e usuários.</p>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <UserCog className="w-4 h-4" /> Usuários
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Configurações do Sistema
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />
                    </div>

                    <Card className="border-border">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Papel Atual</TableHead>
                                        <TableHead>Cadastro</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{user.full_name || 'Sem nome'}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'professional' ? 'secondary' : 'outline'}>
                                                    {user.role === 'admin' ? 'Administrador' : user.role === 'professional' ? 'Profissional' : 'Aluno'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(new Date(user.created_at), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Client -> Professional */}
                                                    {user.role === 'client' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                                                                onClick={() => handleUpdateRole(user.id, 'professional')}
                                                                disabled={actionLoading === user.id}
                                                            >
                                                                {actionLoading === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCog className="h-3 w-3 mr-1" />}
                                                                Virar Profissional
                                                            </Button>
                                                        </>
                                                    )}

                                                    {/* Professional -> Client */}
                                                    {user.role === 'professional' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-yellow-600/30 text-yellow-600 hover:bg-yellow-600/10"
                                                            onClick={() => handleUpdateRole(user.id, 'client')}
                                                            disabled={actionLoading === user.id}
                                                        >
                                                            {actionLoading === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCog className="h-3 w-3 mr-1" />}
                                                            Voltar para Aluno
                                                        </Button>
                                                    )}

                                                    {/* Any non-admin -> Admin */}
                                                    {user.role !== 'admin' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-purple-600/30 text-purple-600 hover:bg-purple-600/10"
                                                            onClick={() => handleUpdateRole(user.id, 'admin')}
                                                            disabled={actionLoading === user.id}
                                                        >
                                                            {actionLoading === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3 mr-1" />}
                                                            Virar Admin
                                                        </Button>
                                                    )}

                                                    {/* Admin -> Professional (Demote) */}
                                                    {user.role === 'admin' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-600/30 text-red-600 hover:bg-red-600/10"
                                                            onClick={() => handleUpdateRole(user.id, 'professional')}
                                                            disabled={actionLoading === user.id || user.id === currentUser?.id}
                                                        >
                                                            {actionLoading === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCog className="h-3 w-3 mr-1" />}
                                                            Remover Admin
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <SystemSettings />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AdminUsers
