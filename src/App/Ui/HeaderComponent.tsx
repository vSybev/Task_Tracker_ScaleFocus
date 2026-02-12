import {
    AppBar,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Link as RouterLink, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';

const APP_NAME = 'Task Tracker';

function getRouteTitle(pathname: string): string {
    if (pathname === '/' || pathname === '/home') return 'Home';
    if (pathname.startsWith('/login')) return 'Login';
    if (pathname.startsWith('/register')) return 'Register';
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/tasks')) return 'Tasks';
    if (pathname.startsWith('/goals')) return 'Goals';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Page';
}

export function HeaderComponent() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const user = useAppSelector((s) => s.auth.user);
    const pageTitle = useMemo(() => getRouteTitle(location.pathname), [location.pathname]);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const handleLogout = async () => {
        handleCloseMenu();
        await dispatch(logout());
        navigate('/login', { replace: true });
    };

    const navButtonSx = {
        textTransform: 'none',
        fontWeight: 600,
        '&.active': {
            textDecoration: 'underline',
            textUnderlineOffset: '6px',
        },
    } as const;

    return (
        <AppBar position="sticky" elevation={1}>
            <Toolbar sx={{ display: 'flex', gap: 2 }}>
                {/* Left: App name -> HomePage */}
                <Typography
                    variant="h6"
                    component={RouterLink}
                    to="/"
                    sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {APP_NAME}
                </Typography>

                {/* Center: Page title */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {pageTitle}
                    </Typography>
                </Box>

                {/* Right: Navigation + Auth */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Nav (only when logged in) */}
                    {user && (
                        <Stack direction="row" spacing={0.5} sx={{ mr: 1 }}>
                            <Button color="inherit" component={NavLink} to="/dashboard" sx={navButtonSx}>
                                Dashboard
                            </Button>
                            <Button color="inherit" component={NavLink} to="/tasks" sx={navButtonSx}>
                                Tasks
                            </Button>
                            <Button color="inherit" component={NavLink} to="/goals" sx={navButtonSx}>
                                Goals
                            </Button>
                        </Stack>
                    )}

                    {/* Auth actions */}
                    {!user ? (
                        <>
                            <Button color="inherit" component={RouterLink} to="/login" sx={{ textTransform: 'none' }}>
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                variant="outlined"
                                component={RouterLink}
                                to="/register"
                                sx={{ textTransform: 'none' }}
                            >
                                Register
                            </Button>
                        </>
                    ) : (
                        <>
                            <Tooltip title="Settings">
                                <IconButton color="inherit" onClick={handleOpenMenu}>
                                    <SettingsOutlinedIcon />
                                </IconButton>
                            </Tooltip>

                            <Menu
                                anchorEl={anchorEl}
                                open={menuOpen}
                                onClose={handleCloseMenu}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem
                                    onClick={() => {
                                        handleCloseMenu();
                                        navigate('/settings');
                                    }}
                                >
                                    Settings
                                </MenuItem>

                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
