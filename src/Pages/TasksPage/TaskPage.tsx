import { Typography, Stack } from '@mui/material';

export function TasksPage() {
    return (
        <Stack spacing={1}>
            <Typography variant="h4">Tasks</Typography>
            <Typography color="text.secondary">Coming next: list, filters, add/edit dialogs.</Typography>
        </Stack>
    );
}
