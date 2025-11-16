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
    let mounted = true

    // Função principal que gerencia o estado de autenticação
    const initializeAuth = async () => {
      try {
        // 1. Obter sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (currentSession) {
          console.log('Sessão encontrada:', currentSession.user.email)
          setSession(currentSession)
          setUser(currentSession.user)

          // 2. Buscar perfil do usuário
          const profileData = await fetchProfile(currentSession.user.id)
          
          if (!mounted) return
          
          if (profileData) {
            console.log('Perfil carregado:', profileData.role)
            setProfile(profileData)
          } else {
            console.log('Perfil não encontrado ou erro ao carregar')
          }
        } else {
          console.log('Nenhuma sessão encontrada')
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error)
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

    // Inicializar autenticação
    initializeAuth()

    // Configurar listener para mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Mudança de estado de autenticação:', event, newSession?.user?.email)
        
        if (!mounted) return

        // Atualizar estados básicos
        setSession(newSession)
        setUser(newSession?.user ?? null)

        // Tratar eventos específicos
        if (event === 'SIGNED_IN' && newSession) {
          const profileData = await fetchProfile(newSession.user.id)
          if (mounted) {
            setProfile(profileData)
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setProfile(null)
          }
        }
        // Note: não precisamos setar loading=false aqui porque já foi setado na inicialização
      }
    )

    // Cleanup
    return () => {
      mounted = false
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