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

// 🔍 ANALISADOR DE ESTADO DE AUTENTICAÇÃO
class AuthStateAnalyzer {
  private static instance: AuthStateAnalyzer
  private startTime: number = Date.now()
  private events: Array<{timestamp: number, event: string, data: any}> = []

  static getInstance(): AuthStateAnalyzer {
    if (!AuthStateAnalyzer.instance) {
      AuthStateAnalyzer.instance = new AuthStateAnalyzer()
    }
    return AuthStateAnalyzer.instance
  }

  log(event: string, data: any = {}) {
    const timestamp = Date.now()
    const elapsed = timestamp - this.startTime
    
    this.events.push({ timestamp, event, data })
    
    console.group(`🔍 [${elapsed}ms] ${event}`)
    console.log('Data:', data)
    console.log('Estado atual:', this.getCurrentState())
    console.groupEnd()
  }

  getCurrentState() {
    return {
      elapsed: Date.now() - this.startTime,
      totalEvents: this.events.length,
      recentEvents: this.events.slice(-5)
    }
  }

  checkLoadingState(loading: boolean, user: User | null, profile: Profile | null) {
    const elapsed = Date.now() - this.startTime
    
    console.group('🔍 ANÁLISE DE ESTADO DE LOADING')
    console.log('⏱️ Tempo decorrido:', elapsed + 'ms')
    console.log('🔄 Loading:', loading)
    console.log('👤 User:', user ? `${user.email} (ID: ${user.id})` : 'null')
    console.log('📋 Profile:', profile ? `${profile.role} - ${profile.full_name}` : 'null')
    
    // Análises específicas
    if (loading && elapsed > 5000) {
      console.error('🚨 PROBLEMA: Loading por mais de 5 segundos!')
      console.log('📊 Últimos eventos:', this.events.slice(-10))
    }
    
    if (!loading && !user) {
      console.warn('⚠️ Loading terminou mas não há usuário')
    }
    
    if (!loading && user && !profile) {
      console.error('🚨 PROBLEMA CRÍTICO: Loading terminou, usuário existe, mas perfil é null!')
      console.log('👤 User ID:', user.id)
      console.log('📊 Últimos eventos:', this.events.slice(-10))
    }
    
    if (!loading && user && profile) {
      console.log('✅ ESTADO PERFEITO: Loading terminou, usuário e perfil carregados')
      console.log('🎯 Role:', profile.role)
    }
    
    console.groupEnd()
  }

  reset() {
    this.startTime = Date.now()
    this.events = []
    console.log('🔄 Analisador resetado')
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  const analyzer = AuthStateAnalyzer.getInstance()

  // Função para buscar o perfil do usuário
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    analyzer.log('🔍 INICIANDO BUSCA DE PERFIL', { userId })
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        analyzer.log('❌ ERRO NA BUSCA DE PERFIL', { error: error.message, code: error.code })
        console.error('Erro ao buscar perfil:', error)
        
        // Se perfil não existe, tenta criar um básico
        if (error.code === 'PGRST116') {
          analyzer.log('🔧 PERFIL NÃO ENCONTRADO, TENTANDO CRIAR', { userId })
          console.log('Perfil não encontrado, tentando criar...')
          
          const { data: userData } = await supabase.auth.getUser(userId)
          
          if (userData.user) {
            analyzer.log('👤 DADOS DO USUÁRIO OBTIDOS', { 
              email: userData.user.email,
              metadata: userData.user.user_metadata 
            })
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email || '',
                full_name: userData.user.user_metadata?.full_name || '',
                role: userData.user.user_metadata?.role || 'client'
              })
              .select()
              .single()
            
            if (insertError) {
              analyzer.log('❌ ERRO AO CRIAR PERFIL', { error: insertError.message })
              console.error('Erro ao criar perfil:', insertError)
              return null
            }
            
            analyzer.log('✅ PERFIL CRIADO COM SUCESSO', { profile: newProfile })
            console.log('Perfil criado com sucesso:', newProfile)
            return newProfile
          }
        }
        
        return null
      }

      analyzer.log('✅ PERFIL ENCONTRADO', { profile: data })
      return data
    } catch (error) {
      analyzer.log('❌ ERRO INESPERADO NA BUSCA', { error })
      console.error('Erro inesperado ao buscar perfil:', error)
      return null
    }
  }, [analyzer])

  // Função para atualizar o perfil
  const refreshProfile = useCallback(async () => {
    if (user && !profileLoading) {
      setProfileLoading(true)
      analyzer.log('🔄 ATUALIZANDO PERFIL MANUALMENTE', { userId: user.id })
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
      analyzer.log('📋 PERFIL ATUALIZADO', { profile: profileData })
      setProfileLoading(false)
    }
  }, [user, profileLoading, fetchProfile, analyzer])

  // Login
  const signIn = async (email: string, password: string) => {
    analyzer.log('🔑 INICIANDO LOGIN', { email })
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        analyzer.log('❌ ERRO NO LOGIN', { error: error.message })
      } else {
        analyzer.log('✅ LOGIN INICIADO COM SUCESSO')
      }
      
      return { error }
    } catch (error) {
      analyzer.log('❌ ERRO INESPERADO NO LOGIN', { error })
      return { error }
    }
  }

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string) => {
    analyzer.log('📝 INICIANDO CADASTRO', { email, fullName })
    try {
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
      
      if (error) {
        analyzer.log('❌ ERRO NO CADASTRO', { error: error.message })
      } else {
        analyzer.log('✅ CADASTRO INICIADO COM SUCESSO')
      }
      
      return { error }
    } catch (error) {
      analyzer.log('❌ ERRO INESPERADO NO CADASTRO', { error })
      return { error }
    }
  }

  // Logout
  const signOut = async () => {
    analyzer.log('🚪 INICIANDO LOGOUT')
    await supabase.auth.signOut()
  }

  // Monitor de estado
  useEffect(() => {
    analyzer.checkLoadingState(loading, user, profile)
  }, [loading, user, profile, analyzer])

  useEffect(() => {
    analyzer.log('🚀 AUTH PROVIDER MONTADO')
    analyzer.reset() // Resetar analisador

    // Listener único para todos os eventos de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        analyzer.log('🔄 EVENTO DE AUTH', { event, hasSession: !!session, email: session?.user?.email })
        
        // Sempre atualiza session e user primeiro
        setSession(session)
        setUser(session?.user ?? null)
        
        // Depois trata o perfil baseado no evento
        if (event === 'SIGNED_IN' && session) {
          analyzer.log('👤 USUÁRIO FEZ LOGIN', { userId: session.user.id })
          console.log('Usuário fez login, buscando perfil...')
          setProfileLoading(true)
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
          setProfileLoading(false)
          if (profileData) {
            analyzer.log('✅ PERFIL CARREGADO APÓS LOGIN', { role: profileData.role })
            console.log('Perfil carregado:', profileData.role)
          } else {
            analyzer.log('❌ PERFIL NÃO CARREGADO APÓS LOGIN')
          }
        } else if (event === 'SIGNED_OUT') {
          analyzer.log('🚪 USUÁRIO FEZ LOGOUT')
          console.log('Usuário fez logout, limpando perfil...')
          setProfile(null)
        } else if (event === 'INITIAL_SESSION') {
          analyzer.log('🔍 SESSÃO INICIAL CARREGADA', { hasSession: !!session })
          console.log('Sessão inicial carregada, buscando perfil...')
          if (session) {
            setProfileLoading(true)
            const profileData = await fetchProfile(session.user.id)
            setProfile(profileData)
            setProfileLoading(false)
            if (profileData) {
              analyzer.log('✅ PERFIL INICIAL CARREGADO', { role: profileData.role })
              console.log('Perfil inicial carregado:', profileData.role)
            } else {
              analyzer.log('❌ PERFIL INICIAL NÃO CARREGADO')
            }
          }
        } else if (event === 'TOKEN_REFRESHED') {
          analyzer.log('🔄 TOKEN REFRESHED')
        }
        
        // Finaliza o loading após processar
        setLoading(false)
        analyzer.log('⏹️ LOADING FINALIZADO')
      }
    )

    // Dispara o listener manualmente para obter a sessão inicial
    const initializeAuth = async () => {
      analyzer.log('🎯 INICIANDO AUTENTICAÇÃO')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        analyzer.log('📋 SESSÃO OBTIDA', { hasSession: !!session, email: session?.user?.email })
        
        // Simula o evento INITIAL_SESSION
        if (session) {
          setSession(session)
          setUser(session.user)
          analyzer.log('✅ SESSÃO CONFIGURADA', { userId: session.user.id })
          console.log('Sessão inicial encontrada:', session.user.email)
          
          setProfileLoading(true)
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
          setProfileLoading(false)
          if (profileData) {
            analyzer.log('✅ PERFIL INICIAL CARREGADO', { role: profileData.role })
            console.log('Perfil inicial carregado:', profileData.role)
          } else {
            analyzer.log('❌ PERFIL INICIAL NÃO CARREGADO')
          }
        } else {
          analyzer.log('❌ NENHUMA SESSÃO INICIAL ENCONTRADA')
          console.log('Nenhuma sessão inicial encontrada')
        }
      } catch (error) {
        analyzer.log('❌ ERRO NA INICIALIZAÇÃO', { error })
        console.error('Erro na inicialização da auth:', error)
      } finally {
        setLoading(false)
        analyzer.log('⏹️ LOADING FINALIZADO (INIT)')
      }
    }
    
    initializeAuth()

    // Limpeza
    return () => {
      analyzer.log('🧹 LIMPANDO SUBSCRIPTION')
      subscription.unsubscribe()
    }
  }, [fetchProfile, analyzer])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading: loading || profileLoading, // Loading geral + loading do perfil
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