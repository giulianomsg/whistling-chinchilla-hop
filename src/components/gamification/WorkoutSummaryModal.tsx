import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Star, ArrowRight, Share2 } from 'lucide-react'
import { getLevelProgress, getRankTitle } from '@/utils/gamification'
import { supabase } from '@/integrations/supabase/client'
import confetti from 'canvas-confetti'

interface WorkoutSummaryModalProps {
    isOpen: boolean
    onClose: () => void
    xpEarned: number
    currentXP: number
    newLevel: number
    oldLevel: number
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
    isOpen,
    onClose,
    xpEarned,
    currentXP,
    newLevel,
    oldLevel
}) => {
    const [showLevelUp, setShowLevelUp] = useState(false)
    const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([])

    const levelStats = getLevelProgress(currentXP, newLevel)
    const isLevelUp = newLevel > oldLevel

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })

            if (isLevelUp) {
                setTimeout(() => setShowLevelUp(true), 1000)
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500']
                })
            }

            // Fetch recently unlocked achievements (last 5 minutes)
            const fetchNewAchievements = async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

                const { data } = await supabase
                    .from('user_achievements')
                    .select('*, achievement:achievements(*)')
                    .eq('user_id', user.id)
                    .gt('unlocked_at', fiveMinutesAgo)

                if (data) setUnlockedAchievements(data.map(ua => ua.achievement))
            }

            fetchNewAchievements()
        }
    }, [isOpen, isLevelUp])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-gradient-to-b from-background to-background/95 border-border">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-2 animate-bounce">
                            <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        Treino Concluído!
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* XP Summary */}
                    <div className="text-center space-y-2">
                        <p className="text-muted-foreground">Você ganhou</p>
                        <div className="text-4xl font-black text-primary animate-in zoom-in duration-500">
                            +{xpEarned} XP
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Nível {newLevel}</span>
                            <span className="text-muted-foreground">{levelStats.xpInLevel} / {levelStats.xpRequiredForNext} XP</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${levelStats.progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                            Faltam {levelStats.xpRequiredForNext - levelStats.xpInLevel} XP para o próximo nível
                        </p>
                    </div>

                    {/* Level Up Alert */}
                    {isLevelUp && (
                        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center animate-in slide-in-from-bottom-4">
                            <h4 className="font-bold text-yellow-800 dark:text-yellow-200 flex items-center justify-center gap-2">
                                <Star className="h-5 w-5 fill-current" /> LEVEL UP!
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                Você agora é um <strong>{getRankTitle(newLevel)}</strong>
                            </p>
                        </div>
                    )}

                    {/* New Achievements */}
                    {unlockedAchievements.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-semibold text-center text-sm uppercase tracking-wider text-muted-foreground">Novas Conquistas</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {unlockedAchievements.map(achievement => (
                                    <div key={achievement.id} className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg animate-in fade-in slide-in-from-right">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600">
                                            <Trophy className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{achievement.name}</p>
                                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button className="w-full font-bold" onClick={onClose}>
                        Continuar <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    {/* Future: Share button */}
                    {/* <Button variant="outline" className="w-full">
            <Share2 className="ml-2 h-4 w-4" /> Compartilhar
          </Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
