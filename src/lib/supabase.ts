import { createClient } from '@supabase/supabase-js';

// 🔑 PASTE YOUR SUPABASE KEYS HERE
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Valentine {
  id?: string;
  code: string;
  sender_name: string;
  recipient_name?: string;
  reply?: 'yes' | 'no' | null;
  created_at?: string;
  replied_at?: string;
}
