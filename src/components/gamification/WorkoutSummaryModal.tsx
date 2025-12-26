import React, { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Star, ArrowRight, Share2, Download, Dumbbell, Clock, Activity, Loader2 } from 'lucide-react'
import { getLevelProgress, getRankTitle } from '@/utils/gamification'
import { supabase } from '@/integrations/supabase/client'
import confetti from 'canvas-confetti'
import html2canvas from 'html2canvas'
import { showError, showSuccess } from '@/utils/toast'

interface WorkoutSummaryModalProps {
    isOpen: boolean
    onClose: () => void
    xpEarned: number
    currentXP: number
    newLevel: number
    oldLevel: number
    workoutName?: string
    durationSeconds?: number
    totalLoadKg?: number
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
    isOpen,
    onClose,
    xpEarned,
    currentXP,
    newLevel,
    oldLevel,
    workoutName = "Treino Personalizado",
    durationSeconds = 0,
    totalLoadKg = 0
}) => {
    const [showLevelUp, setShowLevelUp] = useState(false)
    const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([])
    const [isSharing, setIsSharing] = useState(false)
    const shareCardRef = useRef<HTMLDivElement>(null)

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

    const formatDuration = (sec: number) => {
        const m = Math.floor(sec / 60)
        const h = Math.floor(m / 60)
        if (h > 0) return `${h}h ${m % 60}m`
        return `${m} min`
    }

    const handleShare = async () => {
        if (!shareCardRef.current) return
        setIsSharing(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const referralLink = user ? `capifit.app/ref=${user.id.substring(0, 8)}` : 'capifit.app'

            const canvas = await html2canvas(shareCardRef.current, {
                backgroundColor: '#09090b', // zinc-950 for dark mode feel
                scale: 2, // better quality
                useCORS: true
            })

            const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))

            if (!imageBlob) throw new Error("Falha ao gerar imagem")

            const file = new File([imageBlob], 'treino-capifit.png', { type: 'image/png' })
            const text = `🔥 Acabei de finalizar o treino "${workoutName}" no CapiFit! +${xpEarned}XP ganho.\n\nTreine como um pro: ${referralLink}`

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Meu Treino no CapiFit',
                    text: text,
                    files: [file]
                })
                showSuccess('Compartilhado!')
            } else {
                // Fallback: Download
                const link = document.createElement('a')
                link.href = canvas.toDataURL('image/png')
                link.download = 'treino-capifit.png'
                link.click()
                showSuccess('Imagem salva! Compartilhe nas redes.')
            }
        } catch (error) {
            console.error(error)
            showError('Erro ao compartilhar')
        } finally {
            setIsSharing(false)
        }
    }

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

                <DialogFooter className="flex-col sm:flex-col gap-3">
                    <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary" onClick={handleShare} disabled={isSharing}>
                        {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                        Compartilhar Progresso
                    </Button>
                    <Button className="w-full font-bold" onClick={onClose}>
                        Continuar <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>

                {/* HIDDEN SHARE CARD (Available for Screenshot) */}
                <div className="absolute left-[-9999px] top-0">
                    <div ref={shareCardRef} className="w-[1080px] h-[1920px] bg-zinc-950 text-white p-12 flex flex-col items-center justify-between font-sans relative overflow-hidden">
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/3" />

                        {/* Top: Logo & Date */}
                        <div className="z-10 w-full flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary p-3 rounded-xl">
                                    <Dumbbell className="h-10 w-10 text-primary-foreground" />
                                </div>
                                <h1 className="text-5xl font-black tracking-tighter">CapiFit</h1>
                            </div>
                            <div className="text-2xl font-mono text-zinc-400">
                                {new Date().toLocaleDateString('pt-BR')}
                            </div>
                        </div>

                        {/* Middle: Content */}
                        <div className="z-10 w-full flex-1 flex flex-col justify-center items-center gap-12 text-center">
                            <div className="space-y-4">
                                <p className="text-3xl text-primary font-bold tracking-widest uppercase">Treino Finalizado</p>
                                <h2 className="text-7xl font-black leading-tight max-w-4xl">
                                    {workoutName}
                                </h2>
                            </div>

                            <div className="grid grid-cols-3 gap-8 w-full max-w-3xl">
                                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl flex flex-col items-center gap-2 backdrop-blur-sm">
                                    <Clock className="h-12 w-12 text-blue-500 mb-2" />
                                    <span className="text-5xl font-bold">{formatDuration(durationSeconds)}</span>
                                    <span className="text-xl text-zinc-500 uppercase font-bold">Duração</span>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl flex flex-col items-center gap-2 backdrop-blur-sm">
                                    <Activity className="h-12 w-12 text-green-500 mb-2" />
                                    <span className="text-5xl font-bold">+{xpEarned}</span>
                                    <span className="text-xl text-zinc-500 uppercase font-bold">XP Ganho</span>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl flex flex-col items-center gap-2 backdrop-blur-sm">
                                    <Dumbbell className="h-12 w-12 text-purple-500 mb-2" />
                                    <span className="text-5xl font-bold">{(totalLoadKg / 1000).toFixed(1)}t</span>
                                    <span className="text-xl text-zinc-500 uppercase font-bold">Volume</span>
                                </div>
                            </div>

                            <div className="py-8">
                                <div className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-3xl font-bold">
                                    {getRankTitle(newLevel)} • Nível {newLevel}
                                </div>
                            </div>
                        </div>

                        {/* Bottom: Footer & CTA */}
                        <div className="z-10 w-full text-center space-y-6">
                            <p className="text-3xl font-light italic text-zinc-300">
                                "A consistência é o segredo do sucesso."
                            </p>
                            <div className="pt-8 border-t border-zinc-800 flex justify-between items-end">
                                <div className="text-left">
                                    <p className="text-xl text-zinc-500">Baixe o app</p>
                                    <p className="text-3xl font-bold text-white">capifit.app/download</p>
                                </div>
                                <div className="text-right">
                                    <div className="bg-white text-black text-xs font-bold px-2 py-1 rounded inline-block mb-1">BETA</div>
                                    <p className="text-xl text-zinc-500 font-mono">Build {new Date().getFullYear()}.1</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
