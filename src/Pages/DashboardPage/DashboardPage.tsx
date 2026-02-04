import { Button, Container, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { logout } from '../../app/store/authSlice';

export function DashboardPage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);

    return (
        <Container sx={{ py: 6 }}>
            <Stack spacing={2}>
                <Typography variant="h4">Dashboard</Typography>
                <Typography>Logged in as: {user?.email}</Typography>
                <Button variant="outlined" onClick={() => dispatch(logout())}>
                    Logout
                </Button>
            </Stack>
        </Container>
    );
}
