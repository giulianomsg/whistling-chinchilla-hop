import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
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

// 🏗️ ESTADO IMUTÁVEL E CENTRALIZADO
interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

// 🔧 GERENCIADOR DE ESTADO COM CONTROLE DE CONCORRÊNCIA
class AuthStateManager {
  private state: AuthState
  private listeners: Array<(state: AuthState) => void> = []
  private processingRef = new Set<string>()
  private subscription: any = null

  constructor() {
    this.state = {
      user: null,
      profile: null,
      session: null,
      loading: true,
      initialized: false
    }
  }

  getState(): AuthState {
    return { ...this.state }
  }

  setState(updates: Partial<AuthState>): void {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...updates }
    
    console.group('🔄 STATE MANAGER - ATUALIZAÇÃO')
    console.log('Estado anterior:', prevState)
    console.log('Atualizações:', updates)
    console.log('Novo estado:', this.state)
    console.groupEnd()
    
    this.listeners.forEach(listener => listener(this.state))
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  isProcessing(operation: string): boolean {
    return this.processingRef.has(operation)
  }

  setProcessing(operation: string, processing: boolean): void {
    if (processing) {
      this.processingRef.add(operation)
    } else {
      this.processingRef.delete(operation)
    }
  }

  cleanup(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = null
    }
    this.processingRef.clear()
    this.listeners = []
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stateManagerRef = useRef<AuthStateManager>()
  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false
  }))

  // Inicializar o state manager
  if (!stateManagerRef.current) {
    stateManagerRef.current = new AuthStateManager()
  }

  const stateManager = stateManagerRef.current

  // Sincronizar estado React com state manager
  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setState)
    return unsubscribe
  }, [stateManager])

  // Função para buscar o perfil com controle de concorrência
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const operation = `fetch-profile-${userId}`
    
    if (stateManager.isProcessing(operation)) {
      console.log('⏳ Operação já em andamento, aguardando...')
      return null
    }

    stateManager.setProcessing(operation, true)
    console.log('🔍 INICIANDO BUSCA DE PERFIL', { userId })

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ ERRO NA BUSCA DE PERFIL:', error)
        
        if (error.code === 'PGRST116') {
          console.log('🔧 PERFIL NÃO ENCONTRADO, TENTANDO CRIAR')
          
          const { data: userData } = await supabase.auth.getUser(userId)
          
          if (userData.user) {
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
              console.error('❌ ERRO AO CRIAR PERFIL:', insertError)
              return null
            }
            
            console.log('✅ PERFIL CRIADO COM SUCESSO:', newProfile)
            return newProfile
          }
        }
        
        return null
      }

      console.log('✅ PERFIL ENCONTRADO:', data)
      return data
    } catch (error) {
      console.error('❌ ERRO INESPERADO NA BUSCA:', error)
      return null
    } finally {
      stateManager.setProcessing(operation, false)
    }
  }, [stateManager])

  // Função para atualizar o perfil
  const refreshProfile = useCallback(async () => {
    const currentState = stateManager.getState()
    if (currentState.user && !currentState.loading) {
      console.log('🔄 ATUALIZANDO PERFIL MANUALMENTE')
      const profileData = await fetchProfile(currentState.user.id)
      stateManager.setState({ profile: profileData })
    }
  }, [stateManager, fetchProfile])

  // Login
  const signIn = async (email: string, password: string) => {
    console.log('🔑 INICIANDO LOGIN', { email })
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ ERRO NO LOGIN:', error)
      } else {
        console.log('✅ LOGIN INICIADO COM SUCESSO')
      }
      
      return { error }
    } catch (error) {
      console.error('❌ ERRO INESPERADO NO LOGIN:', error)
      return { error }
    }
  }

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 INICIANDO CADASTRO', { email, fullName })
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
        console.error('❌ ERRO NO CADASTRO:', error)
      } else {
        console.log('✅ CADASTRO INICIADO COM SUCESSO')
      }
      
      return { error }
    } catch (error) {
      console.error('❌ ERRO INESPERADO NO CADASTRO:', error)
      return { error }
    }
  }

  // Logout
  const signOut = async () => {
    console.log('🚪 INICIANDO LOGOUT')
    await supabase.auth.signOut()
  }

  // Efeito principal de inicialização
  useEffect(() => {
    console.log('🚀 AUTH PROVIDER MONTADO - INICIANDO SISTEMA')
    
    const initializeAuth = async () => {
      console.log('🎯 INICIANDO AUTENTICAÇÃO')
      stateManager.setState({ loading: true })
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📋 SESSÃO OBTIDA:', { hasSession: !!session, email: session?.user?.email })
        
        if (session) {
          stateManager.setState({ 
            session, 
            user: session.user,
            loading: true 
          })
          
          const profileData = await fetchProfile(session.user.id)
          stateManager.setState({ 
            profile: profileData,
            loading: false,
            initialized: true
          })
          
          if (profileData) {
            console.log('✅ SISTEMA INICIALIZADO COM SUCESSO:', profileData.role)
          } else {
            console.error('❌ FALHA NA INICIALIZAÇÃO: PERFIL NÃO CARREGADO')
          }
        } else {
          console.log('❌ NENHUMA SESSÃO INICIAL ENCONTRADA')
          stateManager.setState({ 
            loading: false, 
            initialized: true 
          })
        }
      } catch (error) {
        console.error('❌ ERRO NA INICIALIZAÇÃO:', error)
        stateManager.setState({ 
          loading: false, 
          initialized: true 
        })
      }
    }

    // Configurar listener com controle de concorrência
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 EVENTO DE AUTH:', { event, hasSession: !!session, email: session?.user?.email })
        
        // Prevenir processamento simultâneo
        const operation = `auth-event-${event}`
        if (stateManager.isProcessing(operation)) {
          console.log('⏳ EVENTO JÁ EM PROCESSAMENTO, IGNORANDO')
          return
        }
        
        stateManager.setProcessing(operation, true)
        
        try {
          stateManager.setState({ 
            session, 
            user: session?.user ?? null 
          })
          
          if (event === 'SIGNED_IN' && session) {
            console.log('👤 USUÁRIO FEZ LOGIN, BUSCANDO PERFIL...')
            stateManager.setState({ loading: true })
            
            const profileData = await fetchProfile(session.user.id)
            stateManager.setState({ 
              profile: profileData,
              loading: false,
              initialized: true
            })
            
            if (profileData) {
              console.log('✅ LOGIN COMPLETO:', profileData.role)
            } else {
              console.error('❌ LOGIN INCOMPLETO: PERFIL NÃO CARREGADO')
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 USUÁRIO FEZ LOGOUT')
            stateManager.setState({ 
              profile: null,
              loading: false,
              initialized: true
            })
          } else if (event === 'INITIAL_SESSION') {
            // Já tratado na inicialização
            console.log('🔍 SESSÃO INICIAL JÁ PROCESSADA')
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 TOKEN ATUALIZADO')
          }
        } catch (error) {
          console.error('❌ ERRO PROCESSANDO EVENTO:', error)
          stateManager.setState({ loading: false })
        } finally {
          stateManager.setProcessing(operation, false)
        }
      }
    )

    stateManager.subscription = subscription
    initializeAuth()

    // Limpeza completa
    return () => {
      console.log('🧹 LIMPANDO AUTH PROVIDER')
      stateManager.cleanup()
    }
  }, [stateManager, fetchProfile])

  const value: AuthContextType = {
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
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