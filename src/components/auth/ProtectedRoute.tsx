import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'professional' | 'client'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, profile, loading } = useAuth()

  console.log('🛡️ [PROTECTED] Estado atual:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    loading, 
    requiredRole,
    userRole: profile?.role,
    userEmail: user?.email
  })

  if (loading) {
    console.log('🛡️ [PROTECTED] Aguardando carregamento...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('🛡️ [PROTECTED] Usuário não autenticado, redirecionando para /auth')
    return <Navigate to="/auth" replace />
  }

  // Verificar role específico se necessário
  if (requiredRole && profile?.role !== requiredRole) {
    console.log('🛡️ [PROTECTED] Role incorreto, redirecionando')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  console.log('🛡️ [PROTECTED] Acesso permitido, renderizando children')
  return <>{children}</>
}