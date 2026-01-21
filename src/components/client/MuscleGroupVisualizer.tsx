import React from 'react';
import { cn } from '@/lib/utils';

interface MuscleGroupVisualizerProps {
    muscleGroups: string[];
    className?: string;
}

export const MuscleGroupVisualizer: React.FC<MuscleGroupVisualizerProps> = ({ muscleGroups, className }) => {
    // Normalize input to lowercase for comparison
    const activeMuscles = muscleGroups.map(m => m.toLowerCase().trim());

    // Helper to check if a muscle is active
    const isActive = (muscle: string) => {
        return activeMuscles.some(m => m.includes(muscle));
    };

    // Base color for inactive muscles
    const inactiveColor = "#e5e7eb"; // gray-200
    // Color for active muscles
    const activeColor = "#ef4444"; // red-500

    return (
        <div className={cn("flex justify-center items-center gap-4", className)}>
            {/* Front View */}
            <svg
                viewBox="0 0 200 400"
                className="h-full w-auto max-h-[300px]"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g id="front-body">
                    {/* Head (Generic) */}
                    <circle cx="100" cy="30" r="20" fill={inactiveColor} />

                    {/* Shoulders (Ombros) */}
                    <path
                        d="M60 60 Q100 50 140 60 L150 80 L50 80 Z"
                        fill={isActive('ombro') || isActive('deltoid') ? activeColor : inactiveColor}
                    />

                    {/* Chest (Peitoral) */}
                    <path
                        d="M70 80 Q100 85 130 80 L130 110 Q100 120 70 110 Z"
                        fill={isActive('peitoral') || isActive('chest') ? activeColor : inactiveColor}
                    />

                    {/* Biceps (Bíceps) - Left & Right */}
                    <path
                        d="M50 80 L40 120 L60 120 Z"
                        fill={isActive('biceps') || isActive('bíceps') ? activeColor : inactiveColor}
                    />
                    <path
                        d="M150 80 L160 120 L140 120 Z"
                        fill={isActive('biceps') || isActive('bíceps') ? activeColor : inactiveColor}
                    />

                    {/* Forearms (Antebraço) - Left & Right */}
                    <path
                        d="M40 120 L30 160 L50 160 Z"
                        fill={isActive('antebraço') || isActive('forearm') ? activeColor : inactiveColor}
                    />
                    <path
                        d="M160 120 L170 160 L150 160 Z"
                        fill={isActive('antebraço') || isActive('forearm') ? activeColor : inactiveColor}
                    />

                    {/* Abs (Abdomen) */}
                    <path
                        d="M75 110 L125 110 L120 150 L80 150 Z"
                        fill={isActive('abdomen') || isActive('abs') || isActive('core') ? activeColor : inactiveColor}
                    />

                    {/* Quads (Quadríceps) - Left & Right */}
                    <path
                        d="M70 160 L130 160 L120 230 L80 230 Z"
                        fill={isActive('quadriceps') || isActive('coxa') || isActive('pernas') ? activeColor : inactiveColor}
                    />

                    {/* Calves (Panturrilhas) - Front view (Tibialis?) usually minor, but let's map generic leg */}
                    <path
                        d="M80 230 L120 230 L115 280 L85 280 Z"
                        fill={isActive('panturrilha') || isActive('pernas') ? activeColor : inactiveColor}
                    />
                </g>
            </svg>

            {/* Back View */}
            <svg
                viewBox="0 0 200 400"
                className="h-full w-auto max-h-[300px]"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g id="back-body">
                    {/* Head (Generic) */}
                    <circle cx="100" cy="30" r="20" fill={inactiveColor} />

                    {/* Traps/Neck */}
                    <path
                        d="M80 50 L120 50 L140 60 L60 60 Z"
                        fill={isActive('costas') || isActive('trapezio') || isActive('trapézio') ? activeColor : inactiveColor}
                    />

                    {/* Back (Costas/Lats) */}
                    <path
                        d="M60 60 L140 60 L130 120 L70 120 Z"
                        fill={isActive('costas') || isActive('lats') || isActive('dorsal') ? activeColor : inactiveColor}
                    />

                    {/* Triceps (Tríceps) - Left & Right */}
                    <path
                        d="M50 80 L40 120 L60 120 Z"
                        fill={isActive('triceps') || isActive('tríceps') ? activeColor : inactiveColor}
                    />
                    <path
                        d="M150 80 L160 120 L140 120 Z"
                        fill={isActive('triceps') || isActive('tríceps') ? activeColor : inactiveColor}
                    />

                    {/* Glutes (Glúteos) */}
                    <path
                        d="M70 140 L130 140 L130 180 L70 180 Z"
                        fill={isActive('gluteos') || isActive('glúteos') || isActive('bumbum') ? activeColor : inactiveColor}
                    />

                    {/* Hamstrings (Posterior) */}
                    <path
                        d="M70 180 L130 180 L125 240 L75 240 Z"
                        fill={isActive('posterior') || isActive('pernas') ? activeColor : inactiveColor}
                    />

                    {/* Calves (Panturrilha) - Back */}
                    <path
                        d="M75 240 L125 240 L120 290 L80 290 Z"
                        fill={isActive('panturrilha') || isActive('panturrilhas') || isActive('pernas') ? activeColor : inactiveColor}
                    />
                </g>
            </svg>
        </div>
    );
};
