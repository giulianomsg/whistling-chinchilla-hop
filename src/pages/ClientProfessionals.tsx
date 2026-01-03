import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, User, Eye, Dumbbell, Utensils } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { showError } from '@/utils/toast'

const ClientProfessionals = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [professionals, setProfessionals] = useState<any[]>([])

    useEffect(() => {
        if (user) fetchProfessionals()
    }, [user])

    const fetchProfessionals = async () => {
        try {
            setLoading(true)
            // Query linked professionals
            const { data, error } = await supabase
                .from('client_professionals')
                .select(`
                    id,
                    professional:profiles!professional_id (
                        id,
                        full_name,
                        avatar_url,
                        role,
                        professional_details (
                            specialty
                        )
                    )
                `)
                .eq('client_id', user?.id)
                .eq('status', 'active')

            if (error) throw error

            // Transform data structure if needed
            const formatted = data.map((item: any) => ({
                id: item.professional.id,
                full_name: item.professional.full_name,
                avatar_url: item.professional.avatar_url,
                // professional_details might be an array or single object depending on definition, usually single for 1:1 if defined correctly or array
                // Correctly handle professional_details relation and specialty array
                specialties: (() => {
                    const details = Array.isArray(item.professional.professional_details)
                        ? item.professional.professional_details[0]
                        : item.professional.professional_details;

                    let specs = details?.specialty;
                    if (typeof specs === 'string') specs = [specs];
                    if (!Array.isArray(specs)) specs = [];
                    return specs;
                })(),
                link_id: item.id
            }))

            setProfessionals(formatted)
        } catch (error: any) {
            console.error(error)
            showError('Erro ao carregar profissionais.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Meus Profissionais</h1>
                <p className="text-muted-foreground">Profissionais que acompanham sua evolução.</p>
            </div>

            {professionals.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">Nenhum profissional vinculado</h3>
                    <p className="text-muted-foreground">Você ainda não possui profissionais ativos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {professionals.map((prof) => (
                        <Card key={prof.id} className="border-border hover:border-primary/50 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <Avatar className="h-14 w-14 border border-border">
                                    <AvatarImage src={prof.avatar_url} className="object-cover" />
                                    <AvatarFallback>{prof.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{prof.full_name}</CardTitle>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {prof.specialties && prof.specialties.length > 0 ? (
                                            prof.specialties.slice(0, 2).map((s: string) => {
                                                const label = { 'personal_trainer': 'Personal', 'nutritionist': 'Nutri', 'sports_doctor': 'Médico', 'performance_coach': 'Coach' }[s] || s;
                                                return <Badge key={s} variant="secondary" className="text-[10px] px-1.5 h-5">{label}</Badge>
                                            })
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Profissional</span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-2">
                                <div className="flex gap-2 text-sm text-muted-foreground">
                                    <div className="bg-muted px-2 py-1 rounded flex items-center gap-1">
                                        <Dumbbell className="h-3 w-3" /> Treinos
                                    </div>
                                    <div className="bg-muted px-2 py-1 rounded flex items-center gap-1">
                                        <Utensils className="h-3 w-3" /> Dietas
                                    </div>
                                </div>
                                <Button
                                    className="w-full gap-2"
                                    onClick={() => navigate(`/app/profile/public/${prof.id}`)}
                                >
                                    <Eye className="h-4 w-4" /> Ver Perfil
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ClientProfessionals
