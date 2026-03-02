
import { calculateOneRM, getCanonicalExerciseId, getClassificaton, BIG_4_MAPPING } from './strength'

export interface Log {
    id?: string
    workout_exercise_id: string
    weight: number
    reps: number
    exercise?: { name: string }
}

export interface XPResult {
    total: number
    breakdown: {
        time: number
        work: number
        bonus: number
        performance: number // PRs + Tier Bonuses
    }
    logXPMap: Record<string, number> // Maps log IDs to their calculated XP (Work + PR)
    details: string[] // Log of what happened (e.g. "PR on Squat +30XP")
}

export const calculateSessionXP = (
    elapsedTime: number,
    exerciseTimers: Record<string, number>,
    logs: Log[],
    workoutExercises: any[], // The plan definition to check completion
    userWeight: number,
    history1RMs: Record<string, number> = {} // Map of 'squat' | 'bench' etc -> max 1RM
): XPResult => {
    const result: XPResult = {
        total: 0,
        breakdown: { time: 0, work: 0, bonus: 0, performance: 0 },
        logXPMap: {},
        details: []
    }

    // 1. Minimum Viable Session Rule
    // ...
    const totalActiveTime = Object.values(exerciseTimers).reduce((a, b) => a + b, 0)
    const effectiveTime = totalActiveTime > 60 ? totalActiveTime : elapsedTime

    if (logs.length === 0) {
        result.details.push('Sem XP: Treino vazio.')
        return result
    }

    // 2. Base Time XP
    result.breakdown.time = Math.min(Math.floor(effectiveTime / 60) * 2, 180)

    // 3. Work XP + Performance Multipliers
    let workXP = 0
    let performanceXP = 0

    const processedExercises = new Set<string>()

    logs.forEach(log => {
        let setXP = 15
        let logSpecificWorkXP = 15
        let logSpecificPerfXP = 0

        const exerciseName = log.exercise?.name || ''
        const isUnilateral = (log.exercise as any)?.is_unilateral || false
        const canonicalId = getCanonicalExerciseId(exerciseName)

        // Calculate Set Performance (isolated weight for 1RM calculation)
        const set1RM = calculateOneRM(log.weight || 0, log.reps || 0)

        // Tier Multiplier
        if (canonicalId) {
            const { multiplier } = getClassificaton(set1RM, userWeight, canonicalId)
            if (multiplier > 1.0) {
                const bonus = Math.floor(15 * (multiplier - 1))
                setXP += bonus
                logSpecificWorkXP += bonus
            }
        }

        // Unilateral Physics: Double the Work XP volume contribution
        if (isUnilateral) {
            setXP *= 2
            logSpecificWorkXP *= 2
        }

        workXP += logSpecificWorkXP

        // PR Bonus Check (Only if canonical)
        if (canonicalId && !processedExercises.has(canonicalId)) {
            const historyMax = history1RMs[canonicalId] || 0
            // Notice: The JS still has 1.25 suspicious check, but DB enforces 1.5 hard cut.
            const isSuspicious = historyMax > 0 && set1RM > historyMax * 1.25

            if (set1RM > historyMax && !isSuspicious) {
                performanceXP += 30
                logSpecificPerfXP += 30
                result.details.push(`🏆 Recorde Pessoal (PR) no ${canonicalId}: ${set1RM}kg (1RM)`)
                processedExercises.add(canonicalId)
            }
        }

        if (log.id) {
            result.logXPMap[log.id] = logSpecificWorkXP + logSpecificPerfXP
        }
    })

    result.breakdown.work = workXP
    result.breakdown.performance = performanceXP

    // 4. Completion Bonus
    // If unique exercises logged >= total active exercises in plan
    const planExIds = new Set(workoutExercises.map(we => we.id))
    const loggedExIds = new Set(logs.map(l => l.workout_exercise_id))

    // Count how many PLAN IDs were touched
    let touchedCount = 0
    planExIds.forEach(id => {
        if (loggedExIds.has(id)) touchedCount++
    })

    if (touchedCount >= planExIds.size && planExIds.size > 0) {
        result.breakdown.bonus = 50
        result.details.push('🎯 Bônus de Completude: Todos exercícios feitos!')
    }

    result.total = result.breakdown.time + result.breakdown.work + result.breakdown.bonus + result.breakdown.performance

    return result
}
