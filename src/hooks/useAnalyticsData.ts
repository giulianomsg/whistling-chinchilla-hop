
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { calculateOneRM } from '@/utils/strength'
import { subMonths, subYears, isAfter, startOfDay } from 'date-fns'

export type TimeRange = '1M' | '3M' | '1Y' | 'ALL'

export interface VolumeDataPoint {
    date: string
    volume: number
    sessionName: string
}

export interface ExerciseProgressPoint {
    date: string
    oneRM: number
    maxWeight: number
    reps: number
}

export const useAnalyticsData = (clientId: string | undefined) => {
    const [loading, setLoading] = useState(false)
    const [rawData, setRawData] = useState<any[]>([])
    const [availableExercises, setAvailableExercises] = useState<{ id: string; name: string }[]>([])

    useEffect(() => {
        if (!clientId) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('workout_execution_logs')
                    .select(`
            id,
            weight,
            reps,
            created_at,
            exercise_id,
            exercise:exercises_library(id, name),
            workout_session:workout_sessions!inner(id, created_at, client_id)
          `)
                    .eq('workout_session.client_id', clientId)
                    .order('created_at', { ascending: true })

                if (error) throw error

                setRawData(data || [])

                // Extract unique exercises for filter
                const uniqueExercises = new Map()
                data?.forEach((log: any) => {
                    if (log.exercise?.id && log.exercise?.name) {
                        uniqueExercises.set(log.exercise.id, log.exercise.name)
                    }
                })
                setAvailableExercises(Array.from(uniqueExercises.entries()).map(([id, name]) => ({ id, name })))

            } catch (err) {
                console.error('Error fetching analytics:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [clientId])

    const getFilteredData = (range: TimeRange, exerciseId?: string) => {
        const now = new Date()
        let startDate: Date | null = null

        if (range === '1M') startDate = subMonths(now, 1)
        if (range === '3M') startDate = subMonths(now, 3)
        if (range === '1Y') startDate = subYears(now, 1)

        return rawData.filter(log => {
            const logDate = new Date(log.workout_session.created_at)
            const afterStart = startDate ? isAfter(logDate, startOfDay(startDate)) : true
            const matchesExercise = exerciseId ? log.exercise_id === exerciseId : true
            return afterStart && matchesExercise
        })
    }

    const getVolumeData = (range: TimeRange): VolumeDataPoint[] => {
        const filtered = getFilteredData(range)
        const sessionMap = new Map<string, { date: string; volume: number; sessionName: string }>()

        filtered.forEach(log => {
            const sessionId = log.workout_session.id
            const vol = (log.weight || 0) * (log.reps || 0)

            if (!sessionMap.has(sessionId)) {
                sessionMap.set(sessionId, {
                    date: log.workout_session.created_at,
                    volume: 0,
                    sessionName: `Treino ${new Date(log.workout_session.created_at).toLocaleDateString()}`
                })
            }

            const session = sessionMap.get(sessionId)!
            session.volume += vol
        })

        return Array.from(sessionMap.values())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() }))
    }

    const getExerciseHistory = (exerciseId: string, range: TimeRange): ExerciseProgressPoint[] => {
        const filtered = getFilteredData(range, exerciseId)
        const sessionMap = new Map<string, { date: string; maxOneRM: number; maxWeight: number; reps: number }>()

        filtered.forEach(log => {
            const dateKey = new Date(log.workout_session.created_at).toISOString().split('T')[0] // Group by day
            const w = log.weight || 0
            const r = log.reps || 0
            const oneRM = calculateOneRM(w, r)

            if (!sessionMap.has(dateKey)) {
                sessionMap.set(dateKey, { date: log.workout_session.created_at, maxOneRM: 0, maxWeight: 0, reps: 0 })
            }

            const current = sessionMap.get(dateKey)!
            if (oneRM > current.maxOneRM) {
                current.maxOneRM = oneRM
                current.maxWeight = w
                current.reps = r // store reps of max lift
            }
        })

        return Array.from(sessionMap.values())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(d => ({
                date: new Date(d.date).toLocaleDateString(),
                oneRM: d.maxOneRM,
                maxWeight: d.maxWeight,
                reps: d.reps
            }))
    }

    return {
        loading,
        availableExercises,
        getVolumeData,
        getExerciseHistory
    }
}
