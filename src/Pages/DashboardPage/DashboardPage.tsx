import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Stack,
    Typography,
    Chip,
    LinearProgress,
} from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Tooltip,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    AreaChart,
    Area,
} from 'recharts';
import { supabase } from '../../Shared/supabase/client';

type TaskStatus = 'todo' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

type TaskRow = {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string | null; // YYYY-MM-DD
    goal_id: string | null;
    created_at: string;
};

type GoalRow = {
    id: string;
    name: string;
};

function todayStr(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function percent(done: number, total: number): number {
    if (!total) return 0;
    return Math.round((done / total) * 100);
}

export function DashboardPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [tasks, setTasks] = useState<TaskRow[]>([]);
    const [goals, setGoals] = useState<GoalRow[]>([]);

    const navigate = useNavigate();
    const goTasks = (qs: string) => navigate(`/tasks${qs}`, { replace: false });

    const load = async () => {
        setLoading(true);
        setError(null);

        try {
            // tasks: минималните полета за Dashboard анализ
            const { data: tData, error: tErr } = await supabase
                .from('tasks')
                .select('id,title,status,priority,due_date,goal_id,created_at')
                .order('created_at', { ascending: false });

            if (tErr) throw new Error(tErr.message);

            const { data: gData, error: gErr } = await supabase
                .from('goals')
                .select('id,name')
                .order('created_at', { ascending: false });

            if (gErr) throw new Error(gErr.message);

            setTasks((tData ?? []) as TaskRow[]);
            setGoals((gData ?? []) as GoalRow[]);
        } catch (e: any) {
            setError(e.message ?? 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const computed = useMemo(() => {
        const today = todayStr();
        const in7 = addDaysISO(7);

        const total = tasks.length;
        const completed = tasks.filter((t) => t.status === 'completed').length;
        const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
        const todo = tasks.filter((t) => t.status === 'todo').length;

        const overdue = tasks.filter((t) => t.due_date && t.due_date < today && t.status !== 'completed').length;

        const dueToday = tasks.filter((t) => t.due_date === today).length;

        const dueNext7 = tasks.filter((t) => t.due_date && t.due_date >= today && t.due_date <= in7).length;

        const completionRate = percent(completed, total);

        const statusData = [
            { name: 'To Do', value: todo },
            { name: 'In Progress', value: inProgress },
            { name: 'Completed', value: completed },
        ];

        const priorityData = [
            { name: 'Low', value: tasks.filter((t) => t.priority === 'low').length },
            { name: 'Medium', value: tasks.filter((t) => t.priority === 'medium').length },
            { name: 'High', value: tasks.filter((t) => t.priority === 'high').length },
        ];

        // Upcoming due chart: next 7 days buckets
        const upcoming = Array.from({ length: 7 }, (_, i) => {
            const day = addDaysISO(i);
            const count = tasks.filter((t) => t.due_date === day).length;
            return { day: day.slice(5), count }; // MM-DD
        });

        // Goal progress map: goalId -> { total, completed }
        const goalAgg: Record<string, { total: number; completed: number }> = {};
        for (const t of tasks) {
            if (!t.goal_id) continue;
            if (!goalAgg[t.goal_id]) goalAgg[t.goal_id] = { total: 0, completed: 0 };
            goalAgg[t.goal_id].total += 1;
            if (t.status === 'completed') goalAgg[t.goal_id].completed += 1;
        }

        const goalsMap: Record<string, string> = {};
        for (const g of goals) goalsMap[g.id] = g.name;

        const goalProgress = Object.entries(goalAgg)
            .map(([goalId, v]) => ({
                goalId,
                name: goalsMap[goalId] ?? 'Unknown goal',
                total: v.total,
                completed: v.completed,
                pct: percent(v.completed, v.total),
            }))
            .sort((a, b) => b.pct - a.pct);

        // Focus list: overdue + today (top 6)
        const focus = tasks
            .filter((t) => (t.due_date && t.due_date <= today && t.status !== 'completed') || t.due_date === today)
            .sort((a, b) => {
                const ad = a.due_date ?? '9999-12-31';
                const bd = b.due_date ?? '9999-12-31';
                return ad.localeCompare(bd);
            })
            .slice(0, 6);

        return {
            today,
            total,
            completed,
            inProgress,
            overdue,
            dueToday,
            dueNext7,
            completionRate,
            statusData,
            priorityData,
            upcoming,
            goalProgress,
            focus,
            goalsMap,
        };
    }, [tasks, goals]);

    return (
        <Stack spacing={2}>
            {/* Header */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ md: 'center' }}
                spacing={2}
            >
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        Dashboard
                    </Typography>
                    <Typography color="text.secondary">
                        Overview for {computed.today} — focus on what’s urgent and track goal progress.
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <Button component={RouterLink} to="/tasks" variant="outlined" startIcon={<PlaylistAddOutlinedIcon />}>
                        Open Tasks
                    </Button>
                    <Button component={RouterLink} to="/goals" variant="outlined" startIcon={<FlagOutlinedIcon />}>
                        Open Goals
                    </Button>
                    <Button component={RouterLink} to="/tasks" variant="contained" startIcon={<TrendingUpOutlinedIcon />}>
                        Add / Manage
                    </Button>
                </Stack>
            </Stack>

            {/* Loading / Error */}
            {loading ? (
                <Card>
                    <CardContent>
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                            <CircularProgress />
                        </Stack>
                    </CardContent>
                </Card>
            ) : error ? (
                <Card>
                    <CardContent>
                        <Alert severity="error">{error}</Alert>
                        <Button sx={{ mt: 2 }} onClick={load}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* KPI Cards */}
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                        }}
                    >
                        <Card onClick={() => goTasks('')} sx={{ cursor: 'pointer' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography color="text.secondary">Total tasks</Typography>
                                    <TrendingUpOutlinedIcon />
                                </Stack>
                                <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                                    {computed.total}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Completion rate: {computed.completionRate}%
                                </Typography>
                                <LinearProgress variant="determinate" value={computed.completionRate} sx={{ mt: 1.5 }} />
                            </CardContent>
                        </Card>

                        <Card onClick={() => goTasks('?due=overdue')} sx={{ cursor: 'pointer' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography color="text.secondary">Overdue</Typography>
                                    <WarningAmberOutlinedIcon />
                                </Stack>
                                <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                                    {computed.overdue}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Tasks past their due date (not completed)
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card onClick={() => goTasks('?due=today')} sx={{ cursor: 'pointer' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography color="text.secondary">Due today</Typography>
                                    <ScheduleOutlinedIcon />
                                </Stack>
                                <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                                    {computed.dueToday}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Tasks scheduled for today
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card onClick={() => goTasks('?status=in_progress')} sx={{ cursor: 'pointer' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography color="text.secondary">In progress</Typography>
                                    <TaskAltOutlinedIcon />
                                </Stack>
                                <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                                    {computed.inProgress}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Currently being worked on
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Charts row */}
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' },
                        }}
                    >
                        {/* Status Pie */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={800}>
                                    Status distribution
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Where your tasks stand right now
                                </Typography>

                                <Box sx={{ height: 260, mt: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={computed.statusData} dataKey="value" nameKey="name" outerRadius={90} label>
                                                {computed.statusData.map((_, idx) => (
                                                    <Cell key={idx} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Priority Bar */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={800}>
                                    Priority load
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    How heavy is your workload by priority
                                </Typography>

                                <Box sx={{ height: 260, mt: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={computed.priorityData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="value" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Upcoming due */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={800}>
                                    Due next 7 days
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Deadlines coming up soon
                                </Typography>

                                <Box sx={{ height: 260, mt: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={computed.upcoming}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Area dataKey="count" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Total due within 7 days: <b>{computed.dueNext7}</b>
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Focus + Goals progress */}
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
                        }}
                    >
                        {/* Focus list */}
                        <Card>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" fontWeight={800}>
                                        Focus now
                                    </Typography>
                                    <Button
                                        component={RouterLink}
                                        to="/tasks"
                                        size="small"
                                        variant="text"
                                        startIcon={<PlaylistAddOutlinedIcon />}
                                    >
                                        View all
                                    </Button>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Overdue + today tasks (top)
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                {computed.focus.length === 0 ? (
                                    <Alert severity="success">Nice — no overdue/today tasks. Keep it up.</Alert>
                                ) : (
                                    <Stack spacing={1.25}>
                                        {computed.focus.map((t) => (
                                            <Box
                                                key={t.id}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                }}
                                            >
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography fontWeight={800} noWrap>
                                                        {t.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" noWrap>
                                                        {t.due_date ? `Due: ${t.due_date}` : 'No due date'}
                                                        {t.goal_id && computed.goalsMap[t.goal_id]
                                                            ? ` · Goal: ${computed.goalsMap[t.goal_id]}`
                                                            : ''}
                                                    </Typography>
                                                </Box>

                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip size="small" label={t.status.replace('_', ' ')} />
                                                    <Chip size="small" variant="outlined" label={t.priority} />
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>

                        {/* Goal progress */}
                        <Card>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" fontWeight={800}>
                                        Goal progress
                                    </Typography>
                                    <Button
                                        component={RouterLink}
                                        to="/tasks"
                                        size="small"
                                        variant="text"
                                        startIcon={<PlaylistAddOutlinedIcon />}
                                    >
                                        View tasks
                                    </Button>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    Completion by linked tasks
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                {computed.goalProgress.length === 0 ? (
                                    <Stack spacing={1.5}>
                                        <Alert severity="info">
                                            No linked tasks to goals yet. Create goals and assign tasks to see progress here.
                                        </Alert>
                                        <Button component={RouterLink} to="/goals" variant="outlined" startIcon={<FlagOutlinedIcon />}>
                                            Create goals
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Stack spacing={2}>
                                        {computed.goalProgress.slice(0, 6).map((g) => (
                                            <Box key={g.goalId}>
                                                {computed.goalProgress.slice(0, 6).map((g) => (
                                                    <Box
                                                        key={g.goalId}
                                                        onClick={() => navigate(`/tasks?goalId=${encodeURIComponent(g.goalId)}`)}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            p: 1,
                                                            borderRadius: 2,
                                                            '&:hover': { bgcolor: 'action.hover' },
                                                        }}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                navigate(`/tasks?goalId=${encodeURIComponent(g.goalId)}`);
                                                            }
                                                        }}
                                                    >
                                                        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                                                            <Typography fontWeight={800} noWrap sx={{ maxWidth: 220 }}>
                                                                {g.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {g.pct}% ({g.completed}/{g.total})
                                                            </Typography>
                                                        </Stack>

                                                        <LinearProgress variant="determinate" value={g.pct} sx={{ mt: 1 }} />

                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                            Click to view tasks in this goal
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        ))}

                                        <Button component={RouterLink} to="/goals" size="small" variant="text" startIcon={<FlagOutlinedIcon />}>
                                            Manage goals
                                        </Button>
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Footer quick hint */}
                    <Card>
                        <CardContent>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={2}
                                justifyContent="space-between"
                                alignItems={{ md: 'center' }}
                            >
                                <Box>
                                    <Typography fontWeight={900}>Next improvements</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Add Goal filter in Tasks, show Goal column (done), and build charts in Dashboard from live data.
                                    </Typography>
                                </Box>
                                <Button component={RouterLink} to="/tasks" variant="contained" startIcon={<PlaylistAddOutlinedIcon />}>
                                    Add a new task
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </>
            )}
        </Stack>
    );
}
