import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

// Tipagem do Perfil
type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'admin' | 'professional' | 'client'
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string, role?: 'client' | 'professional') => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Funções de Auth
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'client' | 'professional' = 'client') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } }
    })
    return { error }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      // Force local cleanup
      setUser(null)
      setProfile(null)
      setSession(null)
      localStorage.removeItem('sb-mhjvgxukttoalvwntmyp-auth-token') // Optional: Clear Supabase token if needed
    }
  }

  // Buscar perfil de forma simples e assíncrona
  const refreshProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data && !error) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    }
  }

  // useEffect principal - simplificado ao máximo
  useEffect(() => {
    console.log('🚀 [AUTH] AuthProvider montado')

    // Listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 [AUTH] Evento: ${event}`, 'User:', session?.user?.email)

        setSession(session)
        setUser(session?.user ?? null)

        // Se tem usuário, buscar perfil de forma assíncrona
        if (session?.user) {
          // Criar perfil básico a partir do usuário auth
          const basicProfile: Profile = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            phone: session.user.user_metadata?.phone || null,
            role: session.user.user_metadata?.role || 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          // 🔍 DEBUGGING DETALHADO
          console.log('🔍 [AUTH] Dados do usuário auth:', {
            email: session.user.email,
            metadata_role: session.user.user_metadata?.role,
            metadata_full_name: session.user.user_metadata?.full_name,
            basic_profile_role: basicProfile.role
          })

          setProfile(basicProfile)

          // Tentar buscar perfil completo em background
          refreshProfile()
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}