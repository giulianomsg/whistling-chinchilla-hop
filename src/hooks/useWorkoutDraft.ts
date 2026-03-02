import { useState, useEffect, useRef } from 'react'
import { getSetState, saveSetState } from '@/utils/workoutStorage'

export function useWorkoutDraft(
    sessionId: string | null | undefined,
    exerciseId: string | undefined,
    setNumber: number,
    field: 'weight' | 'reps',
    initialValueFromDB: string | null | undefined
) {
    // Lazy initialization from cache or DB
    const [value, setValue] = useState<string>(() => {
        if (initialValueFromDB !== undefined && initialValueFromDB !== null) {
            return initialValueFromDB.toString()
        }
        if (sessionId && exerciseId) {
            const saved = getSetState(sessionId, exerciseId, setNumber)
            if (saved && saved[field]) {
                return saved[field]
            }
        }
        return ''
    })

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

    // Sync with DB if it changes (e.g. from another device or after a save)
    useEffect(() => {
        if (initialValueFromDB !== undefined && initialValueFromDB !== null) {
            setValue(initialValueFromDB.toString())
        }
        // We intentionally don't clear it if DB becomes null because 
        // we want to keep the local draft until explicitly cleared.
    }, [initialValueFromDB])

    const setDraftValue = (newValue: string) => {
        setValue(newValue)

        if (!sessionId || !exerciseId) return

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        debounceTimeout.current = setTimeout(() => {
            saveSetState(sessionId, exerciseId, setNumber, { [field]: newValue })
        }, 300)
    }

    return [value, setDraftValue] as const
}
