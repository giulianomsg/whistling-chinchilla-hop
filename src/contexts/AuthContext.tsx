import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

// Tipagem do Perfil (do seu client.ts)
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
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. fetchProfile (memoizada com tratamento de erros)
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
        // Não retornar null imediatamente, tentar criar perfil se não existir
        if (error.code === 'PGRST116') { // No rows found
          console.log('📝 [AUTH] Perfil não encontrado, tentando criar...')
          return await createProfileForUser(userId)
        }
        return null
      }
      console.log('✅ [AUTH] Perfil carregado:', data?.role)
      return data
    } catch (error) {
      console.error('❌ [AUTH] Erro na busca do perfil:', error)
      return null
    }
  }, [])

  // 2. Criar perfil para usuário que não tem
  const createProfileForUser = async (userId: string): Promise<Profile | null> => {
    try {
      // Buscar dados do usuário no auth
      const { data: { user }, error: userError } = await supabase.auth.getUser(userId)
      
      if (userError || !user) {
        console.error('❌ [AUTH] Erro ao buscar usuário auth:', userError)
        return null
      }

      // Criar perfil básico
      const profileData = {
        id: userId,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        role: user.user_metadata?.role || 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('❌ [AUTH] Erro ao criar perfil:', error)
        return null
      }

      console.log('✅ [AUTH] Perfil criado com sucesso:', data?.role)
      return data
    } catch (error) {
      console.error('❌ [AUTH] Erro ao criar perfil:', error)
      return null
    }
  }

  // 3. Funções de Auth
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'client' } }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log('🔄 [AUTH] Refresh profile solicitado')
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  // 4. useEffect principal com tratamento robusto
  useEffect(() => {
    console.log('🚀 [AUTH] AuthProvider montado e listener anexado')
    
    let mounted = true
    let timeoutId: NodeJS.Timeout

    // Função para garantir que loading seja false
    const ensureLoadingFalse = () => {
      if (mounted) {
        console.log('🏁 [AUTH] Garantindo loading = false (timeout)')
        setLoading(false)
      }
    }

    // Listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 [AUTH] Evento: ${event}`, 'User:', session?.user?.email)
        
        if (!mounted) return

        try {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            // Se o usuário existe (logado ou sessão restaurada)
            const profileData = await fetchProfile(session.user.id)
            
            if (mounted) {
              setProfile(profileData)
              console.log('🏁 [AUTH] Evento processado. Loading = false.')
              setLoading(false)
            }
          } else {
            // Se o usuário não existe (logout)
            if (mounted) {
              setProfile(null)
              console.log('🏁 [AUTH] Evento processado. Loading = false.')
              setLoading(false)
            }
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro no processamento do evento:', error)
          if (mounted) {
            setProfile(null)
            setLoading(false) // Garantir que loading seja false mesmo em erro
          }
        }

        // Timeout de segurança para garantir loading false
        timeoutId = setTimeout(ensureLoadingFalse, 3000)
      }
    )

    // Função de limpeza
    return () => {
      console.log('🧹 [AUTH] AuthProvider desmontado, listener removido')
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [fetchProfile])

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