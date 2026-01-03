import { Dumbbell, Apple, Stethoscope, Building2, TrendingUp, User } from 'lucide-react';
import React from 'react';

export interface ProfessionalTypeInfo {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
}

export const PROFESSIONAL_TYPES: Record<string, ProfessionalTypeInfo> = {
    'personal_trainer': {
        id: 'personal_trainer',
        label: 'Personal Trainer',
        icon: Dumbbell,
        color: 'text-blue-500'
    },
    'nutritionist': {
        id: 'nutritionist',
        label: 'Nutricionista',
        icon: Apple,
        color: 'text-green-500'
    },
    'sports_doctor': {
        id: 'sports_doctor',
        label: 'Médico do Esporte',
        icon: Stethoscope,
        color: 'text-red-500'
    },
    'clinic': {
        id: 'clinic',
        label: 'Clínica / Estúdio',
        icon: Building2,
        color: 'text-purple-500'
    },
    'performance_coach': {
        id: 'performance_coach',
        label: 'Coach de Performance',
        icon: TrendingUp,
        color: 'text-orange-500'
    }
};

export const getProfessionalTypeInfo = (type: string): ProfessionalTypeInfo => {
    return PROFESSIONAL_TYPES[type] || {
        id: type,
        label: type.replace(/_/g, ' '),
        icon: User,
        color: 'text-muted-foreground'
    };
};
