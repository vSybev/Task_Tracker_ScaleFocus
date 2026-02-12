import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { useMediaQuery } from '@mui/material';
import { useAppSelector } from '../store/hooks.ts';

export function AppThemeProvider({ children }: PropsWithChildren) {
    const mode = useAppSelector((s) => s.theme.mode); // 'system' | 'light' | 'dark'
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

    const resolvedMode = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode: resolvedMode,
            },
            shape: {
                borderRadius: 12,
            },
            typography: {
                fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
            },
        });
    }, [resolvedMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
