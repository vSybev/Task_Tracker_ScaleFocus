export type Goal = {
    id: string;
    user_id: string;

    name: string;
    description: string | null;

    start_date: string | null; // "YYYY-MM-DD"
    end_date: string | null;

    created_at: string;
    updated_at: string;
};

export type GoalCreateInput = {
    name: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
};

export type GoalUpdateInput = Partial<GoalCreateInput> & { id: string };

export type GoalProgress = {
    goalId: string;
    total: number;
    completed: number;
};
