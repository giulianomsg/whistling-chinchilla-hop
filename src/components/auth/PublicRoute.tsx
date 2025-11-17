import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface PublicRouteProps {
  children: React.ReactNode
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  // Loading state - simplificado sem isReady
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se usuário está autenticado, retorna null para deixar o App.tsx tratar
  if (user) {
    return null
  }

  // Renderizar children se não está autenticado
  return <>{children}</>
}