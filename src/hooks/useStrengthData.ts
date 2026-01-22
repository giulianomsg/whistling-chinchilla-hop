import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { calculateOneRM, getCanonicalExerciseId, getClassificaton, StrengthLevel, calculateDots } from '@/utils/strength'

export interface StrengthStat {
    subject: string
    A: number // Score 1-5
    fullMark: number
    val: number // 1RM Value
    level: StrengthLevel
}

export const useStrengthData = (clientId: string | undefined) => {
    const [strengthStats, setStrengthStats] = useState<StrengthStat[]>([])
    const [loading, setLoading] = useState(false)
    const [overallLevel, setOverallLevel] = useState<string>('Iniciante')
    const [dotsScore, setDotsScore] = useState(0)

    useEffect(() => {
        if (!clientId) return

        const fetchStrengthData = async () => {
            setLoading(true)
            try {
                // Fetch User Logs
                const { data: userLogs } = await supabase
                    .from('workout_execution_logs')
                    .select(`weight, reps, exercise:exercises_library(name, base_type), workout_session:workout_sessions!inner(client_id)`)
                    .eq('workout_session.client_id', clientId)

                // Fetch User Weight (Latest Body Assessment)
                const { data: assessments } = await supabase
                    .from('biometric_data')
                    .select('weight')
                    .eq('client_id', clientId)
                    .order('date', { ascending: false })
                    .order('date', { ascending: false })
                    .limit(1)

                const currentWeight = assessments?.[0]?.weight || 70 // Fallback 70kg

                if (!userLogs) {
                    setLoading(false)
                    return
                }

                // Track Max Lifts
                const maxLifts: Record<string, number> = { squat: 0, bench: 0, deadlift: 0, overhead: 0 }

                userLogs.forEach((log: any) => {
                    const name = log.exercise?.name || ''
                    const baseType = log.exercise?.base_type || undefined
                    const isUnilateral = log.exercise?.is_unilateral || false
                    let w = log.weight || 0
                    const r = log.reps || 0
                    if (w === 0) return

                    const canonicalId = getCanonicalExerciseId(name, baseType)
                    if (!canonicalId) return

                    // Unilateral logic: Double weight for stats
                    if (isUnilateral) {
                        w = w * 2
                    }

                    const oneRM = calculateOneRM(w, r)
                    if (oneRM > maxLifts[canonicalId]) {
                        maxLifts[canonicalId] = oneRM
                    }
                })

                const stats: StrengthStat[] = []
                let totalScore = 0
                let count = 0

                for (const key of ['squat', 'bench', 'deadlift', 'overhead'] as const) {
                    const lift = maxLifts[key]
                    const label = key === 'bench' ? 'Supino' : key === 'squat' ? 'Agachamento' : key === 'deadlift' ? 'Lev. Terra' : 'Ombros'

                    const result = getClassificaton(lift, currentWeight, key)

                    if (lift > 0) {
                        totalScore += result.score
                        count++
                    }

                    stats.push({
                        subject: label,
                        A: result.score,
                        fullMark: 5,
                        val: lift,
                        level: result.level
                    })
                }

                setStrengthStats(stats)

                // Calculate Overall Level
                if (count > 0) {
                    const avg = totalScore / count
                    setOverallLevel(avg >= 4.5 ? 'Elite' : avg >= 3.5 ? 'Avançado' : avg >= 2.5 ? 'Intermediário' : avg >= 1.5 ? 'Novato' : 'Iniciante')
                }

                const totalLifted = maxLifts.squat + maxLifts.bench + maxLifts.deadlift
                const gender = 'male' // Default to male as we don't have gender in profile yet
                const dots = calculateDots(totalLifted, currentWeight, gender)
                setDotsScore(dots)

            } catch (error) {
                console.error('Error fetching strength data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStrengthData()
    }, [clientId])

    return { strengthStats, loading, overallLevel, dotsScore }
}
