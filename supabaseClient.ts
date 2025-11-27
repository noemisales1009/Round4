
import { createClient } from '@supabase/supabase-js';

// Access environment variables safely to prevent crashes if import.meta.env is undefined
const env = (import.meta as any).env || {};

// Try to get variables from environment, fallback to the provided keys if missing
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://ouybwkjapejgpuuujwgy.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91eWJ3a2phcGVqZ3B1dXVqd2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjQzMDYsImV4cCI6MjA3ODcwMDMwNn0.3JLJqAlW0oUCk3uprCz8j3dSSm95RG0dabXEKJbRPVo';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing! Check your environment variables.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
