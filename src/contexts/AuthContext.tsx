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
  const [loading, setLoading] = useState(true) // Começa como true para carga inicial

  // Função para buscar o perfil do usuário com fallback
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        
        // Se o perfil não existir, tenta criar um básico
        if (error.code === 'PGRST116') { // Row not found
          console.log('Perfil não encontrado, tentando criar...')
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
              console.error('Erro ao criar perfil:', insertError)
              return null
            }
            
            console.log('Perfil criado com sucesso:', newProfile)
            return newProfile
          }
        }
        
        return null
      }

      return data
    } catch (error) {
      console.error('Erro inesperado ao buscar perfil:', error)
      return null
    }
  }

  // Função para atualizar o perfil (usada após cadastro)
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
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
    const loadInitialSession = async () => {
      try {
        console.log('Iniciando carga inicial da sessão...')
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('Sessão encontrada:', session.user.email)
          setSession(session)
          setUser(session.user)
          
          // Buscar perfil do usuário
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
          
          if (profileData) {
            console.log('Perfil carregado com sucesso:', profileData.role)
          } else {
            console.warn('Perfil não pôde ser carregado')
          }
        } else {
          console.log('Nenhuma sessão encontrada')
        }
      } catch (error) {
        console.error("Falha na carga inicial da sessão:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialSession()

    // 2. LISTENER PARA MUDANÇAS (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de auth:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN' && session) {
          // Se for login, busca o perfil
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
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