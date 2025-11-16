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

  // Função para criar perfil local (SEMPRE funciona)
  const createLocalProfile = useCallback((authUser: User): Profile => {
    console.log('🏠 [PROFILE] Criando perfil local para:', authUser.email)
    return {
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name || '',
      role: authUser.user_metadata?.role || 'client',
      avatar_url: null,
      phone: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }, [])

  // Função para buscar perfil com fallback IMEDIATO
  const fetchProfile = useCallback(async (authUser: User): Promise<Profile> => {
    console.log('🔍 [PROFILE] Buscando perfil para userId:', authUser.id)
    
    // SEMPRE retorna um perfil local primeiro
    const localProfile = createLocalProfile(authUser)
    
    // Tenta buscar do Supabase em background (não bloqueia)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          console.log('✅ [PROFILE] Perfil encontrado no Supabase:', data)
          setProfile(data)
        } else {
          console.log('🔄 [PROFILE] Usando perfil local:', error?.message)
          setProfile(localProfile)
        }
      })
      .catch((error) => {
        console.log('❌ [PROFILE] Erro no Supabase, usando local:', error)
        setProfile(localProfile)
      })
    
    // Retorna perfil local IMEDIATAMENTE
    return localProfile
  }, [createLocalProfile])

  // Função para atualizar perfil
  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log('🔄 [PROFILE] Atualizando perfil...')
      const profileData = await fetchProfile(user)
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  // Função para processar usuário e buscar perfil
  const processUserAndProfile = useCallback(async (session: Session | null) => {
    console.log('🔄 [AUTH] Processando usuário e perfil...')
    
    setSession(session)
    setUser(session?.user ?? null)
    
    if (session?.user) {
      console.log('👤 [AUTH] Usuário encontrado, criando perfil...')
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

    // FORÇAR loading = false após 2 segundos MÁXIMO
    const forceTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('⚡ [AUTH] FORÇANDO loading = false (timeout)')
        setLoading(false)
        setInitialized(true)
      }
    }, 2000)

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
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error)
        if (mounted) {
          setLoading(false)
          setInitialized(true)
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

        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          if (mounted) {
            await processUserAndProfile(session)
            setLoading(false)
            setInitialized(true)
          }
        }
      }
    )

    initialize()

    return () => {
      console.log('🧹 [AUTH] AuthProvider desmontado')
      mounted = false
      clearTimeout(forceTimeout)
      subscription.unsubscribe()
    }
  }, [processUserAndProfile]) // ✅ CORREÇÃO: Removido 'loading' do array de dependências

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading: loading && !initialized, // Só fica loading se não estiver inicializado
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