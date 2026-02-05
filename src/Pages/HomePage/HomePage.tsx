import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../app/store/hooks';

export function HomePage() {
    const user = useAppSelector((s) => s.auth.user);

    return (
        <Container sx={{ py: 6 }}>
            {/* Hero */}
            <Stack spacing={2} alignItems="center" textAlign="center">
                <Typography variant="h3" fontWeight={800}>
                    Personal Task Tracker
                </Typography>

                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720 }}>
                    Track tasks and goals, set priorities and deadlines, and keep progress visible — powered by Supabase and built
                    with React + TypeScript + MUI.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                    {!user ? (
                        <>
                            <Button variant="contained" size="large" component={RouterLink} to="/register">
                                Create account
                            </Button>

                            <Button variant="outlined" size="large" component={RouterLink} to="/login">
                                Login
                            </Button>
                        </>
                    ) : (
                        <Button variant="contained" size="large" component={RouterLink} to="/dashboard">
                            Go to Dashboard
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* Feature cards */}
            <Box sx={{ mt: 6 }}>
                <Grid container spacing={2}>
                    <Grid xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700}>
                                    Tasks with priorities
                                </Typography>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>
                                    Create tasks, set priority (Low/Medium/High), due dates, and status (To Do / In Progress / Completed).
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700}>
                                    Goals & progress
                                </Typography>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>
                                    Group tasks into goals, track completion percentage, and stay focused on outcomes.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700}>
                                    Secure & personal
                                </Typography>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>
                                    Supabase Auth + Row Level Security ensures you only access your own data.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Mini roadmap / What’s next */}
            <Box sx={{ mt: 6 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" fontWeight={800}>
                            What you’ll build next
                        </Typography>

                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Tasks list with filters, Goals module, and a Dashboard with charts & insights.
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2, flexWrap: 'wrap' }}>
                            <Box
                                sx={{
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: 999,
                                    bgcolor: 'action.hover',
                                    width: 'fit-content',
                                }}
                            >
                                <Typography variant="body2">✅ Auth + Protected Routes</Typography>
                            </Box>

                            <Box
                                sx={{
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: 999,
                                    bgcolor: 'action.hover',
                                    width: 'fit-content',
                                }}
                            >
                                <Typography variant="body2">🔜 Tasks CRUD + Filters</Typography>
                            </Box>

                            <Box
                                sx={{
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: 999,
                                    bgcolor: 'action.hover',
                                    width: 'fit-content',
                                }}
                            >
                                <Typography variant="body2">🔜 Goals + Progress</Typography>
                            </Box>

                            <Box
                                sx={{
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: 999,
                                    bgcolor: 'action.hover',
                                    width: 'fit-content',
                                }}
                            >
                                <Typography variant="body2">🔜 Dashboard Charts</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
