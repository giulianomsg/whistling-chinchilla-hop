import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/client'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para buscar perfil
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    console.log('🔍 Buscando perfil para:', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('❌ Erro ao buscar perfil:', error)
        if (error.code === 'PGRST116') {
          console.log('🔧 Criando perfil...')
          const { data: userData } = await supabase.auth.getUser(userId)
          if (userData.user) {
            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email || '',
                full_name: userData.user.user_metadata?.full_name || '',
                role: userData.user.user_metadata?.role || 'client'
              })
              .select()
              .single()
            console.log('✅ Perfil criado:', newProfile)
            return newProfile
          }
        }
        return null
      }
      console.log('✅ Perfil encontrado:', data)
      return data
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      return null
    }
  }

  // Função para atualizar perfil
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
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
    console.log('🚀 AuthProvider montado')
    let mounted = true
    let initialized = false

    // Timeout de segurança
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialized) {
        console.log('⚠️ TIMEOUT: Forçando loading = false')
        setLoading(false)
      }
    }, 3000)

    // Função inicial
    const initialize = async () => {
      console.log('🎯 Iniciando autenticação...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📋 Sessão obtida:', !!session)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            console.log('👤 Usuário encontrado, buscando perfil...')
            const profileData = await fetchProfile(session.user.id)
            if (mounted) {
              setProfile(profileData)
              console.log('📋 Perfil definido:', !!profileData)
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error)
      } finally {
        if (mounted) {
          console.log('✅ Inicialização concluída')
          initialized = true
          setLoading(false)
        }
      }
    }

    // Listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔄 Auth event:', event, !!session)

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👤 Login detectado, buscando perfil...')
          const profileData = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
            console.log('📋 Perfil definido após login:', !!profileData)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 Logout detectado')
          setProfile(null)
        }

        if (!initialized) {
          initialized = true
          setLoading(false)
        }
      }
    )

    initialize()

    return () => {
      console.log('🧹 AuthProvider desmontado')
      mounted = false
      clearTimeout(safetyTimeout)
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