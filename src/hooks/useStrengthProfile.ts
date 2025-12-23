
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { calculateOneRM, calculateDots, getClassificaton, getCanonicalExerciseId, StrengthLevel } from '@/utils/strength'

export interface StrengthStat {
    subject: string
    A: number // Score (1-5)
    fullMark: number
    oneRM: number
    level: StrengthLevel
    multiplier: number
}

export function useStrengthProfile(clientId: string | undefined, currentWeight: number | undefined) {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<StrengthStat[]>([])
    const [dotsScore, setDotsScore] = useState<number>(0)

    useEffect(() => {
        let mounted = true

        const calculate = async () => {
            if (!clientId) return
            setLoading(true)

            try {
                // 1. Fetch Workout Logs (with exercise base_type)
                const { data: userLogs } = await supabase
                    .from('workout_execution_logs')
                    .select(`weight, reps, exercise:exercises_library(name, base_type), workout_session:workout_sessions!inner(client_id, created_at)`)
                    .eq('workout_session.client_id', clientId)

                if (!userLogs || !mounted) {
                    setLoading(false)
                    return
                }

                // 2. Calculate Maxes per Canonical Lift
                const maxes: Record<string, number> = {}

                userLogs.forEach((log: any) => {
                    const name = log.exercise?.name || ''
                    const baseType = log.exercise?.base_type || undefined
                    const w = log.weight || 0
                    const r = log.reps || 0
                    if (w === 0) return

                    const canonicalId = getCanonicalExerciseId(name, baseType)
                    if (!canonicalId) return // Strict mapping

                    const oneRM = calculateOneRM(w, r)
                    if (!maxes[canonicalId] || oneRM > maxes[canonicalId]) {
                        maxes[canonicalId] = oneRM
                    }
                })

                // 3. Build Stats Array
                const weightToUse = currentWeight || 70 // Fallback if weight is missing
                const newStats: StrengthStat[] = [
                    { id: 'squat', label: 'Agachamento' },
                    { id: 'bench', label: 'Supino' },
                    { id: 'deadlift', label: 'Terra' },
                    { id: 'overhead', label: 'Ombros' }
                ].map(lift => {
                    const oneRM = maxes[lift.id] || 0
                    const classif = getClassificaton(oneRM, weightToUse, lift.id as any)
                    return {
                        subject: lift.label,
                        A: classif.score,
                        fullMark: 5,
                        oneRM: oneRM,
                        level: classif.level,
                        multiplier: classif.multiplier
                    }
                })

                // 4. Calculate DOTS
                const totalLifted = (maxes['squat'] || 0) + (maxes['bench'] || 0) + (maxes['deadlift'] || 0)
                const dots = calculateDots(totalLifted, weightToUse, 'male') // Default to male for now, could be improved with gender prop

                if (mounted) {
                    setStats(newStats)
                    setDotsScore(dots)
                }

            } catch (err) {
                console.error("Error calculating strength profile:", err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        calculate()

        return () => { mounted = false }
    }, [clientId, currentWeight])

    return { stats, dotsScore, loading }
}
