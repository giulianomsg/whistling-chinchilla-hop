
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
        details: []
    }

    // 1. Minimum Viable Session Rule
    // If < 1 min OR no logs, 0 XP.
    const totalActiveTime = Object.values(exerciseTimers).reduce((a, b) => a + b, 0)
    const effectiveTime = totalActiveTime > 60 ? totalActiveTime : elapsedTime

    if (effectiveTime < 60 || logs.length === 0) {
        result.details.push('Sem XP: Treino muito curto ou vazio.')
        return result
    }

    // 2. Base Time XP
    // 2 XP per minute, max 180 (90 min)
    result.breakdown.time = Math.min(Math.floor(effectiveTime / 60) * 2, 180)

    // 3. Work XP + Performance Multipliers
    let workXP = 0
    let performanceXP = 0

    const processedExercises = new Set<string>() // To avoid double PRs for same exercise in one session? Usually we take best set.

    logs.forEach(log => {
        // Base Work XP per set: 15
        let setXP = 15

        const exerciseName = log.exercise?.name || ''
        const canonicalId = getCanonicalExerciseId(exerciseName)

        // Calculate Set Performance
        const set1RM = calculateOneRM(log.weight || 0, log.reps || 0)

        // Tier Multiplier
        if (canonicalId) {
            const { multiplier, level } = getClassificaton(set1RM, userWeight, canonicalId)
            if (multiplier > 1.0) {
                // Apply multiplier to the base 15
                // e.g. 1.2x -> 18 XP (Gain is 3 XP)
                const bonus = Math.floor(15 * (multiplier - 1))
                setXP += bonus
                // We attribute the extra check to "work" or "performance"? 
                // User said: "Multiplicador sobre o XP_Execução". Let's fold it into Work for simplicity, or keep pure Base Work vs Performance.
                // Let's count the extra as Performance/Work. Currently I'll put total in Work.
                // Actually, user wants "XP_Performance" distinct. Let's split it?
                // "XP_Final = (Tempo + Execução + Completude) + XP_Performance"
                // Execução (Com Multiplicador) = 15 * 1.2 = 18.
                // So 15 goes to Work, 3 goes to Performance? Or just Work becomes 18?
                // User example: "Execução (Com Multiplicador)... 6 * 18 = 108".
                // So it acts as enhanced Work XP. I will add it to Work breakdown.
            }
        }

        workXP += Math.floor(setXP)

        // PR Bonus Check (Only if canonical)
        if (canonicalId && !processedExercises.has(canonicalId)) {
            const historyMax = history1RMs[canonicalId] || 0
            // Anti-Cheat: If > 25% increase, ignore. (unless history is 0, then its new PR)
            const isSuspicious = historyMax > 0 && set1RM > historyMax * 1.25

            if (set1RM > historyMax && !isSuspicious) {
                performanceXP += 30
                result.details.push(`🏆 Recorde Pessoal (PR) no ${canonicalId}: ${set1RM}kg (1RM)`)
                processedExercises.add(canonicalId) // Only 1 PR bonus per exercise type per session
            }
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
