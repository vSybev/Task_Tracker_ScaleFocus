import { supabase } from '../../supabase/client';
import type { Task, TaskCreateInput, TaskFilters, TaskUpdateInput } from './types';

function buildQuery(filters: TaskFilters) {
    let q = supabase.from('tasks').select('*');

    if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status);
    if (filters.priority && filters.priority !== 'all') q = q.eq('priority', filters.priority);

    // ✅ NEW: Goal filter
    if (filters.goal_id) q = q.eq('goal_id', filters.goal_id);

    // Date helpers
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (filters.due === 'overdue') {
        q = q.not('due_date', 'is', null).lt('due_date', todayStr).neq('status', 'completed');
    } else if (filters.due === 'today') {
        q = q.eq('due_date', todayStr);
    } else if (filters.due === 'no_due_date') {
        q = q.is('due_date', null);
    } else if (filters.due === 'this_week') {
        const in7 = new Date(today);
        in7.setDate(in7.getDate() + 7);
        const yyyy2 = in7.getFullYear();
        const mm2 = String(in7.getMonth() + 1).padStart(2, '0');
        const dd2 = String(in7.getDate()).padStart(2, '0');
        const in7Str = `${yyyy2}-${mm2}-${dd2}`;

        q = q.not('due_date', 'is', null).gte('due_date', todayStr).lte('due_date', in7Str);
    }

    if (filters.search && filters.search.trim()) {
        const s = `%${filters.search.trim()}%`;
        q = q.or(`title.ilike.${s},description.ilike.${s}`);
    }

    return q.order('created_at', { ascending: false });
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            user_id: userId,
            title: input.title,
            description: input.description ?? null,
            due_date: input.due_date ?? null,
            priority: input.priority,
            status: input.status,
            goal_id: input.goal_id ?? null,
        })
        .select('*')
        .single();

    if (error) throw new Error(error.message);
    return data as Task;
}

export async function fetchTasks(filters: TaskFilters): Promise<Task[]> {
    const { data, error } = await buildQuery(filters);

    if (error) throw new Error(error.message);
    return (data ?? []) as Task[];
}

export async function updateTask(input: TaskUpdateInput): Promise<Task> {
    const { id, ...patch } = input;

    const { data, error } = await supabase
        .from('tasks')
        .update({
            ...patch,
            description: patch.description ?? undefined,
            due_date: patch.due_date ?? undefined,
            goal_id: patch.goal_id ?? undefined,
        })
        .eq('id', id)
        .select('*')
        .single();

    if (error) throw new Error(error.message);
    return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw new Error(error.message);
}
