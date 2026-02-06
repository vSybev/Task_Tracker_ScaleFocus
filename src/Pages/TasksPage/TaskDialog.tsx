import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import type { Task, TaskCreateInput, TaskPriority, TaskStatus } from '../../Shared/api/tasks/types';

const schema = yup.object({
    title: yup.string().trim().max(120).required('Title is required'),
    description: yup.string().max(2000).nullable(),
    due_date: yup.string().nullable(),
    priority: yup.mixed<TaskPriority>().oneOf(['low', 'medium', 'high']).required(),
    status: yup.mixed<TaskStatus>().oneOf(['todo', 'in_progress', 'completed']).required(),
});

const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

export function TaskDialog(props: {
    open: boolean;
    mode: 'create' | 'edit';
    initial?: Task | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (values: TaskCreateInput) => Promise<void>;
}) {
    const { open, mode, initial, loading, onClose, onSubmit } = props;

    const initialValues: TaskCreateInput = {
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        due_date: initial?.due_date ?? null,
        priority: initial?.priority ?? 'medium',
        status: initial?.status ?? 'todo',
        goal_id: initial?.goal_id ?? null,
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{mode === 'create' ? 'Add Task' : 'Edit Task'}</DialogTitle>

            <Formik
                initialValues={initialValues}
                validationSchema={schema}
                enableReinitialize
                onSubmit={async (values) => {
                    const cleaned: TaskCreateInput = {
                        ...values,
                        title: values.title.trim(),
                        description: values.description?.trim() ? values.description.trim() : null,
                        due_date: values.due_date ? values.due_date : null,
                        goal_id: values.goal_id ?? null,
                    };

                    await onSubmit(cleaned);
                }}
            >
                {({ values, handleChange, handleSubmit, touched, errors }) => (
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <Stack spacing={2} sx={{ pt: 1 }}>
                                <TextField
                                    name="title"
                                    label="Title"
                                    value={values.title}
                                    onChange={handleChange}
                                    error={touched.title && Boolean(errors.title)}
                                    helperText={touched.title && errors.title}
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

                                <TextField
                                    name="due_date"
                                    label="Due date"
                                    type="date"
                                    value={values.due_date ?? ''}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        name="priority"
                                        label="Priority"
                                        select
                                        fullWidth
                                        value={values.priority}
                                        onChange={handleChange}
                                    >
                                        {priorityOptions.map((o) => (
                                            <MenuItem key={o.value} value={o.value}>
                                                {o.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField name="status" label="Status" select fullWidth value={values.status} onChange={handleChange}>
                                        {statusOptions.map((o) => (
                                            <MenuItem key={o.value} value={o.value}>
                                                {o.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
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
