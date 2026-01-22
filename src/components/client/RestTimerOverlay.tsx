import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, SkipForward, X } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

interface RestTimerOverlayProps {
    isOpen: boolean
    onClose: () => void
    onAddSeconds: (seconds: number) => void
    secondsRemaining: number
    totalSeconds: number
}

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
    isOpen,
    onClose,
    onAddSeconds,
    secondsRemaining,
    totalSeconds
}) => {
    if (!isOpen) return null

    const progress = ((totalSeconds - secondsRemaining) / totalSeconds) * 100

    return (
        <div className="fixed inset-x-0 top-[4.5rem] mt-4 z-[60] px-4 animate-in slide-in-from-top-10 fade-in duration-300">
            <div className="bg-[#16a34a] backdrop-blur-xl border border-green-700/50 shadow-2xl rounded-2xl p-4 flex flex-col items-center gap-4 relative overflow-hidden text-white">
                {/* Background Progress Bar (Subtle) */}
                <div className="absolute inset-0 bg-white/20 pointer-events-none" style={{ width: `${100 - progress}%`, transition: 'width 1s linear' }} />

                <div className="flex items-center justify-between w-full relative z-10">
                    <div className="text-left">
                        <p className="text-xs text-green-100 uppercase tracking-wider font-bold">Descanso</p>
                        <h3 className="text-4xl font-mono font-bold text-white tabular-nums">
                            {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
                        </h3>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onAddSeconds(30)} className="h-10 px-4 rounded-full border-green-400/30 bg-green-700/30 text-white hover:bg-green-700/50 hover:text-white hover:border-green-400/50">
                            <Plus className="h-4 w-4 mr-1" /> 30s
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white/20 text-white hover:text-white">
                            <SkipForward className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
