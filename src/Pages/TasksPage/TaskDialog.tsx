import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useEffect, useState } from 'react';

import type { Task, TaskCreateInput, TaskPriority, TaskStatus } from '../../Shared/api/tasks/types';
import { fetchGoalsForSelect } from '../../Shared/api/goals/goalsApi';

const schema = yup.object({
    title: yup.string().trim().max(120).required('Title is required'),
    description: yup.string().max(2000).nullable(),
    due_date: yup.string().nullable(),
    priority: yup.mixed<TaskPriority>().oneOf(['low', 'medium', 'high']).required(),
    status: yup.mixed<TaskStatus>().oneOf(['todo', 'in_progress', 'completed']).required(),
    // goal_id е optional -> няма нужда от validation
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

type GoalSelectItem = { id: string; name: string };

export function TaskDialog(props: {
    open: boolean;
    mode: 'create' | 'edit';
    initial?: Task | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (values: TaskCreateInput) => Promise<void>;
}) {
    const { open, mode, initial, loading, onClose, onSubmit } = props;

    const [goals, setGoals] = useState<GoalSelectItem[]>([]);
    const [goalsLoading, setGoalsLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        setGoalsLoading(true);
        fetchGoalsForSelect()
            .then((data) => setGoals(data))
            .catch(() => setGoals([]))
            .finally(() => setGoalsLoading(false));
    }, [open]);

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
                        // ако goal_id е празен string от select -> правим null
                        goal_id: values.goal_id ? values.goal_id : null,
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

                                {/* Goal select */}
                                <TextField
                                    name="goal_id"
                                    label="Goal"
                                    select
                                    value={values.goal_id ?? ''}
                                    onChange={handleChange}
                                    helperText="Optional"
                                    disabled={goalsLoading}
                                >
                                    <MenuItem value="">
                                        {goalsLoading ? 'Loading goals...' : 'No goal'}
                                    </MenuItem>

                                    {!goalsLoading &&
                                        goals.map((g) => (
                                            <MenuItem key={g.id} value={g.id}>
                                                {g.name}
                                            </MenuItem>
                                        ))}
                                </TextField>

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

                                    <TextField
                                        name="status"
                                        label="Status"
                                        select
                                        fullWidth
                                        value={values.status}
                                        onChange={handleChange}
                                    >
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
