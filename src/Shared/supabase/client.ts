import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl?.startsWith('http')) {
    throw new Error('Missing/invalid VITE_SUPABASE_URL. Check your .env file.');
}
if (!supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_ANON_KEY. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
