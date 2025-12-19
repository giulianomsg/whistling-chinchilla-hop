
import React from 'react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts'

interface StrengthRadarProps {
    stats: {
        subject: string
        A: number // Current (Ratio or 1RM)
        fullMark: number // Max scale (e.g. Elite standard)
    }[]
}

const StrengthRadar: React.FC<StrengthRadarProps> = ({ stats }) => {
    // Determine meaningful max domain
    const maxVal = Math.max(...stats.map(s => s.A), ...stats.map(s => s.fullMark)) * 1.1

    return (
        <div className="w-full h-[300px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, maxVal]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Nível de Força (Ratio)"
                        dataKey="A"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="#3b82f6"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                        itemStyle={{ color: '#60a5fa' }}
                        formatter={(value: number) => [value.toFixed(2) + 'x BW', 'Força Relativa']}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default StrengthRadar
