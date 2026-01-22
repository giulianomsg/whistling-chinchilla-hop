import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ConfirmOptions {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<ConfirmOptions>({ title: '', description: '' })
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

    const confirm = (opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts)
        setIsOpen(true)
        return new Promise((resolve) => {
            setResolveRef(() => resolve)
        })
    }

    const handleConfirm = () => {
        setIsOpen(false)
        resolveRef?.(true)
    }

    const handleCancel = () => {
        setIsOpen(false)
        resolveRef?.(false)
    }

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="bg-card p-6 rounded-2xl shadow-xl border border-border max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-2 text-foreground">{options.title}</h3>
                        <p className="text-muted-foreground text-sm mb-6">{options.description}</p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={handleCancel} className="flex-1">
                                {options.cancelText || 'Cancelar'}
                            </Button>
                            <Button
                                variant={options.variant || 'default'}
                                onClick={handleConfirm}
                                className="flex-1 font-bold"
                            >
                                {options.confirmText || 'Confirmar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    )
}

export const useConfirm = () => {
    const context = useContext(ConfirmContext)
    if (!context) throw new Error('useConfirm must be used within a ConfirmProvider')
    return context
}
