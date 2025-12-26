import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Star, MapPin, Briefcase, Instagram, Linkedin, MessageCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FullProfessional {
    id: string
    full_name: string
    avatar_url: string | null
    bio: string | null
    specialties: string[] | null
    price_range: string | null
    years_experience: number
    city: string | null
    state: string | null
    instagram_url: string | null
    linkedin_url: string | null
    overall_rating: number
    review_count: number
}

interface Review {
    id: string
    rating_punctuality: number
    rating_didactics: number
    rating_knowledge: number
    rating_monitoring: number
    comment: string
    created_at: string
    client_name: string
    client_avatar: string
}

const ProfessionalDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [professional, setProfessional] = useState<FullProfessional | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchData(id)
        }
    }, [id])

    const fetchData = async (profId: string) => {
        setLoading(true)
        try {
            // Fetch Professional Data
            const { data: profData, error: profError } = await supabase
                .from('marketplace_professionals_view')
                .select('*')
                .eq('id', profId)
                .single()

            if (profError) throw profError
            setProfessional(profData)

            // Fetch Reviews
            const { data: reviewsData, error: reviewsError } = await supabase
                .rpc('get_professional_reviews_details', { prof_id: profId })

            if (reviewsError) throw reviewsError
            setReviews(reviewsData || [])

        } catch (error) {
            console.error(error)
            toast.error('Erro ao carregar detalhes do profissional')
            navigate('/app/marketplace')
        } finally {
            setLoading(false)
        }
    }

    const handleStartChat = () => {
        // Navigate to chat with a special state/param
        // We will need to update Chat.tsx to handle this
        navigate('/app/chat', { state: { startChatWith: professional?.id } })
    }

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    if (!professional) return null

    return (
        <div className="min-h-screen bg-background pb-12">

            {/* Hero Section */}
            <div className="bg-muted/30 border-b border-border">
                <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
                    <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
                            <AvatarImage src={professional.avatar_url || ''} />
                            <AvatarFallback className="text-4xl">{professional.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{professional.full_name}</h1>

                                <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                                    {(professional.city || professional.state) && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            <span>{professional.city}{professional.city && professional.state && ', '}{professional.state}</span>
                                        </div>
                                    )}
                                    {professional.years_experience > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="h-4 w-4" />
                                            <span>{professional.years_experience} Anos de Experiência</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {professional.specialties?.map(spec => (
                                    <Badge key={spec} variant="secondary" className="text-sm px-3 py-1">
                                        {spec}
                                    </Badge>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                                {professional.instagram_url && (
                                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(professional.instagram_url!, '_blank')}>
                                        <Instagram className="h-4 w-4" /> Instagram
                                    </Button>
                                )}
                                {professional.linkedin_url && (
                                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(professional.linkedin_url!, '_blank')}>
                                        <Linkedin className="h-4 w-4" /> LinkedIn
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
                            <div className="bg-card border border-border rounded-xl p-4 text-center shadow-sm">
                                <div className="flex items-center justify-center gap-2 text-yellow-500 mb-1">
                                    <Star className="h-6 w-6 fill-current" />
                                    <span className="text-3xl font-bold text-foreground">{professional.overall_rating.toFixed(1)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{professional.review_count} avaliações</p>
                            </div>

                            <Button size="lg" className="w-full font-bold shadow-lg shadow-primary/20" onClick={handleStartChat}>
                                <MessageCircle className="mr-2 h-5 w-5" /> Iniciar Conversa
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Bio & Details */}
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold mb-4">Sobre o Profissional</h2>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {professional.bio || "Nenhuma biografia disponível."}
                        </p>
                    </section>

                    <Separator />

                    <section>
                        <h2 className="text-xl font-bold mb-6">Avaliações e Feedback</h2>

                        <div className="space-y-6">
                            {reviews.length > 0 ? reviews.map(review => (
                                <Card key={review.id} className="bg-card border-border">
                                    <CardHeader className="flex flex-row items-start gap-4 pb-2">
                                        <Avatar>
                                            <AvatarImage src={review.client_avatar} />
                                            <AvatarFallback>C</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold">{review.client_name}</h4>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map(star => {
                                                    // Calculate average of this specific review for display
                                                    const avg = (review.rating_didactics + review.rating_knowledge + review.rating_monitoring + review.rating_punctuality) / 4
                                                    return (
                                                        <Star
                                                            key={star}
                                                            className={`h-3 w-3 ${star <= avg ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                                                        />
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-foreground/80">{review.comment}</p>

                                        {/* Optional: Show detailed breakdown */}
                                        <div className="mt-3 flex gap-4 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                            <span title="Pontualidade">🕒 {review.rating_punctuality.toFixed(1)}</span>
                                            <span title="Didática">📚 {review.rating_didactics.toFixed(1)}</span>
                                            <span title="Conhecimento">🧠 {review.rating_knowledge.toFixed(1)}</span>
                                            <span title="Acompanhamento">👀 {review.rating_monitoring.toFixed(1)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <p className="text-muted-foreground italic">Este profissional ainda não recebeu avaliações.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Sticky Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Informações Adicionais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Faixa de Preço</span>
                                <span className="font-medium">{professional.price_range || 'Sob Consulta'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="text-muted-foreground">Experiência</span>
                                <span className="font-medium">{professional.years_experience} anos</span>
                            </div>
                            {/* Add more info if needed */}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}

export default ProfessionalDetails
