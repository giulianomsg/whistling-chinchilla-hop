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
  const [loading, setLoading] = useState(true) // Começa true, termina false

  // Função para buscar o perfil do usuário
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        
        // Se perfil não existe, tenta criar um básico
        if (error.code === 'PGRST116') {
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

  // Função para atualizar o perfil
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
    // Listener único para todos os eventos de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de auth:', event, session?.user?.email)
        
        // Sempre atualiza session e user primeiro
        setSession(session)
        setUser(session?.user ?? null)
        
        // Depois trata o perfil baseado no evento
        if (event === 'SIGNED_IN' && session) {
          console.log('Usuário fez login, buscando perfil...')
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
          if (profileData) {
            console.log('Perfil carregado:', profileData.role)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuário fez logout, limpando perfil...')
          setProfile(null)
        } else if (event === 'INITIAL_SESSION') {
          console.log('Sessão inicial carregada, buscando perfil...')
          if (session) {
            const profileData = await fetchProfile(session.user.id)
            setProfile(profileData)
            if (profileData) {
              console.log('Perfil inicial carregado:', profileData.role)
            }
          }
        }
        
        // Finaliza o loading após processar
        setLoading(false)
      }
    )

    // Dispara o listener manualmente para obter a sessão inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        // Simula o evento INITIAL_SESSION
        if (session) {
          setSession(session)
          setUser(session.user)
          console.log('Sessão inicial encontrada:', session.user.email)
          
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
          if (profileData) {
            console.log('Perfil inicial carregado:', profileData.role)
          }
        } else {
          console.log('Nenhuma sessão inicial encontrada')
        }
      } catch (error) {
        console.error('Erro na inicialização da auth:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()

    // Limpeza
    return () => {
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