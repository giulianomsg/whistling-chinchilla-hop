import React from 'react'
import Model from 'react-body-highlighter'

interface BodyHighlighterProps {
    muscles: string[] // Array of muscle keys (e.g. ['chest', 'triceps'])
    className?: string
    width?: number
    height?: number
}

const VALID_SLUGS = [
    'trapezius', 'upper-back', 'lower-back', 'chest', 'biceps', 'triceps', 'forearm',
    'back-deltoids', 'front-deltoids', 'abs', 'obliques', 'adductor', 'hamstring',
    'quadriceps', 'abductors', 'calves', 'gluteal', 'head', 'neck'
]

const BodyHighlighter: React.FC<BodyHighlighterProps> = ({ muscles, className, width = 300, height = 300 }) => {
    // Filter out invalid muscles to prevent library crash
    const safeMuscles = muscles.filter(m => VALID_SLUGS.includes(m))

    // Optional: Log warnings for dropped muscles to help debugging
    if (muscles.length !== safeMuscles.length) {
        console.warn('BodyHighlighter: Ignored invalid muscle keys:', muscles.filter(m => !VALID_SLUGS.includes(m)))
    }

    const data = safeMuscles.map(m => ({ slug: m, intensity: 1 }))

    return (
        <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
            <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground mb-2">Frente</span>
                <Model
                    type="anterior"
                    data={data}
                    style={{ width: width, padding: '1rem' }}
                    highlightedColors={['#e65100', '#f57c00']}
                />
            </div>
            <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground mb-2">Costas</span>
                <Model
                    type="posterior"
                    data={data}
                    style={{ width: width, padding: '1rem' }}
                    highlightedColors={['#e65100', '#f57c00']}
                />
            </div>
        </div>
    )
}

export default BodyHighlighter
