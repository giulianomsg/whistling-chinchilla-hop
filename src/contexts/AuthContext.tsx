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

  // Função simples para buscar perfil
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Criar perfil se não existir
          const { data: userData } = await supabase.auth.getUser(userId)
          if (userData.user) {
            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userData.user.email || '',
                full_name: userData.user.user_metadata?.full_name || '',
                role: userData.user.user_metadata?.role || 'client'
              })
              .select()
              .single()
            return newProfile
          }
        }
        return null
      }
      return data
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }
  }

  // Função para atualizar perfil
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  // Login
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string) => {
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
    await supabase.auth.signOut()
  }

  useEffect(() => {
    let mounted = true

    // Função inicial
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            const profileData = await fetchProfile(session.user.id)
            if (mounted) {
              setProfile(profileData)
            }
          }
        }
      } catch (error) {
        console.error('Erro na inicialização:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth event:', event, session?.user?.email)

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          const profileData = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    initialize()

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