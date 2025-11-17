import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

// Use a definição de tipo exportada do seu client.ts se disponível
// Se não, esta definição local está OK.
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
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true) // Começa true

  // 1. Memoize fetchProfile com useCallback
  // Esta função agora é estável e não causará re-renderizações do useEffect
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log('🔍 [AUTH] Buscando perfil para userId:', userId)
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
      console.log('✅ [AUTH] Perfil carregado:', data?.role)
      return data
    } catch (error) {
      console.error('❌ [AUTH] Erro na busca do perfil:', error)
      return null
    }
  }, []) // Dependência vazia: esta função nunca muda

  // 2. Funções de Auth (sem alteração)
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

  // 3. O useEffect ÚNICO e CORRIGIDO
  useEffect(() => {
    console.log('🚀 [AUTH] AuthProvider montado e listener anexado')
    
    // Define loading como true no início (caso de HMR ou re-renderizações)
    setLoading(true)

    // Este listener único gerencia TUDO:
    // 1. INITIAL_SESSION (F5 / Refresh)
    // 2. SIGNED_IN (Login)
    // 3. SIGNED_OUT (Logout)
    // 4. TOKEN_REFRESHED (Sessão atualizada)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 [AUTH] Evento: ${event}`, 'User:', session?.user?.email)
        try {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            // Se o usuário existe (logado ou sessão restaurada)
            const profileData = await fetchProfile(session.user.id)
            setProfile(profileData)
          } else {
            // Se o usuário não existe (logout)
            setProfile(null)
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro no processamento do evento:', error)
          setProfile(null)
        } finally {
          // Após o primeiro evento (seja uma sessão ou null),
          // paramos o loading.
          setLoading(false)
        }
      }
    )

    // Função de limpeza
    return () => {
      console.log('🧹 [AUTH] AuthProvider desmontado, listener removido')
      subscription.unsubscribe()
    }
  }, [fetchProfile]) // A única dependência é a função memoizada fetchProfile

  // REMOVEMOS O ESTADO 'isReady'. Ele é redundante. 'loading: false' é o novo 'isReady: true'
  const value: AuthContextType = {
    user,
    profile,
    session,
    loading, 
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