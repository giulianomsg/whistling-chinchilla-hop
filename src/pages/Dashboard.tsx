import React from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Mail, Shield } from 'lucide-react'
import { AuthDebug } from '@/components/debug/AuthDebug'

const DashboardPage: React.FC = () => {
  const { user, profile, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  // ✅ PROTEÇÃO CONTRA NULL
  const getDisplayName = () => {
    return profile?.full_name || 'Usuário'
  }

  const getRoleDisplay = () => {
    return profile?.role || 'carregando...'
  }

  return (
    <ProtectedRoute>
      <AuthDebug />
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Bem-vindo ao seu painel!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Card de Informações do Usuário */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5" />
                  Informações do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium text-foreground">{user?.email || 'carregando...'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <span className="text-sm font-medium capitalize text-foreground">{getRoleDisplay()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Nome:</span>
                  <span className="text-sm font-medium text-foreground">{getDisplayName()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Card de Ações */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Ações</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Card de Status do Sistema */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Autenticação:</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">✅ Ativa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Perfil:</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">✅ Carregado</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Conexão Supabase:</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">✅ Estabelecida</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Roteamento Automático:</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">✅ Ativo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default DashboardPage