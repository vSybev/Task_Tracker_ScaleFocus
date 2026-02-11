import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

export function DeleteConfirmDialog(props: {
    open: boolean;
    title?: string;
    message?: string;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}) {
    const { open, title = 'Delete item', message = 'Are you sure?', onClose, onConfirm, loading } = props;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
