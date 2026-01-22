import React from 'react'
import Model from 'react-body-highlighter'

interface BodyHighlighterProps {
    muscles: string[] // Array of muscle keys (e.g. ['chest', 'triceps'])
    className?: string
    width?: number
    height?: number
}

const BodyHighlighter: React.FC<BodyHighlighterProps> = ({ muscles, className, width = 300, height = 300 }) => {
    // Convert muscle names to Model compatible format
    // Assuming inputs match valid keys or need mapping.
    // The library expects [{ slug: 'chest', intensity: 1 }, ...]

    const data = muscles.map(m => ({ slug: m, intensity: 1 }))

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
