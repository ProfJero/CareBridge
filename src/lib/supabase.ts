import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Browser client only. Never put a service-role key in VITE_* variables.
 * The app can render its local UI without Supabase configured; data operations
 * must be disabled until a real project and the documented RLS policies exist.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)
export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
