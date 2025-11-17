import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

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
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para buscar perfil - SIMPLIFICADA
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ [AUTH] Erro ao buscar perfil:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ [AUTH] Erro na busca do perfil:', error)
      return null
    }
  }

  // Login
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'client'
        }
      }
    })
    return { error }
  }

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    console.log('🚀 [AUTH] AuthProvider montado')
    let mounted = true

    // Função inicial - SIMPLIFICADA
    const initialize = async () => {
      try {
        // Obter sessão atual
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AUTH] Erro ao obter sessão:', error)
        }
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          // Se há usuário, buscar perfil
          if (session?.user) {
            const profileData = await fetchProfile(session.user.id)
            setProfile(profileData)
            console.log('✅ [AUTH] Perfil carregado:', profileData?.role)
          } else {
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Listener de auth - SIMPLIFICADO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔄 [AUTH] Evento:', event, 'User:', session?.user?.email)

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (event === 'SIGNED_IN' && session?.user) {
            const profileData = await fetchProfile(session.user.id)
            setProfile(profileData)
            console.log('✅ [AUTH] Perfil carregado após SIGNED_IN:', profileData?.role)
          } else if (event === 'SIGNED_OUT') {
            setProfile(null)
          }
        }
      }
    )

    initialize()

    return () => {
      console.log('🧹 [AUTH] AuthProvider desmontado')
      mounted = false
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
    signOut
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