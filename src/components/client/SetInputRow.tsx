import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkoutDraft } from '@/hooks/useWorkoutDraft'

interface SetInputRowProps {
    setNumber: number
    previousWeight?: number | null
    previousReps?: number | null
    currentLog?: any
    onSave: (weight: number, reps: number, isCompleted: boolean) => void
    isCompleted: boolean
    sessionId?: string | null
    exerciseId?: string
}

export const SetInputRow: React.FC<SetInputRowProps> = ({
    setNumber,
    previousWeight,
    previousReps,
    currentLog,
    onSave,
    isCompleted,
    sessionId, // New prop
    exerciseId // New prop
}) => {
    const [weight, setWeight] = useWorkoutDraft(
        sessionId,
        exerciseId,
        setNumber,
        'weight',
        currentLog?.weight
    )

    const [reps, setReps] = useWorkoutDraft(
        sessionId,
        exerciseId,
        setNumber,
        'reps',
        currentLog?.reps
    )

    const handleWeightChange = (val: string) => {
        // Auto-format comma to dot
        const formatted = val.replace(/,/g, '.')

        // Regex validation: Allows integers, and floats with up to 2 decimal places. 
        // We use ^\d*\.?\d{0,2}$ to allow intermediate typing like "12."
        if (formatted === '' || /^\d*\.?\d{0,2}$/.test(formatted)) {
            setWeight(formatted)
        }
    }

    const handleRepsChange = (val: string) => {
        // Only allow integers, remove non-digits
        const formatted = val.replace(/\D/g, '')
        setReps(formatted)
    }

    const handleRepsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Strict integer validation to block dots, commas, e, +, - at keystroke level
        if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault()
        }
    }

    const handleCheck = () => {
        const w = parseFloat(weight)
        const r = parseInt(reps)
        if (!isNaN(w) && !isNaN(r)) {
            onSave(w, r, !isCompleted)
        }
    }

    return (
        <div className={cn(
            "grid grid-cols-12 gap-2 items-center p-3 rounded-lg mb-2 transition-colors",
            isCompleted ? "bg-green-500/10 border border-green-500/20" : "bg-card border border-border"
        )}>
            {/* Set Indicator */}
            <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center">
                <span className="text-xs md:text-sm font-bold text-muted-foreground">#{setNumber}</span>
            </div>

            {/* Inputs */}
            <div className="col-span-8 md:col-span-9 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-[9px] uppercase text-muted-foreground font-bold pl-1">Kg</label>
                    <Input
                        type="text"
                        inputMode="decimal"
                        value={weight}
                        onChange={(e) => handleWeightChange(e.target.value)}
                        placeholder={previousWeight ? `${previousWeight}` : "-"}
                        className="h-12 text-lg font-bold text-center bg-muted/50 border-input"
                    />
                    {previousWeight && (
                        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/70">
                            <History className="h-3 w-3" />
                            <span>{previousWeight}kg</span>
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase text-muted-foreground font-bold pl-1">Reps</label>
                    <Input
                        type="number"
                        inputMode="numeric"
                        value={reps}
                        onChange={(e) => handleRepsChange(e.target.value)}
                        onKeyDown={handleRepsKeyDown}
                        placeholder={previousReps ? `${previousReps}` : "-"}
                        className="h-12 text-lg font-bold text-center bg-muted/50 border-input"
                    />
                    {previousReps && (
                        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/70">
                            <History className="h-3 w-3" />
                            <span>{previousReps}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <div className="col-span-3 md:col-span-2 flex justify-center">
                <Button
                    size="icon"
                    className={cn(
                        "h-10 w-10 md:h-12 md:w-12 rounded-xl transition-all",
                        isCompleted
                            ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                    onClick={handleCheck}
                >
                    {isCompleted ? <Check className="h-5 w-5 md:h-6 md:w-6" /> : <Check className="h-5 w-5 md:h-6 md:w-6" />}
                </Button>
            </div>
        </div>
    )
}
