import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    MenuItem,
    Radio,
    RadioGroup,
    Snackbar,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../Shared/supabase/client';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { logout } from '../store/authSlice.ts';
import { setMode, type ThemeMode } from '../store/themeSlice.ts';

type Language = 'en' | 'bg';

function initialsFromEmail(email?: string | null) {
    if (!email) return 'U';
    return email.slice(0, 1).toUpperCase();
}

export function SettingsPage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);

    // ✅ theme mode from Redux (system/light/dark)
    const mode = useAppSelector((s) => s.theme.mode);

    // ✅ useful UI hint: show current resolved theme when "system"
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
    const resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

    const [sessionEmail, setSessionEmail] = useState<string | null>(user?.email ?? null);
    const [lang, setLang] = useState<Language>(() => (localStorage.getItem('tt_lang') as Language) || 'en');

    const [emailReminders, setEmailReminders] = useState<boolean>(() => localStorage.getItem('tt_email_reminders') === '1');
    const [dailySummary, setDailySummary] = useState<boolean>(() => localStorage.getItem('tt_daily_summary') === '1');

    const [snack, setSnack] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSessionEmail(user?.email ?? null);
    }, [user?.email]);

    useEffect(() => {
        localStorage.setItem('tt_lang', lang);
    }, [lang]);

    useEffect(() => {
        localStorage.setItem('tt_email_reminders', emailReminders ? '1' : '0');
    }, [emailReminders]);

    useEffect(() => {
        localStorage.setItem('tt_daily_summary', dailySummary ? '1' : '0');
    }, [dailySummary]);

    const userId = user?.id ?? null;

    const accountBadge = useMemo(() => {
        if (!userId) return { label: 'Guest', color: 'default' as const };
        return { label: 'Authenticated', color: 'success' as const };
    }, [userId]);

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setSnack({ type: 'success', text: 'Copied to clipboard' });
        } catch {
            setSnack({ type: 'error', text: 'Copy failed (browser permissions)' });
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await dispatch(logout()).unwrap();
            setSnack({ type: 'success', text: 'Logged out' });
        } catch (e: any) {
            setSnack({ type: 'error', text: e?.message ?? 'Logout failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOutEverywhere = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            setSnack({ type: 'info', text: 'Signed out from this device. (Global revoke requires server-side)' });
        } catch (e: any) {
            setSnack({ type: 'error', text: e?.message ?? 'Sign out failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const [{ data: tasks, error: tErr }, { data: goals, error: gErr }] = await Promise.all([
                supabase.from('tasks').select('*').order('created_at', { ascending: false }),
                supabase.from('goals').select('*').order('created_at', { ascending: false }),
            ]);

            if (tErr) throw new Error(tErr.message);
            if (gErr) throw new Error(gErr.message);

            const payload = {
                exported_at: new Date().toISOString(),
                tasks: tasks ?? [],
                goals: goals ?? [],
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'task-tracker-export.json';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            setSnack({ type: 'success', text: 'Export downloaded' });
        } catch (e: any) {
            setSnack({ type: 'error', text: e?.message ?? 'Export failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setSnack({
            type: 'info',
            text: 'Account deletion needs an Edge Function (admin). We can add it later.',
        });
    };

    return (
        <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar>
                    <SettingsOutlinedIcon />
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        Settings
                    </Typography>
                    <Typography color="text.secondary">Preferences, account, notifications, and data.</Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Chip label={accountBadge.label} color={accountBadge.color} />
            </Stack>

            {/* Account */}
            <Card>
                <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                        <Avatar sx={{ width: 48, height: 48 }}>{initialsFromEmail(sessionEmail)}</Avatar>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={900}>Account</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Connected identity and session details.
                            </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }} />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                            <Button
                                variant="outlined"
                                startIcon={<LogoutOutlinedIcon />}
                                onClick={handleLogout}
                                disabled={!userId || loading}
                            >
                                Logout
                            </Button>
                            <Button variant="text" onClick={handleSignOutEverywhere} disabled={!userId || loading}>
                                Sign out (this device)
                            </Button>
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {!userId ? (
                        <Alert severity="info">You’re not logged in. Login to access account settings.</Alert>
                    ) : (
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography sx={{ width: 110 }} color="text.secondary">
                                    Email
                                </Typography>
                                <Typography fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                                    {sessionEmail ?? '—'}
                                </Typography>
                                {sessionEmail ? (
                                    <Tooltip title="Copy email">
                                        <IconButton size="small" onClick={() => copy(sessionEmail)}>
                                            <ContentCopyOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                ) : null}
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography sx={{ width: 110 }} color="text.secondary">
                                    User ID
                                </Typography>
                                <Typography fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                                    {userId}
                                </Typography>
                                <Tooltip title="Copy user id">
                                    <IconButton size="small" onClick={() => copy(userId)}>
                                        <ContentCopyOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    )}
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
                <CardContent>
                    <Typography fontWeight={900}>Preferences</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Personalize how the app looks and feels.
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                        <FormControl>
                            <FormLabel>Theme</FormLabel>

                            <RadioGroup
                                row
                                value={mode}
                                onChange={(e) => dispatch(setMode(e.target.value as ThemeMode))}
                            >
                                <FormControlLabel value="system" control={<Radio />} label="System" />
                                <FormControlLabel value="light" control={<Radio />} label="Light" />
                                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                            </RadioGroup>

                            <Typography variant="caption" color="text.secondary">
                                Active theme: <b>{resolved}</b>
                            </Typography>
                        </FormControl>

                        <Box sx={{ flex: 1 }} />

                        <Stack spacing={1} sx={{ minWidth: 240 }}>
                            <TextField
                                select
                                label="Language"
                                value={lang}
                                onChange={(e) => setLang(e.target.value as Language)}
                            >
                                <MenuItem value="en">English</MenuItem>
                                <MenuItem value="bg">Bulgarian</MenuItem>
                            </TextField>

                            <Typography variant="caption" color="text.secondary">
                                Demo switch (use i18n later).
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardContent>
                    <Typography fontWeight={900}>Notifications</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Simple toggles now — can be connected to Edge Functions later.
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <Box>
                                <Typography fontWeight={800}>Email reminders</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Get reminders before tasks are due.
                                </Typography>
                            </Box>
                            <Switch checked={emailReminders} onChange={(e) => setEmailReminders(e.target.checked)} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <Box>
                                <Typography fontWeight={800}>Daily summary</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    One email per day with tasks overview.
                                </Typography>
                            </Box>
                            <Switch checked={dailySummary} onChange={(e) => setDailySummary(e.target.checked)} />
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Data */}
            <Card>
                <CardContent>
                    <Typography fontWeight={900}>Data & privacy</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Export your data or manage dangerous actions.
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadOutlinedIcon />}
                            onClick={handleExport}
                            disabled={!userId || loading}
                        >
                            Export (JSON)
                        </Button>
                        <Button
                            variant="text"
                            color="error"
                            startIcon={<DeleteOutlineOutlinedIcon />}
                            onClick={handleDeleteAccount}
                            disabled={!userId || loading}
                        >
                            Delete account
                        </Button>
                    </Stack>

                    {!userId ? (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Login to export or manage your data.
                        </Alert>
                    ) : (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Deleting an account requires a secure server-side function (Supabase Edge Function). We can implement it later.
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Inline snackbar */}
            {snack ? (
                <Snackbar
                    open
                    autoHideDuration={2600}
                    onClose={() => setSnack(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity={snack.type} onClose={() => setSnack(null)} variant="filled">
                        {snack.text}
                    </Alert>
                </Snackbar>
            ) : null}
        </Stack>
    );
}
