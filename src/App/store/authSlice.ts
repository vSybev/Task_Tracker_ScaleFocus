import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../Shared/supabase/client';

type AuthState = {
    session: Session | null;
    user: User | null;
    status: 'idle' | 'loading' | 'error';
    error: string | null;
};

const initialState: AuthState = {
    session: null,
    user: null,
    status: 'idle',
    error: null,
};

export const loadSession = createAsyncThunk('auth/loadSession', async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
});

export const registerWithEmail = createAsyncThunk(
    'auth/registerWithEmail',
    async (payload: { email: string; password: string }) => {
        const { data, error } = await supabase.auth.signUp(payload);
        if (error) throw new Error(error.message);
        return data.session; // може да е null ако изисква email confirm
    },
);

export const loginWithEmail = createAsyncThunk(
    'auth/loginWithEmail',
    async (payload: { email: string; password: string }) => {
        const { data, error } = await supabase.auth.signInWithPassword(payload);
        if (error) throw new Error(error.message);
        return data.session;
    },
);

export const logout = createAsyncThunk('auth/logout', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return true;
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSession(state, action: { payload: Session | null }) {
            state.session = action.payload;
            state.user = action.payload?.user ?? null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadSession.pending, (s) => {
                s.status = 'loading';
                s.error = null;
            })
            .addCase(loadSession.fulfilled, (s, a) => {
                s.status = 'idle';
                s.session = a.payload;
                s.user = a.payload?.user ?? null;
            })
            .addCase(loadSession.rejected, (s, a) => {
                s.status = 'error';
                s.error = a.error.message ?? 'Failed to load session';
            })

            .addCase(registerWithEmail.pending, (s) => {
                s.status = 'loading';
                s.error = null;
            })
            .addCase(registerWithEmail.fulfilled, (s, a) => {
                s.status = 'idle';
                s.session = a.payload;
                s.user = a.payload?.user ?? null;
            })
            .addCase(registerWithEmail.rejected, (s, a) => {
                s.status = 'error';
                s.error = a.error.message ?? 'Register failed';
            })

            .addCase(loginWithEmail.pending, (s) => {
                s.status = 'loading';
                s.error = null;
            })
            .addCase(loginWithEmail.fulfilled, (s, a) => {
                s.status = 'idle';
                s.session = a.payload;
                s.user = a.payload?.user ?? null;
            })
            .addCase(loginWithEmail.rejected, (s, a) => {
                s.status = 'error';
                s.error = a.error.message ?? 'Login failed';
            })

            .addCase(logout.fulfilled, (s) => {
                s.session = null;
                s.user = null;
                s.status = 'idle';
                s.error = null;
            });
    },
});

export const { setSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
