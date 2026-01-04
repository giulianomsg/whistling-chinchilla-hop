import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, Star, User, Phone, Award, Shield, MapPin, Calendar, MessageSquare, Send } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts'
import { showSuccess, showError } from '@/utils/toast'
import { SubscriptionCard } from '@/components/marketplace/SubscriptionCard'
import { CheckoutModal } from '@/components/marketplace/CheckoutModal'
import { SubscriptionPlan } from '@/types/financial'

const PublicProfile = () => {
    const { id } = useParams() // Professional ID
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [details, setDetails] = useState<any>(null)
    const [reputation, setReputation] = useState<any>(null)
    const [reviews, setReviews] = useState<any[]>([])
    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
    const [myReview, setMyReview] = useState({
        rating_punctuality: 5,
        rating_didactics: 5,
        rating_knowledge: 5,
        rating_monitoring: 5,
        comment: ''
    })

    useEffect(() => {
        if (id) loadProfile()
    }, [id])

    const loadProfile = async () => {
        try {
            setLoading(true)
            // 1. Fetch Basic Profile
            const { data: prof, error: profError } = await supabase.from('profiles').select('*').eq('id', id).single()
            if (profError) throw profError
            setProfile(prof)

            // 2. Fetch Professional Details
            const { data: det, error: detError } = await supabase.from('professional_details').select('*').eq('profile_id', id).maybeSingle()
            setDetails(det)

            // 3. Fetch Reputation Stats
            const { data: rep, error: repError } = await supabase.rpc('get_professional_reputation', { prof_id: id })
            if (!repError && rep.length > 0) setReputation(rep[0])

            // 4. Fetch Reviews
            const { data: revs, error: revError } = await supabase
                .from('professional_reviews')
                .select('*, client:profiles!client_id(full_name, avatar_url)')
                .eq('professional_id', id)
                .order('created_at', { ascending: false })

            if (!revError) setReviews(revs || [])

            // 5. Fetch Subscription Plans
            const { data: plansData } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('professional_id', id)
                .eq('active', true)
                .order('price', { ascending: true })

            if (plansData) setPlans(plansData as SubscriptionPlan[])

        } catch (error: any) {
            console.error(error)
            showError('Erro ao carregar perfil')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitReview = async () => {
        if (!user) return
        try {
            const payload = {
                professional_id: id,
                client_id: user.id,
                ...myReview
            }
            const { error } = await supabase.from('professional_reviews').insert(payload)
            if (error) {
                if (error.code === '23505') throw new Error('Você já avaliou este profissional.')
                throw error
            }
            showSuccess('Avaliação enviada!')
            setIsReviewOpen(false)
            loadProfile() // Reload to update stats
        } catch (e: any) {
            showError(e.message || 'Erro ao enviar')
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
    if (!profile) return <div className="text-center p-12">Profissional não encontrado.</div>

    const radarData = reputation ? [
        { subject: 'Pontualidade', A: reputation.avg_punctuality || 0, fullMark: 5 },
        { subject: 'Didática', A: reputation.avg_didactics || 0, fullMark: 5 },
        { subject: 'Conhecimento', A: reputation.avg_knowledge || 0, fullMark: 5 },
        { subject: 'Acompanhamento', A: reputation.avg_monitoring || 0, fullMark: 5 },
    ] : []

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Profissional */}
                <div className="relative mb-12 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                    {/* Cover Image */}
                    <div className="h-36 md:h-64 w-full relative">
                        <img
                            src={details?.cover_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'}
                            alt="Capa"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                    </div>

                    <div className="px-6 pb-8 pt-16 md:pt-32 relative">
                        {/* Avatar Overlapping */}
                        <div className="absolute -top-16 left-6 md:left-10">
                            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-card shadow-xl">
                                <AvatarImage src={profile.avatar_url} className="object-cover" />
                                <AvatarFallback className="text-4xl">{profile.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Reputation Badge (Absolute) */}
                        {reputation && (
                            <div className="absolute top-4 right-4 md:top-6 md:right-8 bg-card/90 backdrop-blur p-3 rounded-xl border border-border shadow-sm flex flex-col items-center">
                                <div className="text-3xl font-bold text-primary">{reputation.overall_score || 'N/A'}</div>
                                <div className="flex text-yellow-500">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-3 w-3 ${s <= Math.round(reputation.overall_score) ? 'fill-current' : 'text-muted'}`} />)}
                                </div>
                                <span className="text-[10px] text-muted-foreground">{reputation.total_reviews} avaliações</span>
                            </div>
                        )}

                        <div className="space-y-4 mt-2">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">{profile.full_name}</h1>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {(() => {
                                        let specs = details?.specialty;
                                        if (typeof specs === 'string') {
                                            specs = [specs];
                                        } else if (!Array.isArray(specs)) {
                                            specs = []; // Handle null/undefined
                                        }

                                        if (specs.length === 0) return <Badge variant="secondary">Profissional</Badge>;

                                        return specs.map((s: string) => {
                                            const label = {
                                                'personal_trainer': 'Personal Trainer',
                                                'nutritionist': 'Nutricionista',
                                                'sports_doctor': 'Médico do Esporte',
                                                'clinic': 'Clínica / Estúdio',
                                                'performance_coach': 'Performance Coach'
                                            }[s] || s;
                                            return <Badge key={s} variant="secondary" className="text-sm px-3">{label}</Badge>
                                        });
                                    })()}
                                </div>
                                {details?.bio && <p className="text-muted-foreground mt-4 max-w-3xl text-base leading-relaxed">{details.bio}</p>}
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                {details?.whatsapp && (
                                    <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md transition-all hover:scale-105" onClick={() => window.open(`https://wa.me/${details.whatsapp.replace(/\D/g, '')}`, '_blank')}>
                                        <Phone className="h-4 w-4" /> WhatsApp
                                    </Button>
                                )}
                                {details?.telegram && (
                                    <Button size="sm" className="gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all hover:scale-105" onClick={() => window.open(`https://t.me/${details.telegram.replace('@', '')}`, '_blank')}>
                                        <Send className="h-4 w-4" /> Telegram
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reputação e Certificações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Radar Chart */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Reputação Multicritério</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center">
                            {radarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                        <Radar name="Profissional" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                                        <Tooltip cursor={{ strokeWidth: 0 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-muted-foreground">Sem dados suficientes ainda.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Certificações e Info */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Credenciais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-foreground mb-1">Certificações & Licenças</h4>
                                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground whitespace-pre-wrap">
                                    {(() => {
                                        const certs = details?.certifications;
                                        if (!certs) return 'Não informado.';
                                        if (typeof certs === 'string') return certs;
                                        if (typeof certs === 'object' && certs.raw_text) return String(certs.raw_text);
                                        return 'Não informado.';
                                    })()}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground mb-1">Valor da Consulta</h4>
                                <p className="text-xl font-bold text-green-500">
                                    {details?.consultation_price ? `R$ ${details.consultation_price.toFixed(2)}` : 'Sob consulta'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Planos de Consultoria (Marketplace) */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                        <Award className="h-6 w-6 text-primary" /> Planos de Consultoria
                    </h2>
                    {plans.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <Card className="bg-muted/20 border-border border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                <Shield className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground font-medium">Este profissional ainda não disponibilizou planos públicos.</p>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Avaliações */}
                <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Avaliações ({reviews?.length || 0})</CardTitle>

                        {user && user.id !== id && (
                            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                                <DialogTrigger asChild>
                                    <Button>Avaliar Profissional</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Avaliar {profile.full_name}</DialogTitle>
                                        <CardDescription>Sua opnião é fundamental para a reputação do profissional.</CardDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        {[
                                            { key: 'rating_punctuality', label: 'Pontualidade' },
                                            { key: 'rating_didactics', label: 'Didática' },
                                            { key: 'rating_knowledge', label: 'Conhecimento Técnico' },
                                            { key: 'rating_monitoring', label: 'Acompanhamento' },
                                        ].map((crit) => (
                                            <div key={crit.key} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <Label>{crit.label}</Label>
                                                    <span className="text-sm font-bold text-primary">{(myReview as any)[crit.key]}/5</span>
                                                </div>
                                                <Slider
                                                    value={[(myReview as any)[crit.key]]}
                                                    min={1} max={5} step={1}
                                                    onValueChange={([val]) => setMyReview(prev => ({ ...prev, [crit.key]: val }))}
                                                />
                                            </div>
                                        ))}
                                        <div className="space-y-2">
                                            <Label>Comentário (Opcional)</Label>
                                            <Textarea
                                                placeholder="Conte sua experiência..."
                                                value={myReview.comment}
                                                onChange={(e) => setMyReview(prev => ({ ...prev, comment: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleSubmitReview}>Enviar Avaliação</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={rev.client?.avatar_url} />
                                        <AvatarFallback>{rev.client?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-foreground">{rev.client?.full_name}</h4>
                                            <span className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 my-1">
                                            {/* Calculate average of this specific review for display star count */}
                                            {(() => {
                                                const avg = Math.round((rev.rating_punctuality + rev.rating_didactics + rev.rating_knowledge + rev.rating_monitoring) / 4)
                                                return [1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} className={`h-3 w-3 ${s <= avg ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} />
                                                ))
                                            })()}
                                        </div>
                                        {rev.comment && <p className="text-sm text-muted-foreground mt-2">"{rev.comment}"</p>}

                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground/60">
                                            <span>Pontualidade: {rev.rating_punctuality}</span>
                                            <span>Didática: {rev.rating_didactics}</span>
                                            <span>Conhecimento: {rev.rating_knowledge}</span>
                                            <span>Acompanhamento: {rev.rating_monitoring}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {reviews.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma avaliação ainda.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
            {selectedPlan && id && (
                <CheckoutModal
                    open={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    plan={selectedPlan}
                    professionalId={id}
                />
            )}
        </div>
    )
}

// Recharts Tooltip requires custom components sometimes to avoid default style issues, but inline style works too.
import { Tooltip } from 'recharts';

export default PublicProfile
