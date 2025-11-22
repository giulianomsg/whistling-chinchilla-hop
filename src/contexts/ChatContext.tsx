import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './AuthContext'
import { toast } from 'sonner'

interface ChatContextType {
  totalUnreadCount: number
  refreshUnreadCount: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [totalUnreadCount, setTotalUnreadCount] = useState(0)

  // Buscar contagem inicial de mensagens não lidas
  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('count_total_unread_messages', {
        user_id: user.id
      })

      if (error) {
        console.error('❌ [CHAT_CONTEXT] Erro ao buscar contagem de não lidas:', error)
        return
      }

      setTotalUnreadCount(data || 0)
    } catch (error) {
      console.error('❌ [CHAT_CONTEXT] Erro inesperado ao buscar contagem:', error)
    }
  }

  // Função para atualizar contagem (chamada quando usuário lê mensagens)
  const refreshUnreadCount = async () => {
    await fetchUnreadCount()
  }

  // Efeito para buscar contagem inicial
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
    }
  }, [user?.id])

  // Efeito para escutar mensagens em tempo real (global)
  useEffect(() => {
    if (!user) return

    console.log('🔔 [CHAT_CONTEXT] Configurando listener global de notificações para:', user.id)

    const channel = supabase.channel('global_chat_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          const newMessage = payload.new as any
          
          // Verificar se a mensagem é para o usuário atual
          if (newMessage.receiver_id === user.id) {
            console.log('🔔 [CHAT_CONTEXT] Nova mensagem recebida globalmente:', newMessage)
            
            // Incrementar contador
            setTotalUnreadCount(prev => prev + 1)
            
            // Tocar som de notificação APENAS se eu não for o remetente (segurança extra)
            if (newMessage.sender_id !== user.id) {
                try {
                  const audio = new Audio('/notification.mp3')
                  audio.play().catch(() => {
                    console.log('🔇 [CHAT_CONTEXT] Não foi possível tocar som de notificação (interação necessária)')
                  })
                } catch (error) {
                  console.log('🔇 [CHAT_CONTEXT] Erro ao tocar som:', error)
                }
            }
            
            // Buscar nome do remetente para o toast
            try {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', newMessage.sender_id)
                .single()
              
              const senderName = senderProfile?.full_name || 'Alguém'
              
              // Mostrar toast rápido
              toast(`Nova mensagem de ${senderName}`, {
                duration: 4000,
                action: {
                  label: 'Responder',
                  onClick: () => {
                    window.location.href = '/app/chat'
                  }
                }
              })
            } catch (error) {
              console.error('❌ [CHAT_CONTEXT] Erro ao buscar perfil do remetente:', error)
            }
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🔌 [CHAT_CONTEXT] Limpando canal global de notificações')
      channel.unsubscribe()
    }
  }, [user?.id])

  const value: ChatContextType = {
    totalUnreadCount,
    refreshUnreadCount
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}