
export const calculateOneRM = (weight: number, reps: number): number => {
    if (reps === 1) return weight
    // Epley Formula
    return Math.round(weight * (1 + reps / 30))
}

// DOTS Coefficients (Male/Female)
// Source: https://www.powerlifting.ipf.com/
const DOTS_COEFFICIENTS = {
    male: {
        A: -0.0000010930204151919782,
        B: 0.0007391293232479699,
        C: -0.1918751049171297,
        D: 24.090075571966965,
        E: -307.7507561570706
    },
    female: {
        A: -0.0000010706606132624,
        B: 0.0005158567996144003,
        C: -0.11266554952674489,
        D: 13.617503195208453,
        E: -57.96287953258455
    }
}

export const calculateDots = (totalLifted: number, bodyWeight: number, gender: 'male' | 'female' = 'male'): number => {
    if (!bodyWeight || bodyWeight <= 0) return 0

    const c = DOTS_COEFFICIENTS[gender] || DOTS_COEFFICIENTS.male
    const denominator = c.A * Math.pow(bodyWeight, 4) +
        c.B * Math.pow(bodyWeight, 3) +
        c.C * Math.pow(bodyWeight, 2) +
        c.D * bodyWeight +
        c.E

    if (denominator === 0) return 0
    const score = (totalLifted * 500) / denominator
    return Math.max(0, parseFloat(score.toFixed(2)))
}

export type StrengthLevel = 'Iniciante' | 'Novato' | 'Intermediário' | 'Avançado' | 'Elite'

export const STRENGTH_STANDARDS: Record<string, Record<StrengthLevel, number>> = {
    squat: {
        'Iniciante': 0.75,
        'Novato': 1.0,
        'Intermediário': 1.5,
        'Avançado': 2.0,
        'Elite': 2.5
    },
    bench: {
        'Iniciante': 0.5,
        'Novato': 0.75,
        'Intermediário': 1.1, // 1.1x BW
        'Avançado': 1.5,
        'Elite': 1.9
    },
    deadlift: {
        'Iniciante': 1.0,
        'Novato': 1.25,
        'Intermediário': 1.75,
        'Avançado': 2.4,
        'Elite': 3.0
    },
    overhead: { // Overhead Press
        'Iniciante': 0.35,
        'Novato': 0.5,
        'Intermediário': 0.75,
        'Avançado': 0.9,
        'Elite': 1.15
    }
}

// Canonical Mapping for "Big 4" Compound Movements
export const BIG_4_MAPPING: Record<string, 'squat' | 'bench' | 'deadlift' | 'overhead'> = {
    // Squat Variations
    'agachamento': 'squat', 'squat': 'squat', 'agachamento livre': 'squat', 'agachamento barra costas': 'squat',
    // Bench Variations
    'supino': 'bench', 'bench press': 'bench', 'supino reto': 'bench', 'supino reto com barra': 'bench',
    // Deadlift Variations
    'levantamento terra': 'deadlift', 'deadlift': 'deadlift', 'terra': 'deadlift', 'lev. terra': 'deadlift',
    // Overhead Variations
    'desenvolvimento': 'overhead', 'overhead press': 'overhead', 'militar': 'overhead', 'desenvolvimento militar': 'overhead', 'ohp': 'overhead'
}

export const getCanonicalExerciseId = (name: string): 'squat' | 'bench' | 'deadlift' | 'overhead' | null => {
    const n = name.trim().toLowerCase()
    // Exact match first
    if (BIG_4_MAPPING[n]) return BIG_4_MAPPING[n]

    return null
}

export const getClassificaton = (oneRM: number, bodyWeight: number, liftType: 'squat' | 'bench' | 'deadlift' | 'overhead'): { level: StrengthLevel, score: number, multiplier: number } => {
    if (!bodyWeight || bodyWeight === 0) return { level: 'Iniciante', score: 1.0, multiplier: 1.0 }

    const ratio = oneRM / bodyWeight
    const standards = STRENGTH_STANDARDS[liftType]

    // Calculate generic "Tier Score" (1.0 - 5.0)
    let baseScore = 1.0
    let multiplier = 1.0 // XP Multiplier

    if (ratio >= standards['Elite']) { baseScore = 5.0; multiplier = 1.5 }
    else if (ratio >= standards['Avançado']) { baseScore = 4.0; multiplier = 1.5 }
    else if (ratio >= standards['Intermediário']) { baseScore = 3.0; multiplier = 1.2 }
    else if (ratio >= standards['Novato']) { baseScore = 2.0; multiplier = 1.0 }
    else { baseScore = 1.0; multiplier = 1.0 }

    return {
        level: baseScore >= 5 ? 'Elite' : baseScore >= 4 ? 'Avançado' : baseScore >= 3 ? 'Intermediário' : baseScore >= 2 ? 'Novato' : 'Iniciante',
        score: baseScore,
        multiplier
    }
}
