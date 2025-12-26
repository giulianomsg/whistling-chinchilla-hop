
import React, { useState, useEffect } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    LineChart,
    Line,
    Legend
} from 'recharts'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, TrendingUp, BarChart2 } from 'lucide-react'
import { useAnalyticsData, TimeRange } from '@/hooks/useAnalyticsData'

interface AnalyticsDashboardProps {
    clientId: string | undefined
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ clientId }) => {
    const { loading, availableExercises, getVolumeData, getExerciseHistory } = useAnalyticsData(clientId)
    const [timeRange, setTimeRange] = useState<TimeRange>('3M')
    const [selectedExerciseId, setSelectedExerciseId] = useState<string>('')

    // Auto-select first exercise if available
    useEffect(() => {
        if (availableExercises.length > 0 && !selectedExerciseId) {
            setSelectedExerciseId(availableExercises[0].id)
        }
    }, [availableExercises, selectedExerciseId])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const volumeData = getVolumeData(timeRange)
    const exerciseData = selectedExerciseId ? getExerciseHistory(selectedExerciseId, timeRange) : []

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Analytics e Progresso</h2>
                <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="1M">1 Mês</TabsTrigger>
                        <TabsTrigger value="3M">3 Meses</TabsTrigger>
                        <TabsTrigger value="1Y">1 Ano</TabsTrigger>
                        <TabsTrigger value="ALL">Tudo</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Gráfico de Volume */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-indigo-500" /> Volume de Treino (Carga Total)
                    </CardTitle>
                    <CardDescription>
                        Soma total de (Peso × Repetições) por treino. Indica sua capacidade de trabalho.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={volumeData}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                    tickMargin={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                    itemStyle={{ color: '#8884d8' }}
                                    formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volume Total']}
                                    labelStyle={{ color: '#E5E7EB' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill="url(#colorVolume)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Gráfico de Evolução de Carga */}
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" /> Evolução de Cargas
                        </CardTitle>
                        <CardDescription>
                            Acompanhe sua progressão de força (1RM Estimado) em exercícios específicos.
                        </CardDescription>
                    </div>
                    <div className="w-full md:w-[300px]">
                        <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um exercício" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableExercises.map((ex) => (
                                    <SelectItem key={ex.id} value={ex.id}>
                                        {ex.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedExerciseId ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={exerciseData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                        labelStyle={{ color: '#E5E7EB' }}
                                    />
                                    <Legend />
                                    <Line
                                        name="1RM Estimado (kg)"
                                        type="monotone"
                                        dataKey="oneRM"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: '#10B981' }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        name="Max Peso (kg)"
                                        type="monotone"
                                        dataKey="maxWeight"
                                        stroke="#6366F1"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ r: 3, fill: '#6366F1' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                            Selecione um exercício para ver o gráfico.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default AnalyticsDashboard
