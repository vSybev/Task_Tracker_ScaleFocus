import { useEffect } from 'react';
import { AppRouter } from './app/router/AppRouter';
import { useAppDispatch } from './app/store/hooks';
import { loadSession, setSession } from './app/store/authSlice';
import { supabase } from './shared/supabase/client';

export default function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // 1) initial session load
        dispatch(loadSession());

        // 2) keep redux in sync with supabase auth changes
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            dispatch(setSession(session));
        });

        return () => {
            data.subscription.unsubscribe();
        };
    }, [dispatch]);

    return <AppRouter />;
}
