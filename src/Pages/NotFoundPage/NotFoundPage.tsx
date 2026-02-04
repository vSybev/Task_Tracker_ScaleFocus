import { Container, Typography } from '@mui/material';

export function NotFoundPage() {
    return (
        <Container sx={{ py: 6 }}>
            <Typography variant="h4">404</Typography>
            <Typography>Page not found.</Typography>
        </Container>
    );
}
