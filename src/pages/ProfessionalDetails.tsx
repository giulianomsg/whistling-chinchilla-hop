import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Star, MapPin, Briefcase, Instagram, Linkedin, MessageCircle, ArrowLeft, User, FileText, Mail, Phone, ExternalLink, Scroll, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getProfessionalTypeInfo } from '@/utils/professionalTypes'
import { SubscriptionCard } from '@/components/marketplace/SubscriptionCard'
import { CheckoutModal } from '@/components/marketplace/CheckoutModal'
import { SubscriptionPlan } from '@/types/financial'

interface FullProfessional {
    id: string
    full_name: string
    avatar_url: string | null
    cover_url?: string | null
    bio: string | null
    specialties: string[] | null
    price_range: string | null
    years_experience: number
    city: string | null
    state: string | null
    instagram_url: string | null
    linkedin_url: string | null
    phone: string | null
    whatsapp: string | null
    telegram: string | null
    email: string | null
    data_nascimento: string | null
    professional_type: string | null
    certifications: any
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

    // Marketplace State
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

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

            // Fetch Plans
            const { data: plansData } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('professional_id', profId)
                .eq('active', true)
                .order('price', { ascending: true })

            if (plansData) {
                setPlans(plansData as SubscriptionPlan[])
            }

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

    const calculateAge = (dateString: string | null) => {
        if (!dateString) return null
        const today = new Date()
        const birthDate = new Date(dateString)
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    if (!professional) return null

    return (
        <div className="min-h-screen bg-background pb-12">

            {/* Hero Section with Cover */}
            <div className="relative">
                {/* Cover Image Background */}
                <div className="w-full h-48 md:h-64 bg-muted overflow-hidden relative">
                    <img
                        src={professional.cover_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                        alt="Capa"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                    <Button variant="ghost" className="absolute top-4 left-4 text-white hover:bg-black/20 hover:text-white" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                </div>

                <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                        <Avatar className="h-32 w-32 md:h-48 md:w-48 border-4 border-background shadow-xl rounded-2xl">
                            <AvatarImage src={professional.avatar_url || ''} className="object-cover" />
                            <AvatarFallback className="text-4xl">{professional.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3 pt-6 md:pt-20">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-bold text-foreground drop-shadow-sm">{professional.full_name}</h1>

                                <div className="flex flex-wrap items-center gap-4 mt-3 text-muted-foreground">
                                    {(professional.city || professional.state) && (
                                        <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1 rounded-full border border-border/50 text-sm">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span>{professional.city}{professional.city && professional.state && ', '}{professional.state}</span>
                                        </div>
                                    )}
                                    {professional.years_experience > 0 && (
                                        <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1 rounded-full border border-border/50 text-sm">
                                            <Briefcase className="h-4 w-4 text-primary" />
                                            <span>{professional.years_experience} Anos de Experiência</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {professional.specialties?.map(spec => {
                                    if (typeof spec !== 'string') return null;
                                    const info = getProfessionalTypeInfo(spec);
                                    const Icon = info.icon;
                                    return (
                                        <Badge key={spec} variant="secondary" className="text-sm px-3 py-1 gap-2 border-primary/20 bg-primary/5">
                                            <Icon className={`h-3.5 w-3.5 ${info.color}`} />
                                            {info.label}
                                        </Badge>
                                    )
                                })}
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

                        <div className="w-full md:w-auto flex flex-col gap-3 min-w-[240px] md:pt-20">
                            <div className="bg-card border border-border rounded-xl p-4 text-center shadow-lg">
                                <div className="flex items-center justify-center gap-2 text-yellow-500 mb-1">
                                    <Star className="h-7 w-7 fill-current" />
                                    <span className="text-4xl font-bold text-foreground">{professional.overall_rating.toFixed(1)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">{professional.review_count} avaliações</p>
                            </div>

                            <Button size="lg" className="w-full font-bold shadow-lg shadow-primary/20 h-12 text-md transition-all hover:scale-105" onClick={handleStartChat}>
                                <MessageCircle className="mr-2 h-5 w-5" /> Iniciar Conversa
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">

                {/* Left Column: Bio & Details */}
                <div className="md:col-span-2 space-y-8">
                    {/* Contact & Bio Card */}
                    <Card className="bg-card border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Sobre o Profissional</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Tags / Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {professional.specialties && professional.specialties.length > 0 && (
                                    <div className="sm:col-span-2 flex flex-col gap-2 p-4 bg-muted/50 rounded-xl border border-border/50">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Especialidades</p>
                                        <div className="flex flex-wrap gap-2">
                                            {professional.specialties.map(spec => {
                                                if (typeof spec !== 'string') return null;
                                                const info = getProfessionalTypeInfo(spec);
                                                const Icon = info.icon;
                                                return (
                                                    <div key={spec} className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg border border-border shadow-sm">
                                                        <div className={`p-1.5 rounded-full bg-primary/10 ${info.color}`}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium text-sm">{info.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {professional.city || professional.state ? (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="bg-primary/10 p-2 rounded-full"><MapPin className="h-4 w-4 text-primary" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">Localização</p>
                                            <p className="text-sm font-medium">{professional.city ? `${professional.city}, ` : ''}{professional.state || 'N/A'}</p>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="bg-blue-500/10 p-2 rounded-full"><Briefcase className="h-4 w-4 text-blue-500" /></div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Experiência</p>
                                        <p className="text-sm font-medium">{professional.years_experience} Anos</p>
                                    </div>
                                </div>

                                {professional.data_nascimento && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="bg-purple-500/10 p-2 rounded-full"><Calendar className="h-4 w-4 text-purple-500" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">Idade</p>
                                            <p className="text-sm font-medium">{calculateAge(professional.data_nascimento)} Anos</p>
                                        </div>
                                    </div>
                                )}

                                {professional.email && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="bg-orange-500/10 p-2 rounded-full"><Mail className="h-4 w-4 text-orange-500" /></div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                                            <a href={`mailto:${professional.email}`} className="text-sm font-medium truncate hover:underline block" title={professional.email}>{professional.email}</a>
                                        </div>
                                    </div>
                                )}

                                {professional.phone && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="bg-green-500/10 p-2 rounded-full"><Phone className="h-4 w-4 text-green-500" /></div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">Telefone</p>
                                            <a href={`tel:${professional.phone}`} className="text-sm font-medium hover:underline">{professional.phone}</a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Social / Contact Links */}
                            {(professional.whatsapp || professional.telegram) && (
                                <div className="flex flex-wrap gap-3">
                                    {professional.whatsapp && (
                                        <Button variant="outline" className="gap-2 text-green-600 hover:text-green-700 border-green-200 bg-green-50 hover:bg-green-100" onClick={() => window.open(`https://wa.me/${professional.whatsapp?.replace(/\D/g, '')}`, '_blank')}>
                                            <MessageCircle className="h-4 w-4" /> WhatsApp
                                        </Button>
                                    )}
                                    {professional.telegram && (
                                        <Button variant="outline" className="gap-2 text-blue-500 hover:text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100" onClick={() => window.open(`https://t.me/${professional.telegram?.replace('@', '')}`, '_blank')}>
                                            <ExternalLink className="h-4 w-4" /> Telegram
                                        </Button>
                                    )}
                                </div>
                            )}

                            <Separator />

                            {/* Bio */}
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" /> Biografia
                                </h3>
                                <p className="text-foreground/90 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                    {professional.bio || "Nenhuma biografia disponível."}
                                </p>
                            </div>

                            {/* Certifications - Only show if exists */}
                            {(() => {
                                const certs = professional.certifications;
                                let certText = '';

                                if (typeof certs === 'string') {
                                    certText = certs;
                                } else if (certs && typeof certs === 'object') {
                                    if (certs.raw_text) {
                                        certText = String(certs.raw_text);
                                    }
                                }

                                if (!certText) return null;

                                return (
                                    <>
                                        <Separator />
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <Scroll className="h-4 w-4" /> Certificações & Qualificações
                                            </h3>
                                            <div className="bg-muted/30 p-4 rounded-lg border border-border text-sm whitespace-pre-line">
                                                {certText}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>

                    <Separator className="my-6" />

                    {/* MARKETPLACE: PLANOS DE CONSULTORIA */}
                    <section>
                        <h2 className="text-xl font-bold mb-6">Planos de Consultoria</h2>
                        {plans.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {plans.map(plan => (
                                    <div key={plan.id} className="h-full">
                                        <SubscriptionCard
                                            plan={plan}
                                            onSelect={(p) => {
                                                setSelectedPlan(p)
                                                setIsCheckoutOpen(true)
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">Este profissional ainda não configurou planos públicos.</p>
                        )}
                    </section>

                    <Separator className="my-6" />

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

            {/* Modal de Pagamento */}
            {selectedPlan && professional && (
                <CheckoutModal
                    open={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    plan={selectedPlan}
                    professionalId={professional.id}
                />
            )}
        </div>
    )
}

export default ProfessionalDetails
