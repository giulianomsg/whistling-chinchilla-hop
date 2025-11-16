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
  const [initialized, setInitialized] = useState(false)

  // Função para buscar perfil com diagnóstico RLS completo
  const fetchProfile = useCallback(async (authUser: User): Promise<Profile | null> => {
    console.log('🔍 [PROFILE] Iniciando busca para userId:', authUser.id)
    console.log('🔐 [PROFILE] Token JWT disponível:', !!authUser.aud)
    
    try {
      // 1. Testar conexão básica primeiro
      console.log('🧪 [PROFILE] Testando conexão com Supabase...')
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      console.log('🧪 [PROFILE] Teste de conexão:', { 
        data: testData, 
        error: testError,
        hasError: !!testError,
        errorCode: testError?.code,
        errorMessage: testError?.message
      })

      if (testError) {
        console.error('❌ [PROFILE] Erro de conexão/teste:', testError)
        return null
      }

      // 2. Tentar buscar o perfil específico
      console.log('📋 [PROFILE] Buscando perfil específico...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      console.log('📊 [PROFILE] Resultado da busca:', { 
        data, 
        error,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details,
        hint: error?.hint
      })

      if (error) {
        console.error('❌ [PROFILE] Erro na busca:', error)
        
        // 3. Tentar buscar sem RLS (se possível)
        console.log('🔓 [PROFILE] Tentando buscar sem filtro RLS...')
        const { data: allData, error: allError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5)

        console.log('🔓 [PROFILE] Busca sem filtro:', { 
          data: allData, 
          error: allError,
          hasData: !!allData?.length,
          totalRows: allData?.length
        })

        if (error.code === 'PGRST116') {
          console.log('🔧 [PROFILE] Perfil não encontrado, tentando criar...')
          
          // 4. Tentar criar o perfil
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
  }, [])

  // Função para atualizar perfil
  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log('🔄 [PROFILE] Atualizando perfil manualmente...')
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
      console.log('👤 [AUTH] Usuário encontrado, buscando perfil...')
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

    // Timeout de segurança
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialized) {
        console.log('⚠️ [AUTH] TIMEOUT: Forçando loading = false')
        setLoading(false)
      }
    }, 5000)

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
          await processUserAndProfile(session)
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error)
      } finally {
        if (mounted) {
          console.log('✅ [AUTH] Inicialização concluída')
          setInitialized(true)
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

        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          if (mounted) {
            await processUserAndProfile(session)
          }
        }

        if (!initialized) {
          setInitialized(true)
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
  }, [initialized, processUserAndProfile])

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