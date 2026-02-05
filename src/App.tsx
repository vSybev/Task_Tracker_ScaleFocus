import { useEffect } from 'react';
import { AppRouter } from './app/router/AppRouter';
import { useAppDispatch } from './app/store/hooks';
import { setSession } from './app/store/authSlice';
import { supabase } from './Shared/supabase/client';

export default function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // 1) Initial session load (Supabase manages persistence)
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                // optional: log error, don't crash the app
                console.error('Failed to get session:', error.message);
                dispatch(setSession(null));
                return;
            }
            dispatch(setSession(data.session));
        });

        // 2) Keep Redux in sync with Supabase auth changes
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            dispatch(setSession(session));
        });

        return () => {
            data.subscription.unsubscribe();
        };
    }, [dispatch]);

    return <AppRouter />;
}
