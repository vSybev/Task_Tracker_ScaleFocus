import { Container, Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { HeaderComponent } from '../Ui/HeaderComponent';

export function AppLayout() {
    return (
        <Box sx={{ minHeight: '100vh' }}>
            <HeaderComponent />
            <Container sx={{ py: 3 }}>
                <Outlet />
            </Container>
        </Box>
    );
}
