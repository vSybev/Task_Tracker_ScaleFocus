export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type Task = {
    id: string;
    user_id: string;

    title: string;
    description: string | null;

    due_date: string | null; // "YYYY-MM-DD"
    priority: TaskPriority;
    status: TaskStatus;

    goal_id: string | null;

    created_at: string;
    updated_at: string;
};

export type TaskCreateInput = {
    title: string;
    description?: string | null;
    due_date?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    goal_id?: string | null;
};

export type TaskUpdateInput = Partial<TaskCreateInput> & { id: string };

export type TaskFilters = {
    status?: TaskStatus | 'all';
    priority?: TaskPriority | 'all';
    due?: 'all' | 'overdue' | 'today' | 'this_week' | 'no_due_date';
    search?: string;
};
