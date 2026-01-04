import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PremiumAccessState {
    isPremium: boolean;
    loading: boolean;
    expirationDate: Date | null;
}

export const usePremiumAccess = (): PremiumAccessState => {
    const { user, loading: authLoading } = useAuth();
    const [state, setState] = useState<PremiumAccessState>({
        isPremium: false,
        loading: true,
        expirationDate: null
    });

    useEffect(() => {
        const checkAccess = async () => {
            // Wait for auth to load
            if (authLoading) return;

            if (!user) {
                setState({ isPremium: false, loading: false, expirationDate: null });
                return;
            }

            try {
                // Query for any active subscription not expired
                const { data, error } = await supabase
                    .from('client_professionals')
                    .select('status, expires_at')
                    .eq('client_id', user.id)
                    .eq('status', 'active')
                    .gt('expires_at', new Date().toISOString())
                    .order('expires_at', { ascending: false })
                    .limit(1);

                if (error) {
                    console.error("Error fetching subscription:", error);
                    setState({ isPremium: false, loading: false, expirationDate: null });
                    return;
                }

                if (data && data.length > 0) {
                    setState({
                        isPremium: true,
                        loading: false,
                        expirationDate: new Date(data[0].expires_at)
                    });
                } else {
                    setState({ isPremium: false, loading: false, expirationDate: null });
                }

            } catch (err) {
                console.error("Error checking premium access:", err);
                setState({ isPremium: false, loading: false, expirationDate: null });
            }
        };

        checkAccess();
    }, [user, authLoading]);

    // Combined loading state
    return { ...state, loading: state.loading || authLoading };
};
