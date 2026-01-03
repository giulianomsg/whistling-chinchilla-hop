import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getProfessionalTypeInfo } from '@/utils/professionalTypes'

interface Professional {
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
    overall_rating: number
    review_count: number
}

interface ProfessionalCardProps {
    professional: Professional
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional }) => {
    const navigate = useNavigate()

    const coverImage = professional.cover_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'; // Default placeholder

    return (
        <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 border-border bg-card overflow-hidden group">
            {/* Cover Image */}
            <div className="h-28 w-full bg-muted relative overflow-hidden">
                <img
                    src={coverImage}
                    alt="Capa"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
            </div>

            <div className="px-6 relative flex-1 flex flex-col">
                {/* Avatar overlapping cover */}
                <div className="-mt-12 mb-3 flex justify-between items-end">
                    <Avatar className="h-24 w-24 border-4 border-card shadow-md">
                        <AvatarImage src={professional.avatar_url || undefined} alt={professional.full_name} className="object-cover" />
                        <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                            {professional.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Rating Badge */}
                    <div className="mb-2 flex items-center gap-1 bg-card/90 backdrop-blur border border-border px-2 py-1 rounded-full shadow-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="font-bold text-sm">{typeof professional.overall_rating === 'number' ? professional.overall_rating.toFixed(1) : '0.0'}</span>
                        <span className="text-muted-foreground text-[10px] ml-1">({professional.review_count})</span>
                    </div>
                </div>

                {/* Professional Info */}
                <div className="mb-1">
                    <h3 className="font-bold text-lg leading-tight text-foreground truncate" title={professional.full_name}>
                        {professional.full_name}
                    </h3>
                    {(professional.city || professional.state) && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                            <MapPin className="h-3 w-3" />
                            {professional.city}{professional.city && professional.state && ', '}{professional.state}
                        </div>
                    )}
                </div>

                {/* Specialties Icons Row */}
                <div className="flex flex-wrap gap-2 my-3">
                    {professional.specialties?.slice(0, 4).map((spec, i) => {
                        if (typeof spec !== 'string') return null;
                        const info = getProfessionalTypeInfo(spec);
                        const Icon = info.icon;
                        return (
                            <div key={i} className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded text-[10px] font-medium text-secondary-foreground border border-secondary">
                                <Icon className={`h-3 w-3 ${info.color}`} />
                                <span className="truncate max-w-[80px]">{info.label}</span>
                            </div>
                        )
                    })}
                    {professional.specialties && professional.specialties.length > 4 && (
                        <Badge variant="outline" className="text-[10px] h-6 px-1.5">+{professional.specialties.length - 4}</Badge>
                    )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {professional.bio || "Este profissional ainda não adicionou uma biografia."}
                </p>

                {professional.years_experience > 0 && (
                    <div className="mt-auto mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>{professional.years_experience} anos de experiência</span>
                    </div>
                )}
            </div>

            <CardFooter className="p-4 pt-0 mt-auto">
                <Button className="w-full font-bold shadow-md" onClick={() => navigate(`/app/marketplace/${professional.id}`)}>
                    Ver Perfil Completo
                </Button>
            </CardFooter>
        </Card>
    )
}
