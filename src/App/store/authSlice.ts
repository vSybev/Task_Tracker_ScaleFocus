import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../Shared/supabase/client';

type AuthState = {
    session: Session | null;
    user: User | null;
    status: 'idle' | 'loading' | 'error';
    error: string | null;
    info: string | null;
};

const initialState: AuthState = {
    session: null,
    user: null,
    status: 'idle',
    error: null,
    info: null,
};

export const registerWithEmail = createAsyncThunk(
    'auth/registerWithEmail',
    async (payload: { email: string; password: string }) => {
        const { data, error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            // По желание: redirect при email confirm (ако е включен)
            options: {
                emailRedirectTo: window.location.origin,
            },
        });

        if (error) throw new Error(error.message);

        // data.session може да е null ако Supabase изисква email confirmation
        return data.session;
    },
);

export const loginWithEmail = createAsyncThunk(
    'auth/loginWithEmail',
    async (payload: { email: string; password: string }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: payload.email,
            password: payload.password,
        });

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
        clearMessages(state) {
            state.error = null;
            state.info = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // register
            .addCase(registerWithEmail.pending, (s) => {
                s.status = 'loading';
                s.error = null;
                s.info = null;
            })
            .addCase(registerWithEmail.fulfilled, (s, a) => {
                s.status = 'idle';
                // ако има session – вече си логнат
                s.session = a.payload;
                s.user = a.payload?.user ?? null;

                // ако session е null – вероятно чака email confirm
                if (!a.payload) {
                    s.info = 'Account created. Please check your email to confirm your account.';
                }
            })
            .addCase(registerWithEmail.rejected, (s, a) => {
                s.status = 'error';
                s.error = a.error.message ?? 'Register failed';
            })

            // login
            .addCase(loginWithEmail.pending, (s) => {
                s.status = 'loading';
                s.error = null;
                s.info = null;
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

            // logout
            .addCase(logout.fulfilled, (s) => {
                s.session = null;
                s.user = null;
                s.status = 'idle';
                s.error = null;
                s.info = null;
            })
            .addCase(logout.rejected, (s, a) => {
                s.status = 'error';
                s.error = a.error.message ?? 'Logout failed';
            });
    },
});

export const { setSession, clearMessages } = authSlice.actions;
export const authReducer = authSlice.reducer;
