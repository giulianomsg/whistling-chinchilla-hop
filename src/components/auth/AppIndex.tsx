import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

const AppIndex: React.FC = () => {
  const { profile, loading } = useAuth()

  // Loading
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

  // Sem perfil = redirecionar para auth
  if (!profile) {
    return <Navigate to="/auth" replace />
  }

  // Redirecionamento baseado no role
  const redirectPath = profile.role === 'client' ? '/app/my-workout' : '/app/clients'
  
  return <Navigate to={redirectPath} replace />
}

export default AppIndex