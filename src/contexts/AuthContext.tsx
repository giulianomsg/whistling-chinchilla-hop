import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
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

  // Função para buscar perfil do usuário
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log('🔍 [PROFILE] Buscando perfil para userId:', userId)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ [PROFILE] Erro ao buscar perfil:', error)
        throw error
      }

      console.log('✅ [PROFILE] Perfil encontrado:', data)
      return data
    } catch (error) {
      console.error('❌ [PROFILE] Falha na busca do perfil:', error)
      throw error
    }
  }, [])

  // Função para atualizar perfil
  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log('🔄 [PROFILE] Atualizando perfil...')
      try {
        const profileData = await fetchProfile(user.id)
        setProfile(profileData)
      } catch (error) {
        console.error('❌ [PROFILE] Erro ao atualizar perfil:', error)
      }
    }
  }, [user, fetchProfile])

  // Login
  const signIn = async (email: string, password: string) => {
    console.log('🔑 [AUTH] Login:', email)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 [AUTH] Cadastro:', { email, fullName })
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
    console.log('🚪 [AUTH] Logout')
    await supabase.auth.signOut()
  }

  useEffect(() => {
    console.log('🚀 [AUTH] AuthProvider montado')
    let mounted = true

    // Função inicial
    const initialize = async () => {
      console.log('🎯 [AUTH] Iniciando autenticação...')
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('📋 [AUTH] Sessão obtida:', { 
          hasSession: !!session, 
          error: sessionError,
          userEmail: session?.user?.email 
        })
        
        if (sessionError) {
          console.error('❌ [AUTH] Erro ao obter sessão:', sessionError)
        }
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            try {
              const profileData = await fetchProfile(session.user.id)
              setProfile(profileData)
              console.log('📋 [AUTH] Perfil definido:', { 
                hasProfile: !!profileData,
                profileRole: profileData?.role,
                profileEmail: profileData?.email
              })
            } catch (profileError) {
              console.error('❌ [AUTH] Erro ao carregar perfil:', profileError)
              setProfile(null)
            }
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

    // Listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔄 [AUTH] Evento:', { 
          event, 
          hasSession: !!session, 
          userEmail: session?.user?.email 
        })

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              const profileData = await fetchProfile(session.user.id)
              setProfile(profileData)
              console.log('📋 [AUTH] Perfil definido após SIGNED_IN:', { 
                hasProfile: !!profileData,
                profileRole: profileData?.role,
                profileEmail: profileData?.email
              })
            } catch (profileError) {
              console.error('❌ [AUTH] Erro ao carregar perfil após SIGNED_IN:', profileError)
              setProfile(null)
            }
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
  }, [fetchProfile])

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