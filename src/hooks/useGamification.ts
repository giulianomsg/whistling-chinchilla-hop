import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { calculateLevel, getLevelProgress, getRankTitle } from '@/utils/gamification'

export interface GamificationState {
    currentXP: number
    level: number
    rankTitle: string
    xpInLevel: number
    xpRequiredForNext: number
    progress: number
    loading: boolean
}

export const useGamification = () => {
    const { user } = useAuth()
    const [state, setState] = useState<GamificationState>({
        currentXP: 0,
        level: 1,
        rankTitle: 'Novato de Sofá',
        xpInLevel: 0,
        xpRequiredForNext: 100,
        progress: 0,
        loading: true
    })

    const fetchGamificationData = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('current_xp, level')
                .eq('id', user.id)
                .single()

            if (error) throw error

            if (data) {
                const currentXP = data.current_xp || 0
                const level = data.level || calculateLevel(currentXP)
                const rankTitle = getRankTitle(level)
                const progressStats = getLevelProgress(currentXP, level)

                setState({
                    currentXP,
                    level,
                    rankTitle,
                    ...progressStats,
                    loading: false
                })
            }
        } catch (error) {
            console.error('Error fetching gamification data:', error)
            setState(prev => ({ ...prev, loading: false }))
        }
    }

    useEffect(() => {
        fetchGamificationData()

        // Subscribe to realtime changes
        if (!user) return

        const channel = supabase
            .channel('gamification_updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    const newXP = payload.new.current_xp
                    const newLevel = payload.new.level

                    if (newXP !== undefined) {
                        const level = newLevel || calculateLevel(newXP)
                        const rankTitle = getRankTitle(level)
                        const progressStats = getLevelProgress(newXP, level)

                        setState({
                            currentXP: newXP,
                            level,
                            rankTitle,
                            ...progressStats,
                            loading: false
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    return {
        ...state,
        refreshGamification: fetchGamificationData
    }
}
