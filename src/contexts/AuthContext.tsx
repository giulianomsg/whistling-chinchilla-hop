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

  // Função para buscar perfil com diagnóstico completo
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    console.log('🔍 [PROFILE] Iniciando busca para userId:', userId)
    
    try {
      // 1. Verificar se o usuário está autenticado
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(userId)
      console.log('🔐 [PROFILE] Verificação de autenticação:', { 
        hasUser: !!authUser, 
        error: authError,
        userEmail: authUser?.email 
      })
      
      if (authError || !authUser) {
        console.error('❌ [PROFILE] Usuário não autenticado:', authError)
        return null
      }

      // 2. Tentar buscar o perfil
      console.log('📋 [PROFILE] Buscando perfil na tabela...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('📊 [PROFILE] Resultado da busca:', { 
        data, 
        error,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details
      })

      if (error) {
        console.error('❌ [PROFILE] Erro na busca:', error)
        
        if (error.code === 'PGRST116') {
          console.log('🔧 [PROFILE] Perfil não encontrado, tentando criar...')
          
          // 3. Tentar criar o perfil
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || '',
              role: authUser.user_metadata?.role || 'client'
            })
            .select()
            .single()

          console.log('🆕 [PROFILE] Resultado da criação:', { 
            data: newProfile, 
            error: insertError,
            errorCode: insertError?.code,
            errorMessage: insertError?.message
          })

          if (insertError) {
            console.error('❌ [PROFILE] Erro ao criar perfil:', insertError)
            return null
          }
          
          console.log('✅ [PROFILE] Perfil criado com sucesso:', newProfile)
          return newProfile
        }
        
        return null
      }

      console.log('✅ [PROFILE] Perfil encontrado com sucesso:', data)
      return data
    } catch (error) {
      console.error('❌ [PROFILE] Erro inesperado:', error)
      return null
    }
  }

  // Função para atualizar perfil
  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 [PROFILE] Atualizando perfil manualmente...')
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
      console.log('📋 [PROFILE] Perfil atualizado:', !!profileData)
    }
  }

  // Login
  const signIn = async (email: string, password: string) => {
    console.log('🔑 [AUTH] Iniciando login:', email)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('📊 [AUTH] Resultado do login:', { error })
    return { error }
  }

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 [AUTH] Iniciando cadastro:', { email, fullName })
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
    console.log('📊 [AUTH] Resultado do cadastro:', { error })
    return { error }
  }

  // Logout
  const signOut = async () => {
    console.log('🚪 [AUTH] Iniciando logout')
    await supabase.auth.signOut()
  }

  useEffect(() => {
    console.log('🚀 [AUTH] AuthProvider montado')
    let mounted = true
    let initialized = false

    // Timeout de segurança aumentado para profile
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialized) {
        console.log('⚠️ [AUTH] TIMEOUT: Forçando loading = false (profile pode não estar carregado)')
        setLoading(false)
      }
    }, 5000)

    // Função inicial
    const initialize = async () => {
      console.log('🎯 [AUTH] Iniciando autenticação...')
      
      try {
        // 1. Obter sessão
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
          
          // 2. Se tem usuário, buscar perfil
          if (session?.user) {
            console.log('👤 [AUTH] Usuário encontrado, buscando perfil...')
            const profileData = await fetchProfile(session.user.id)
            
            if (mounted) {
              setProfile(profileData)
              console.log('📋 [AUTH] Perfil definido:', { 
                hasProfile: !!profileData,
                profileRole: profileData?.role,
                profileEmail: profileData?.email
              })
            }
          } else {
            console.log('❌ [AUTH] Nenhum usuário na sessão')
          }
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error)
      } finally {
        if (mounted) {
          console.log('✅ [AUTH] Inicialização concluída')
          initialized = true
          setLoading(false)
        }
      }
    }

    // Listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔄 [AUTH] Evento de auth:', { 
          event, 
          hasSession: !!session, 
          userEmail: session?.user?.email 
        })

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👤 [AUTH] Login detectado, buscando perfil...')
          const profileData = await fetchProfile(session.user.id)
          
          if (mounted) {
            setProfile(profileData)
            console.log('📋 [AUTH] Perfil definido após login:', { 
              hasProfile: !!profileData,
              profileRole: profileData?.role 
            })
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 [AUTH] Logout detectado')
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
      console.log('🧹 [AUTH] AuthProvider desmontado')
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