import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: 'admin' | 'professional' | 'client'
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isReady: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('❌ [AUTH] Erro ao buscar perfil:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('❌ [AUTH] Erro na busca do perfil:', error)
      return null
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

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

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    let mounted = true
    let profileFetchTimeout: NodeJS.Timeout

    const initialize = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AUTH] Erro ao obter sessão:', error)
        }
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Buscar perfil com timeout para evitar loops
            const profilePromise = fetchProfile(session.user.id)
            const timeoutPromise = new Promise<null>((_, reject) => {
              profileFetchTimeout = setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
            })
            
            try {
              const profileData = await Promise.race([profilePromise, timeoutPromise])
              clearTimeout(profileFetchTimeout)
              if (profileData && mounted) {
                setProfile(profileData)
                console.log('✅ [AUTH] Perfil carregado:', profileData.role)
              }
            } catch (error) {
              clearTimeout(profileFetchTimeout)
              console.error('❌ [AUTH] Timeout ao buscar perfil:', error)
              if (mounted) {
                setProfile(null)
              }
            }
          } else {
            if (mounted) {
              setProfile(null)
            }
          }
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          // Adicionar um pequeno delay para garantir que tudo está pronto
          setTimeout(() => {
            if (mounted) {
              setIsReady(true)
            }
          }, 100)
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('🔄 [AUTH] Evento:', event, 'User:', session?.user?.email)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (event === 'SIGNED_IN' && session?.user) {
            const profileData = await fetchProfile(session.user.id)
            if (mounted) {
              setProfile(profileData)
              console.log('✅ [AUTH] Perfil carregado após SIGNED_IN:', profileData?.role)
            }
          } else if (event === 'SIGNED_OUT') {
            if (mounted) {
              setProfile(null)
            }
          }
        }
      }
    )

    initialize()

    return () => {
      mounted = false
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout)
      }
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isReady,
    signIn,
    signUp,
    signOut
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