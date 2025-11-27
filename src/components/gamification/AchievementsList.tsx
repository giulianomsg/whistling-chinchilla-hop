import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, Lock, Star } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface Achievement {
    id: string
    code: string
    name: string
    description: string
    xp_reward: number
    icon_url: string | null
}

interface UserAchievement {
    achievement_id: string
    unlocked_at: string
}

export const AchievementsList: React.FC = () => {
    const { user } = useAuth()
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [userAchievements, setUserAchievements] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            try {
                // Fetch all achievements
                const { data: allAchievements } = await supabase
                    .from('achievements')
                    .select('*')
                    .order('xp_reward', { ascending: true })

                // Fetch user unlocked achievements
                const { data: unlocked } = await supabase
                    .from('user_achievements')
                    .select('achievement_id, unlocked_at')
                    .eq('user_id', user.id)

                if (allAchievements) setAchievements(allAchievements)
                if (unlocked) {
                    setUserAchievements(new Set(unlocked.map(ua => ua.achievement_id)))
                }
            } catch (error) {
                console.error('Error fetching achievements:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    if (loading) return <div className="text-center py-4">Carregando conquistas...</div>

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Conquistas
                    <Badge variant="secondary" className="ml-auto">
                        {userAchievements.size} / {achievements.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement) => {
                            const isUnlocked = userAchievements.has(achievement.id)
                            return (
                                <div
                                    key={achievement.id}
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-lg border transition-all",
                                        isUnlocked
                                            ? "bg-card border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                                            : "bg-muted/50 border-border opacity-70 grayscale"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                                        isUnlocked ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600" : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                                    )}>
                                        {isUnlocked ? <Star className="h-6 w-6 fill-current" /> : <Lock className="h-6 w-6" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate pr-2 flex items-center gap-2">
                                            {achievement.name}
                                            {isUnlocked && <Badge variant="outline" className="text-[10px] h-4 border-yellow-500 text-yellow-500">Desbloqueado</Badge>}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {achievement.description}
                                        </p>
                                        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                                            <span>+{achievement.xp_reward} XP</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
