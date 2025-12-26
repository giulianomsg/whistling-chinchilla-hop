import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Professional {
    id: string
    full_name: string
    avatar_url: string | null
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

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 border-border bg-card">
            <CardHeader className="p-6 pb-0 flex flex-row gap-4 items-center">
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                    <AvatarImage src={professional.avatar_url || undefined} alt={professional.full_name} />
                    <AvatarFallback>{professional.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-lg leading-tight text-foreground">{professional.full_name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500 mt-1">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="font-semibold text-sm">{typeof professional.overall_rating === 'number' ? professional.overall_rating.toFixed(1) : '0.0'}</span>
                        <span className="text-muted-foreground text-xs ml-1">({professional.review_count} avaliações)</span>
                    </div>
                    {(professional.city || professional.state) && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                            <MapPin className="h-3 w-3" />
                            {professional.city}{professional.city && professional.state && ', '}{professional.state}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                    {professional.specialties?.slice(0, 3).map((spec, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-secondary/50 hover:bg-secondary/70">
                            {spec}
                        </Badge>
                    ))}
                    {professional.specialties && professional.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{professional.specialties.length - 3}</Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {professional.bio || "Este profissional ainda não adicionou uma biografia."}
                </p>

                <div className="mt-4 flex items-center gap-4 text-sm text-foreground/80">
                    {professional.years_experience > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span>{professional.years_experience} anos exp.</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Button className="w-full font-semibold" onClick={() => navigate(`/app/marketplace/${professional.id}`)}>
                    Ver Perfil Completo
                </Button>
            </CardFooter>
        </Card>
    )
}
