import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

const AppIndex: React.FC = () => {
  const { profile, loading } = useAuth()

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

  // Redirecionamento baseado no role do usuário
  switch (profile?.role) {
    case 'client':
      return <Navigate to="/app/my-workout" replace />
    case 'professional':
    case 'admin':
      return <Navigate to="/app/clients" replace />
    default:
      // Fallback para clientes se role não for reconhecido
      return <Navigate to="/app/my-workout" replace />
  }
}

export default AppIndex