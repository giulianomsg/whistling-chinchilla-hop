import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { ProfessionalCard } from '@/components/marketplace/ProfessionalCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, Filter } from 'lucide-react'

// Define the interface based on the View structure
interface MarketplaceProfessional {
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

const ProfessionalMarketplace: React.FC = () => {
    const [professionals, setProfessionals] = useState<MarketplaceProfessional[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
    const [sortOrder, setSortOrder] = useState<string>('rating_desc')

    // Derived list of unique specialties for filter
    const [allSpecialties, setAllSpecialties] = useState<string[]>([])

    useEffect(() => {
        fetchProfessionals()
    }, [])

    const fetchProfessionals = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('marketplace_professionals_view')
                .select('*')

            if (error) throw error

            setProfessionals(data || [])

            // Extract unique specialties
            const specs = new Set<string>()
            data?.forEach(p => {
                p.specialties?.forEach((s: string) => specs.add(s))
            })
            setAllSpecialties(Array.from(specs).sort())

        } catch (error) {
            console.error('Error fetching professionals:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter Logic
    const filteredProfessionals = professionals.filter(p => {
        const matchesSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.bio?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSpecialty = selectedSpecialty === 'all' || p.specialties?.includes(selectedSpecialty)

        return matchesSearch && matchesSpecialty
    })

    // Sort Logic
    const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
        if (sortOrder === 'rating_desc') return b.overall_rating - a.overall_rating
        if (sortOrder === 'reviews_desc') return b.review_count - a.review_count
        if (sortOrder === 'exp_desc') return b.years_experience - a.years_experience
        return 0
    })

    return (
        <div className="min-h-screen bg-background py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Encontre seu Profissional</h1>
                        <p className="text-muted-foreground mt-1">Conecte-se com os melhores especialistas para seus objetivos.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou bio..."
                            className="pl-9 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                            <SelectTrigger className="w-full md:w-[200px] bg-background">
                                <SelectValue placeholder="Especialidade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas Especialidades</SelectItem>
                                {allSpecialties.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="w-full md:w-[180px] bg-background">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rating_desc">Melhor Avaliados</SelectItem>
                                <SelectItem value="reviews_desc">Mais Populares</SelectItem>
                                <SelectItem value="exp_desc">Mais Experientes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {sortedProfessionals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {sortedProfessionals.map(prof => (
                                    <ProfessionalCard key={prof.id} professional={prof} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground bg-accent/20 rounded-xl border border-dashed border-border">
                                <p className="text-lg">Nenhum profissional encontrado com os filtros atuais.</p>
                                <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedSpecialty('all') }}>Limpar Filtros</Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default ProfessionalMarketplace
