import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    LinearProgress,
    Snackbar,
    Stack,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useEffect, useMemo, useState } from 'react';

import type { Goal, GoalCreateInput } from '../../Shared/api/goals/types';
import { createGoal, deleteGoal, fetchGoalProgress, fetchGoals, updateGoal } from '../../Shared/api/goals/goalsApi';
import { GoalDialog } from './GoalDialog';
import {DeleteConfirmDialog} from "./DeleteConfirmationDialog.tsx";

function percent(completed: number, total: number) {
    if (total <= 0) return 0;
    return Math.round((completed / total) * 100);
}

export function GoalsPage() {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Goal[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, { total: number; completed: number }>>({});
    const [error, setError] = useState<string | null>(null);

    const [snack, setSnack] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [editing, setEditing] = useState<Goal | null>(null);
    const [saving, setSaving] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [goals, prog] = await Promise.all([fetchGoals(), fetchGoalProgress()]);
            setRows(goals);
            // convert GoalProgress record -> simpler map for rendering
            const m: Record<string, { total: number; completed: number }> = {};
            Object.keys(prog).forEach((k) => (m[k] = { total: prog[k].total, completed: prog[k].completed }));
            setProgressMap(m);
        } catch (e: any) {
            setError(e.message ?? 'Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreate = () => {
        setDialogMode('create');
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (g: Goal) => {
        setDialogMode('edit');
        setEditing(g);
        setDialogOpen(true);
    };

    const handleSubmit = async (values: GoalCreateInput) => {
        setSaving(true);
        try {
            if (dialogMode === 'create') {
                await createGoal(values);
                setSnack({ type: 'success', text: 'Goal created' });
            } else if (editing) {
                await updateGoal({ id: editing.id, ...values });
                setSnack({ type: 'success', text: 'Goal updated' });
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
            await deleteGoal(deletingId);
            setSnack({ type: 'success', text: 'Goal deleted' });
            setDeleteOpen(false);
            setDeletingId(null);
            await load();
        } catch (e: any) {
            setSnack({ type: 'error', text: e.message ?? 'Delete failed' });
        } finally {
            setSaving(false);
        }
    };

    const summary = useMemo(() => {
        const totalGoals = rows.length;
        const totals = rows.reduce(
            (acc, g) => {
                const p = progressMap[g.id];
                acc.totalTasks += p?.total ?? 0;
                acc.completedTasks += p?.completed ?? 0;
                return acc;
            },
            { totalTasks: 0, completedTasks: 0 },
        );

        return { totalGoals, ...totals };
    }, [rows, progressMap]);

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
                        Goals
                    </Typography>
                    <Typography color="text.secondary">
                        Organize tasks into goals and track progress.
                    </Typography>
                </Box>

                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                    Add Goal
                </Button>
            </Stack>

            {/* Mini summary */}
            <Card>
                <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Box>
                            <Typography fontWeight={800}>{summary.totalGoals}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Goals
                            </Typography>
                        </Box>

                        <Box>
                            <Typography fontWeight={800}>{summary.totalTasks}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total linked tasks
                            </Typography>
                        </Box>

                        <Box>
                            <Typography fontWeight={800}>{summary.completedTasks}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Completed tasks
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* List */}
            <Card>
                <CardContent>
                    {loading ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                            <CircularProgress />
                        </Stack>
                    ) : error ? (
                        <Box>
                            <Alert severity="error">{error}</Alert>
                            <Button sx={{ mt: 2 }} onClick={load}>
                                Retry
                            </Button>
                        </Box>
                    ) : rows.length === 0 ? (
                        <Box sx={{ py: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                No goals yet
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                Create a goal and start linking tasks to it.
                            </Typography>
                            <Button sx={{ mt: 2 }} variant="contained" onClick={openCreate}>
                                Add Goal
                            </Button>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {rows.map((g) => {
                                const p = progressMap[g.id] ?? { total: 0, completed: 0 };
                                const prc = percent(p.completed, p.total);

                                return (
                                    <Card key={g.id} variant="outlined">
                                        <CardContent>
                                            <Stack spacing={1.2}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="h6" fontWeight={800} noWrap>
                                                            {g.name}
                                                        </Typography>
                                                        {g.description ? (
                                                            <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                                                                {g.description}
                                                            </Typography>
                                                        ) : null}

                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            {g.start_date ? `Start: ${g.start_date}` : 'Start: —'} ·{' '}
                                                            {g.end_date ? `End: ${g.end_date}` : 'End: —'}
                                                        </Typography>
                                                    </Box>

                                                    <Stack direction="row" spacing={0.5}>
                                                        <IconButton aria-label="edit goal" onClick={() => openEdit(g)}>
                                                            <EditOutlinedIcon />
                                                        </IconButton>
                                                        <IconButton aria-label="delete goal" onClick={() => askDelete(g.id)}>
                                                            <DeleteOutlineIcon />
                                                        </IconButton>
                                                    </Stack>
                                                </Stack>

                                                <Stack spacing={0.5}>
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Typography variant="body2" color="text.secondary">
                                                            Progress
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={700}>
                                                            {prc}% ({p.completed}/{p.total})
                                                        </Typography>
                                                    </Stack>
                                                    <LinearProgress variant="determinate" value={prc} />
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}
                </CardContent>
            </Card>

            <GoalDialog
                open={dialogOpen}
                mode={dialogMode}
                initial={editing}
                loading={saving}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSubmit}
            />

            <DeleteConfirmDialog
                open={deleteOpen}
                title="Delete goal"
                message="Tasks linked to this goal will keep existing, but goal link may be removed (if FK is ON DELETE SET NULL)."
                loading={saving}
                onClose={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
            />

            {/* Snackbar without null-children TS issue */}
            {snack && (
                <Snackbar open autoHideDuration={2500} onClose={() => setSnack(null)}>
                    <Alert severity={snack.type} onClose={() => setSnack(null)} variant="filled">
                        {snack.text}
                    </Alert>
                </Snackbar>
            )}
        </Stack>
    );
}
