import React from 'react'
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

  // Loading state - simplificado sem isReady
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Usuário não autenticado - retorna null para deixar o App.tsx tratar
  if (!user) {
    return null
  }

  // Verificação de role específica - retorna null para deixar o App.tsx tratar
  if (requiredRole && profile?.role !== requiredRole) {
    return null
  }

  // Tudo certo, renderizar children
  return <>{children}</>
}