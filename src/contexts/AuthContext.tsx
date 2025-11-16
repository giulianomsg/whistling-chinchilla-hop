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
  const [loading, setLoading] = useState(false) // Sempre false

  // Função para buscar o perfil do usuário
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // LANÇA O ERRO em vez de só logar e retornar
      throw error 
    }

    // Só seta o perfil se NÃO houver erro
    setProfile(data)
  }

  // Função para atualizar o perfil (usada após cadastro)
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string) => {
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
      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    // 1. LÓGICA DE CARGA INICIAL (F5)
    // Esta função só roda UMA VEZ na montagem
    const loadInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setSession(session)
          setUser(session.user)
          // Se a sessão existir, buscamos o perfil
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (error) {
            console.error("Erro ao buscar perfil na carga inicial:", error)
            throw error
          }
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Falha na carga inicial da sessão:", error)
        // Não faz nada, usuário continua null
      } finally {
        // setLoading(false) removido - loading sempre false
      }
    }
    
    loadInitialSession()

    // 2. LISTENER PARA MUDANÇAS (Login / Logout)
    // Ouve eventos DEPOIS da carga inicial
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session) {
          // Se for login, busca o perfil
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (profileData) setProfile(profileData)
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    // Limpeza
    return () => {
      subscription.unsubscribe()
    }
  }, []) // Array vazio, roda apenas na montagem

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