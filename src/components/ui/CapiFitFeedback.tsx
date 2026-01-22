import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'

// --- Types ---
export type FeedbackType = 'success' | 'error' | 'warning' | 'info'

interface ConfirmOptions {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
}

interface NotificationOptions {
    id?: string
    title: string
    description?: string
    type?: FeedbackType
    duration?: number
    dismissible?: boolean
}

// --- Event Bus for Non-React Calls (toast.ts) ---
type FeedbackEvent =
    | { type: 'NOTIFY'; payload: NotificationOptions }
    | { type: 'DISMISS'; payload: string }

class FeedbackService {
    private listeners: ((event: FeedbackEvent) => void)[] = []

    subscribe(listener: (event: FeedbackEvent) => void) {
        this.listeners.push(listener)
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    }

    notify(payload: NotificationOptions) {
        this.listeners.forEach(l => l({ type: 'NOTIFY', payload }))
    }

    dismiss(id: string) {
        this.listeners.forEach(l => l({ type: 'DISMISS', payload: id }))
    }
}

export const feedbackService = new FeedbackService()


// --- Context ---
interface FeedbackContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>
    notify: (options: NotificationOptions) => void
    dismiss: (id: string) => void
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

// --- Provider ---
export const GlobalFeedbackProvider = ({ children }: { children: ReactNode }) => {
    // Confirm State
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({ title: '', description: '' })
    const resolveRef = useRef<((value: boolean) => void) | null>(null)

    // Notification Queue (One at a time via Overlay? Or multiple?)
    // User asked for "padronizada ... inclusive o blur ao fundo".
    // Blur suggests modal-like focus.
    // If multiple toasts appear, do we blur for each?
    // Let's implement a Queue. One notification at a time if they overlap in time unless we stack them?
    // For "Blur Background" style, usually it's SINGLE focus.
    // So we show ONE notification. If another comes, it queues or replaces?
    // Let's queue them.
    const [notificationQueue, setNotificationQueue] = useState<NotificationOptions[]>([])
    const [activeNotification, setActiveNotification] = useState<NotificationOptions | null>(null)

    // Subscribe to Service
    useEffect(() => {
        return feedbackService.subscribe((event) => {
            if (event.type === 'NOTIFY') {
                addNotification(event.payload)
            } else if (event.type === 'DISMISS') {
                dismissNotification(event.payload)
            }
        })
    }, [])

    // Queue Processor
    useEffect(() => {
        if (!activeNotification && notificationQueue.length > 0) {
            const next = notificationQueue[0]
            setActiveNotification(next)
            setNotificationQueue(prev => prev.slice(1)) // Remove from queue

            // Auto Dismiss
            if (next.duration !== 0) { // 0 = infinite
                const time = next.duration || 3000
                setTimeout(() => {
                    dismissNotification(next.id || '')
                }, time)
            }
        }
    }, [activeNotification, notificationQueue])


    // --- Confirm Logic ---
    const confirm = (opts: ConfirmOptions): Promise<boolean> => {
        setConfirmOptions(opts)
        setConfirmOpen(true)
        return new Promise((resolve) => {
            resolveRef.current = resolve
        })
    }

    const handleConfirmClose = (result: boolean) => {
        setConfirmOpen(false)
        resolveRef.current?.(result)
        resolveRef.current = null
    }

    // --- Notification Logic ---
    const addNotification = (opts: NotificationOptions) => {
        const id = opts.id || Math.random().toString(36).substr(2, 9)
        setNotificationQueue(prev => [...prev, { ...opts, id }])
    }

    const dismissNotification = (id: string) => {
        // If active is this one, clear it.
        setActiveNotification(prev => (prev?.id === id ? null : prev))
    }

    // Helper to get Icon/Color
    const getFeedbackStyles = (type: FeedbackType = 'info') => {
        switch (type) {
            case 'success': return { icon: <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />, border: 'border-green-500/50' }
            case 'error': return { icon: <XCircle className="h-12 w-12 text-red-500 mb-4" />, border: 'border-red-500/50' }
            case 'warning': return { icon: <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />, border: 'border-yellow-500/50' }
            default: return { icon: <Info className="h-12 w-12 text-blue-500 mb-4" />, border: 'border-blue-500/50' }
        }
    }


    return (
        <FeedbackContext.Provider value={{ confirm, notify: addNotification, dismiss: dismissNotification }}>
            {children}

            {/* Confirmation Dialog (High Priority) */}
            {confirmOpen && (
                <div className="fixed inset-0 z-[10000] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="bg-card p-6 rounded-2xl shadow-2xl border border-border max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-2 text-foreground">{confirmOptions.title}</h3>
                        <p className="text-muted-foreground text-sm mb-6">{confirmOptions.description}</p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={() => handleConfirmClose(false)} className="flex-1">
                                {confirmOptions.cancelText || 'Cancelar'}
                            </Button>
                            <Button
                                variant={confirmOptions.variant || 'default'}
                                onClick={() => handleConfirmClose(true)}
                                className="flex-1 font-bold"
                            >
                                {confirmOptions.confirmText || 'Confirmar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Overlay (Lower Priority than Confirm, styles similar) */}
            {activeNotification && !confirmOpen && (
                <div className="fixed inset-0 z-[9999] bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div
                        className={`bg-card p-8 rounded-3xl shadow-2xl border-2 max-w-sm w-full animate-in slide-in-from-bottom-5 zoom-in-95 duration-300 ${getFeedbackStyles(activeNotification.type).border}`}
                        onClick={() => { if (activeNotification.dismissible !== false) dismissNotification(activeNotification.id!) }}
                    >
                        <div className="flex justify-center">
                            {getFeedbackStyles(activeNotification.type).icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">{activeNotification.title}</h3>
                        {activeNotification.description && <p className="text-muted-foreground text-sm mb-6">{activeNotification.description}</p>}

                        {(activeNotification.dismissible !== false) && (
                            <Button variant="outline" size="sm" onClick={() => dismissNotification(activeNotification.id!)}>
                                Fechar
                            </Button>
                        )}
                    </div>
                </div>
            )}

        </FeedbackContext.Provider>
    )
}

export const useFeedback = () => {
    const context = useContext(FeedbackContext)
    if (!context) throw new Error('useFeedback must be used within GlobalFeedbackProvider')
    return context
}
