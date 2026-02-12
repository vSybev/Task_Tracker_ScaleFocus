import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeState = {
    mode: ThemeMode;
};

const STORAGE_KEY = 'tt_theme_mode';

function readInitialMode(): ThemeMode {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
    return 'system';
}

const initialState: ThemeState = {
    mode: readInitialMode(),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setMode(state, action: PayloadAction<ThemeMode>) {
            state.mode = action.payload;
            localStorage.setItem(STORAGE_KEY, action.payload);
        },
    },
});

export const { setMode } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
