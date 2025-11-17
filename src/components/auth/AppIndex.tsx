import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

const AppIndex: React.FC = () => {
  const { profile, loading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Se ainda está carregando, não faz nada
    if (loading) return

    // Se não há usuário, vai para auth
    if (!user) {
      navigate('/auth', { replace: true })
      return
    }

    // Se não há perfil, vai para auth
    if (!profile) {
      navigate('/auth', { replace: true })
      return
    }

    // Redireciona baseado no role
    let redirectPath = '/app/my-workout' // fallback padrão

    switch (profile.role) {
      case 'client':
        redirectPath = '/app/my-workout'
        break
      case 'professional':
      case 'admin':
        redirectPath = '/app/clients'
        break
      default:
        redirectPath = '/app/my-workout'
        break
    }

    navigate(redirectPath, { replace: true })
  }, [loading, user, profile, navigate])

  // Loading state
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

  // Enquanto redireciona, mostra loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}

export default AppIndex