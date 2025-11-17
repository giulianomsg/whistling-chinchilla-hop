import { createClient } from '@supabase/supabase-js'

// Verificação das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 [SUPABASE] Verificando configuração:')
console.log('🔧 [SUPABASE] URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada')
console.log('🔧 [SUPABASE] Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [SUPABASE] Variáveis de ambiente não configuradas!')
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // <-- ATIVAR AUTO-REFRESH
    persistSession: true,
    detectSessionInUrl: true,
    flow: 'pkce' // Melhor para web apps
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'admin' | 'professional' | 'client'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role: 'admin' | 'professional' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'professional' | 'client'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}