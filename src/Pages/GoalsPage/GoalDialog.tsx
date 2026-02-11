import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import type { Goal, GoalCreateInput } from '../../Shared/api/goals/types';

const schema = yup.object({
    name: yup.string().trim().max(120).required('Name is required'),
    description: yup.string().max(2000).nullable(),
    start_date: yup.string().nullable(),
    end_date: yup
        .string()
        .nullable()
        .test('end_after_start', 'End date must be after start date', function (end) {
            const start = this.parent.start_date as string | null | undefined;
            if (!start || !end) return true;
            return end >= start;
        }),
});

export function GoalDialog(props: {
    open: boolean;
    mode: 'create' | 'edit';
    initial?: Goal | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (values: GoalCreateInput) => Promise<void>;
}) {
    const { open, mode, initial, loading, onClose, onSubmit } = props;

    const initialValues: GoalCreateInput = {
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        start_date: initial?.start_date ?? null,
        end_date: initial?.end_date ?? null,
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{mode === 'create' ? 'Add Goal' : 'Edit Goal'}</DialogTitle>

            <Formik
                initialValues={initialValues}
                validationSchema={schema}
                enableReinitialize
                onSubmit={async (values) => {
                    const cleaned: GoalCreateInput = {
                        name: values.name.trim(),
                        description: values.description?.trim() ? values.description.trim() : null,
                        start_date: values.start_date ? values.start_date : null,
                        end_date: values.end_date ? values.end_date : null,
                    };
                    await onSubmit(cleaned);
                }}
            >
                {({ values, handleChange, handleSubmit, touched, errors }) => (
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <Stack spacing={2} sx={{ pt: 1 }}>
                                <TextField
                                    name="name"
                                    label="Name"
                                    value={values.name}
                                    onChange={handleChange}
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                    autoFocus
                                />

                                <TextField
                                    name="description"
                                    label="Description"
                                    value={values.description ?? ''}
                                    onChange={handleChange}
                                    error={touched.description && Boolean(errors.description)}
                                    helperText={touched.description && errors.description}
                                    multiline
                                    minRows={3}
                                />

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        name="start_date"
                                        label="Start date"
                                        type="date"
                                        value={values.start_date ?? ''}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        name="end_date"
                                        label="End date"
                                        type="date"
                                        value={values.end_date ?? ''}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        error={touched.end_date && Boolean(errors.end_date)}
                                        helperText={touched.end_date && (errors.end_date as string)}
                                    />
                                </Stack>
                            </Stack>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {mode === 'create' ? 'Create' : 'Save'}
                            </Button>
                        </DialogActions>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
}
