import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

const AppIndex: React.FC = () => {
  const { profile, loading, user } = useAuth()

  console.log('🏠 [APPINDEX] Estado atual:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    userRole: profile?.role,
    userEmail: user?.email
  })

  if (loading) {
    console.log('🏠 [APPINDEX] Aguardando carregamento...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não há perfil mesmo após loading, redirecionar para auth
  if (!profile) {
    console.log('🏠 [APPINDEX] Perfil não encontrado, redirecionando para /auth')
    return <Navigate to="/auth" replace />
  }

  // Redirecionamento baseado no role do usuário
  let redirectPath = '/app/my-workout' // fallback padrão

  switch (profile.role) {
    case 'client':
      redirectPath = '/app/my-workout'
      console.log('🏠 [APPINDEX] Redirecionando cliente para:', redirectPath)
      break
    case 'professional':
    case 'admin':
      redirectPath = '/app/clients'
      console.log('🏠 [APPINDEX] Redirecionando professional/admin para:', redirectPath)
      break
    default:
      console.log('🏠 [APPINDEX] Role não reconhecido, usando fallback:', redirectPath)
      break
  }

  return <Navigate to={redirectPath} replace />
}

export default AppIndex