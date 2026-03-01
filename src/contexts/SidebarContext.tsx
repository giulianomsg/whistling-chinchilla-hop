import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
    isSidebarCollapsed: boolean
    toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed)

    return (
        <SidebarContext.Provider value={{ isSidebarCollapsed, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebarContext = () => {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error('useSidebarContext must be used within a SidebarProvider')
    }
    return context
}
