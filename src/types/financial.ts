export interface SubscriptionPlan {
    id: string;
    professional_id: string;
    name: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
    price: number; // Numeric no banco
    duration_months: number;
    active: boolean;
}
