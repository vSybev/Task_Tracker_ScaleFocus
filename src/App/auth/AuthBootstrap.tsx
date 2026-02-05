import { useEffect } from 'react';
import { supabase } from '../../Shared/supabase/client';
import { useAppDispatch } from '../store/hooks';
import { setSession } from '../store/authSlice';

export function AuthBootstrap() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // 1) initial session
        supabase.auth.getSession().then(({ data }) => {
            dispatch(setSession(data.session));
        });

        // 2) realtime auth changes
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            dispatch(setSession(session));
        });

        return () => {
            sub.subscription.unsubscribe();
        };
    }, [dispatch]);

    return null;
}
