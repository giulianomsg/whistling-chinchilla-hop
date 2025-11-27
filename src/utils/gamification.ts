
/**
 * Gamification Utility Functions
 * Matches logic from supabase/migrations/20251125122500_gamification_rpg.sql
 */

export const getRankTitle = (level: number): string => {
    if (level <= 5) return 'Novato de Sofá'
    if (level <= 10) return 'Caminhante de Fim de Semana'
    if (level <= 20) return 'Rato de Academia'
    if (level <= 30) return 'Maratonista de Dados'
    if (level <= 50) return 'Ciborgue Fitness'
    return 'Lenda Viva'
}

export const calculateLevel = (xp: number): number => {
    if (xp < 100) return 1
    return Math.floor(Math.sqrt(xp / 100.0))
}

export const getNextLevelXP = (level: number): number => {
    // Inverse of level = sqrt(xp / 100) -> xp = level^2 * 100
    // Next level is level + 1
    return Math.pow(level + 1, 2) * 100
}

export const getLevelProgress = (currentXP: number, currentLevel: number) => {
    const currentLevelBaseXP = Math.pow(currentLevel, 2) * 100
    const nextLevelXP = Math.pow(currentLevel + 1, 2) * 100

    const xpInLevel = currentXP - currentLevelBaseXP
    const xpRequiredForNext = nextLevelXP - currentLevelBaseXP

    const progress = Math.min(100, Math.max(0, (xpInLevel / xpRequiredForNext) * 100))

    return {
        xpInLevel,
        xpRequiredForNext,
        progress
    }
}
