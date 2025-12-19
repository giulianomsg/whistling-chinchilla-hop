
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

export const getClassificaton = (oneRM: number, bodyWeight: number, liftType: 'squat' | 'bench' | 'deadlift' | 'overhead'): StrengthLevel => {
    if (!bodyWeight || bodyWeight === 0) return 'Iniciante'

    const ratio = oneRM / bodyWeight
    const standards = STRENGTH_STANDARDS[liftType]

    if (ratio >= standards['Elite']) return 'Elite'
    if (ratio >= standards['Avançado']) return 'Avançado'
    if (ratio >= standards['Intermediário']) return 'Intermediário'
    if (ratio >= standards['Novato']) return 'Novato'

    return 'Iniciante'
}
