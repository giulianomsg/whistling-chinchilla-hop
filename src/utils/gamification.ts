
/**
 * Gamification Utility Functions
 * Matches logic from supabase/migrations/20251125122500_gamification_rpg.sql
 */

export const getRankTitle = (level: number): string => {
    if (level <= 5) return 'Ferro'
    if (level <= 15) return 'Aço'
    if (level <= 30) return 'Bronze'
    if (level <= 50) return 'Prata'
    if (level <= 75) return 'Ouro'
    if (level <= 99) return 'Titanium'
    return 'Diamante Negro'
}

export const calculateLevel = (xp: number): number => {
    if (xp < 100) return 1
    // Updated: XP = 100 * level^1.5 => level = (XP / 100)^(1/1.5)
    return Math.floor(Math.pow(xp / 100.0, 1 / 1.5))
}

export const getNextLevelXP = (level: number): number => {
    return Math.floor(Math.pow(level + 1, 1.5) * 100)
}

export const getLevelProgress = (currentXP: number, currentLevel: number) => {
    const currentLevelBaseXP = Math.floor(Math.pow(currentLevel, 1.5) * 100)
    const nextLevelXP = Math.floor(Math.pow(currentLevel + 1, 1.5) * 100)

    const xpInLevel = currentXP - currentLevelBaseXP
    const xpRequiredForNext = nextLevelXP - currentLevelBaseXP

    const progress = Math.min(100, Math.max(0, (xpInLevel / xpRequiredForNext) * 100))

    return {
        xpInLevel,
        xpRequiredForNext,
        progress
    }
}
