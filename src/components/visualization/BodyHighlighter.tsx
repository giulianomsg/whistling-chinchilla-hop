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
        <div className={`flex items-center justify-center ${className}`}>
            {/* We render both front and back driven by the presence of muscles */}
            <Model
                data={data}
                style={{ width: width, padding: '1rem' }}
                highlightedColors={['#e65100', '#f57c00']} // Colors for highlight
            />
        </div>
    )
}

export default BodyHighlighter
