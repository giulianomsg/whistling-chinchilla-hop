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

  // Função para buscar perfil com tratamento robusto de erros
  const fetchProfile = useCallback(async (authUser: User): Promise<Profile | null> => {
    console.log('🔍 [PROFILE] Iniciando busca para userId:', authUser.id)
    
    try {
      // Tentativa 1: Busca direta com timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)

      console.log('📊 [PROFILE] Resultado da busca:', { 
        data, 
        error,
        errorCode: error?.code,
        errorMessage: error?.message
      })

      if (error) {
        console.error('❌ [PROFILE] Erro na busca:', error)
        
        // Se for erro de permissão ou RLS, tentar criar perfil
        if (error.code === 'PGRST116' || error.message?.includes('permission')) {
          console.log('🔧 [PROFILE] Tentando criar perfil...')
          
          try {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
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
              
              // Fallback: criar perfil mock local
              console.log('🔄 [PROFILE] Usando fallback local...')
              const fallbackProfile: Profile = {
                id: authUser.id,
                email: authUser.email || '',
                full_name: authUser.user_metadata?.full_name || '',
                role: authUser.user_metadata?.role || 'client',
                avatar_url: null,
                phone: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              
              console.log('✅ [PROFILE] Perfil fallback criado:', fallbackProfile)
              return fallbackProfile
            }
            
            return newProfile
          } catch (createError) {
            console.error('❌ [PROFILE] Erro ao criar perfil:', createError)
            
            // Fallback final
            const fallbackProfile: Profile = {
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || '',
              role: authUser.user_metadata?.role || 'client',
              avatar_url: null,
              phone: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            return fallbackProfile
          }
        }
        
        return null
      }

      return data
    } catch (error) {
      console.error('❌ [PROFILE] Erro inesperado:', error)
      
      // Fallback em caso de erro de conexão
      if (authUser) {
        console.log('🔄 [PROFILE] Usando fallback devido a erro de conexão...')
        const fallbackProfile: Profile = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || '',
          role: authUser.user_metadata?.role || 'client',
          avatar_url: null,
          phone: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        return fallbackProfile
      }
      
      return null
    }
  }, [])

  // Função para atualizar perfil
  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log('🔄 [PROFILE] Atualizando perfil...')
      const profileData = await fetchProfile(user)
      setProfile(profileData)
      console.log('📋 [PROFILE] Perfil atualizado:', !!profileData)
    }
  }, [user, fetchProfile])

  // Função para processar usuário e buscar perfil
  const processUserAndProfile = useCallback(async (session: Session | null) => {
    console.log('🔄 [AUTH] Processando usuário e perfil...')
    
    setSession(session)
    setUser(session?.user ?? null)
    
    if (session?.user) {
      console.log('👤 [AUTH] Buscando perfil para:', session.user.email)
      const profileData = await fetchProfile(session.user)
      setProfile(profileData)
      console.log('📋 [AUTH] Perfil definido:', { 
        hasProfile: !!profileData,
        profileRole: profileData?.role,
        profileEmail: profileData?.email
      })
    } else {
      console.log('❌ [AUTH] Nenhum usuário na sessão')
      setProfile(null)
    }
  }, [fetchProfile])

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

    // Função inicial com timeout
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
          await processUserAndProfile(session)
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error)
      } finally {
        if (mounted) {
          console.log('✅ [AUTH] Inicialização concluída')
          setLoading(false)
        }
      }
    }

    // Listener de auth com tratamento de erro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔄 [AUTH] Evento:', { 
          event, 
          hasSession: !!session, 
          userEmail: session?.user?.email 
        })

        try {
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            if (mounted) {
              await processUserAndProfile(session)
            }
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro no processamento do evento:', error)
        }
      }
    )

    initialize()

    return () => {
      console.log('🧹 [AUTH] AuthProvider desmontado')
      mounted = false
      subscription.unsubscribe()
    }
  }, [processUserAndProfile])

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