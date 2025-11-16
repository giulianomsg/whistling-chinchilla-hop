import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export const AuthRouter: React.FC = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Só executar roteamento quando o loading estiver completo
    if (!loading) {
      if (user) {
        // Se tem usuário, redirecionar para dashboard
        navigate('/dashboard', { replace: true })
      } else {
        // Se não tem usuário, redirecionar para auth
        navigate('/auth', { replace: true })
      }
    }
  }, [user, loading, navigate])

  // Não renderiza nada - é apenas um componente de controle
  return null
}