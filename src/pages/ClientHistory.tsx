import React from 'react'
import { History } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import WorkoutHistoryFeed from '@/components/client/WorkoutHistoryFeed'

const ClientHistory: React.FC = () => {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-lg"><History className="h-6 w-6 text-purple-500" /></div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Histórico de Treinos</h1>
                        <p className="text-muted-foreground">Seus treinos concluídos</p>
                    </div>
                </div>

                {user && <WorkoutHistoryFeed clientId={user.id} />}
            </div>
        </div>
    )
}

export default ClientHistory
