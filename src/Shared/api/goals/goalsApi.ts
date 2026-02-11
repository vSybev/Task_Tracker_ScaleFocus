import { supabase } from '../../supabase/client';
import type { Goal, GoalCreateInput, GoalProgress, GoalUpdateInput } from './types';


export async function fetchGoals(): Promise<Goal[]> {
    const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Goal[];
}

export async function fetchGoalProgress(): Promise<Record<string, GoalProgress>> {
    const { data, error } = await supabase
        .from('tasks')
        .select('goal_id,status')
        .not('goal_id', 'is', null);

    if (error) throw new Error(error.message);

    const map: Record<string, GoalProgress> = {};
    for (const row of data ?? []) {
        const goalId = row.goal_id as string | null;
        if (!goalId) continue;

        if (!map[goalId]) map[goalId] = { goalId, total: 0, completed: 0 };
        map[goalId].total += 1;
        if (row.status === 'completed') map[goalId].completed += 1;
    }

    return map;
}

export async function createGoal(input: GoalCreateInput): Promise<Goal> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('goals')
        .insert({
            user_id: userId,
            name: input.name,
            description: input.description ?? null,
            start_date: input.start_date ?? null,
            end_date: input.end_date ?? null,
        })
        .select('*')
        .single();

    if (error) throw new Error(error.message);
    return data as Goal;
}

export async function updateGoal(input: GoalUpdateInput): Promise<Goal> {
    const { id, ...patch } = input;

    const { data, error } = await supabase
        .from('goals')
        .update({
            ...patch,
            description: patch.description ?? undefined,
            start_date: patch.start_date ?? undefined,
            end_date: patch.end_date ?? undefined,
        })
        .eq('id', id)
        .select('*')
        .single();

    if (error) throw new Error(error.message);
    return data as Goal;
}

export async function deleteGoal(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

export async function fetchGoalsForSelect(): Promise<Pick<Goal, 'id' | 'name'>[]> {
    const { data, error } = await supabase
        .from('goals')
        .select('id,name')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Pick<Goal, 'id' | 'name'>[];
}