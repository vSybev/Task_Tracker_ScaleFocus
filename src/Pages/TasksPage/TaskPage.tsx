import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    MenuItem,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { Task, TaskFilters, TaskPriority, TaskStatus } from '../../Shared/api/tasks/types';
import { createTask, deleteTask, fetchTasks, updateTask } from '../../Shared/api/tasks/tasksApi';
import { TaskDialog } from './TaskDialog';
import { DeleteConfirmDialog } from './DeleteConfirmationDialog';
import { fetchGoalsForSelect } from '../../Shared/api/goals/goalsApi';

const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

// Helper type: removes undefined from optional field
type DueFilter = NonNullable<TaskFilters['due']>;

const dueOptions: { value: DueFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'Next 7 days' },
    { value: 'no_due_date', label: 'No due date' },
];

function statusChip(status: TaskStatus) {
    if (status === 'completed') return <Chip size="small" label="Completed" />;
    if (status === 'in_progress') return <Chip size="small" label="In Progress" />;
    return <Chip size="small" label="To Do" />;
}

function priorityChip(priority: TaskPriority) {
    if (priority === 'high') return <Chip size="small" label="High" variant="outlined" />;
    if (priority === 'low') return <Chip size="small" label="Low" variant="outlined" />;
    return <Chip size="small" label="Medium" variant="outlined" />;
}

function isStatus(v: string | null): v is TaskStatus | 'all' {
    return v === 'all' || v === 'todo' || v === 'in_progress' || v === 'completed';
}

function isPriority(v: string | null): v is TaskPriority | 'all' {
    return v === 'all' || v === 'low' || v === 'medium' || v === 'high';
}

// ✅ FIXED: predicate returns NonNullable<...> (no undefined)
function isDue(v: string | null): v is DueFilter {
    return v === 'all' || v === 'overdue' || v === 'today' || v === 'this_week' || v === 'no_due_date';
}

export function TasksPage() {
    const [filters, setFilters] = useState<TaskFilters>({
        status: 'all',
        priority: 'all',
        due: 'all',
        search: '',
        goal_id: null,
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const skipUrlWriteRef = useRef(false);

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Task[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [snack, setSnack] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [editing, setEditing] = useState<Task | null>(null);
    const [saving, setSaving] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [goalsMap, setGoalsMap] = useState<Record<string, string>>({});

    // 1) URL -> filters (read query params)
    useEffect(() => {
        const statusQ = searchParams.get('status');
        const priorityQ = searchParams.get('priority');
        const dueQ = searchParams.get('due');
        const searchQ = searchParams.get('search');
        const goalIdQ = searchParams.get('goalId'); // URL stays goalId, state uses goal_id

        skipUrlWriteRef.current = true;

        setFilters({
            status: isStatus(statusQ) ? statusQ : 'all',
            priority: isPriority(priorityQ) ? priorityQ : 'all',
            due: isDue(dueQ) ? dueQ : 'all',
            search: typeof searchQ === 'string' ? searchQ : '',
            goal_id: goalIdQ ? goalIdQ : null,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // 2) filters -> URL (keep URL in sync)
    useEffect(() => {
        if (skipUrlWriteRef.current) {
            skipUrlWriteRef.current = false;
            return;
        }

        const next = new URLSearchParams();

        if (filters.status && filters.status !== 'all') next.set('status', String(filters.status));
        if (filters.priority && filters.priority !== 'all') next.set('priority', String(filters.priority));
        if (filters.due && filters.due !== 'all') next.set('due', String(filters.due));
        if (filters.search && filters.search.trim()) next.set('search', filters.search.trim());
        if (filters.goal_id) next.set('goalId', filters.goal_id);

        const current = searchParams.toString();
        const upcoming = next.toString();
        if (current !== upcoming) setSearchParams(next, { replace: true });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status, filters.priority, filters.due, filters.search, filters.goal_id]);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [tasks, goals] = await Promise.all([
                fetchTasks(filters),
                fetchGoalsForSelect(),
            ]);

            setRows(tasks);

            const map: Record<string, string> = {};
            for (const g of goals) map[g.id] = g.name;
            setGoalsMap(map);
        } catch (e: any) {
            setError(e.message ?? 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status, filters.priority, filters.due, filters.search, filters.goal_id]);

    const hasFilters = useMemo(() => {
        return (
            (filters.status && filters.status !== 'all') ||
            (filters.priority && filters.priority !== 'all') ||
            (filters.due && filters.due !== 'all') ||
            Boolean(filters.search?.trim()) ||
            Boolean(filters.goal_id)
        );
    }, [filters]);

    const openCreate = () => {
        setDialogMode('create');
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (t: Task) => {
        setDialogMode('edit');
        setEditing(t);
        setDialogOpen(true);
    };

    const handleSubmit = async (values: any) => {
        setSaving(true);
        try {
            if (dialogMode === 'create') {
                await createTask(values);
                setSnack({ type: 'success', text: 'Task created' });
            } else if (editing) {
                await updateTask({ id: editing.id, ...values });
                setSnack({ type: 'success', text: 'Task updated' });
            }
            setDialogOpen(false);
            await load();
        } catch (e: any) {
            setSnack({ type: 'error', text: e.message ?? 'Save failed' });
        } finally {
            setSaving(false);
        }
    };

    const askDelete = (id: string) => {
        setDeletingId(id);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        setSaving(true);
        try {
            await deleteTask(deletingId);
            setSnack({ type: 'success', text: 'Task deleted' });
            setDeleteOpen(false);
            setDeletingId(null);
            await load();
        } catch (e: any) {
            setSnack({ type: 'error', text: e.message ?? 'Delete failed' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Stack spacing={2}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                spacing={2}
            >
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Tasks
                    </Typography>
                    <Typography color="text.secondary">Manage your tasks, deadlines, and progress.</Typography>
                </Box>

                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                    Add Task
                </Button>
            </Stack>

            {/* Filters */}
            <Card>
                <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            label="Search"
                            value={filters.search ?? ''}
                            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                            fullWidth
                        />

                        <TextField
                            label="Status"
                            select
                            value={filters.status ?? 'all'}
                            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as any }))}
                            sx={{ minWidth: 170 }}
                        >
                            {statusOptions.map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Priority"
                            select
                            value={filters.priority ?? 'all'}
                            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value as any }))}
                            sx={{ minWidth: 170 }}
                        >
                            {priorityOptions.map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Due"
                            select
                            value={filters.due ?? 'all'}
                            onChange={(e) => setFilters((f) => ({ ...f, due: e.target.value as any }))}
                            sx={{ minWidth: 190 }}
                        >
                            {dueOptions.map((o) => (
                                <MenuItem key={o.value} value={o.value}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Goal filter */}
                        <TextField
                            label="Goal"
                            select
                            value={filters.goal_id ?? ''}
                            onChange={(e) => setFilters((f) => ({ ...f, goal_id: e.target.value ? String(e.target.value) : null }))}
                            sx={{ minWidth: 210 }}
                        >
                            <MenuItem value="">All goals</MenuItem>
                            {Object.entries(goalsMap).map(([id, name]) => (
                                <MenuItem key={id} value={id}>
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {hasFilters && (
                            <Button
                                variant="text"
                                onClick={() =>
                                    setFilters({
                                        status: 'all',
                                        priority: 'all',
                                        due: 'all',
                                        search: '',
                                        goal_id: null,
                                    })
                                }
                            >
                                Clear
                            </Button>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                            <CircularProgress />
                        </Stack>
                    ) : error ? (
                        <Box sx={{ p: 3 }}>
                            <Alert severity="error">{error}</Alert>
                            <Button sx={{ mt: 2 }} onClick={load}>
                                Retry
                            </Button>
                        </Box>
                    ) : rows.length === 0 ? (
                        <Box sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight={700}>
                                No tasks yet
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                Create your first task to start tracking progress.
                            </Typography>
                            <Button sx={{ mt: 2 }} variant="contained" onClick={openCreate}>
                                Add Task
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                            <Table size="medium">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Goal</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Due</TableCell>
                                        <TableCell sx={{ fontWeight: 700, width: 120 }} align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {rows.map((t) => (
                                        <TableRow key={t.id} hover>
                                            <TableCell>
                                                <Stack spacing={0.25}>
                                                    <Typography fontWeight={700}>{t.title}</Typography>
                                                    {t.description ? (
                                                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600 }}>
                                                            {t.description}
                                                        </Typography>
                                                    ) : null}
                                                </Stack>
                                            </TableCell>

                                            <TableCell>{statusChip(t.status)}</TableCell>
                                            <TableCell>{priorityChip(t.priority)}</TableCell>

                                            <TableCell>
                                                {t.goal_id && goalsMap[t.goal_id] ? (
                                                    <Chip size="small" label={goalsMap[t.goal_id]} variant="outlined" />
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>

                                            <TableCell>{t.due_date ?? '—'}</TableCell>

                                            <TableCell align="right">
                                                <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                                    <IconButton aria-label="edit" onClick={() => openEdit(t)}>
                                                        <EditOutlinedIcon />
                                                    </IconButton>
                                                    <IconButton aria-label="delete" onClick={() => askDelete(t.id)}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <TaskDialog
                open={dialogOpen}
                mode={dialogMode}
                initial={editing}
                loading={saving}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSubmit}
            />

            <DeleteConfirmDialog
                open={deleteOpen}
                title="Delete task"
                message="This action cannot be undone."
                loading={saving}
                onClose={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
            />

            {snack && (
                <Snackbar
                    open
                    autoHideDuration={2500}
                    onClose={() => setSnack(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity={snack.type} onClose={() => setSnack(null)} variant="filled">
                        {snack.text}
                    </Alert>
                </Snackbar>
            )}
        </Stack>
    );
}
