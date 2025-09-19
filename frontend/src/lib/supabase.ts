import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `
Missing Supabase environment variables:
- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}
- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}

Please check your deployment platform's environment variables.
For Vercel: Project Settings > Environment Variables
For Netlify: Site Settings > Environment Variables
For other platforms: Check their documentation for environment variable setup.
  `.trim();

  throw new Error(errorMsg);
}

// Get current origin for dynamic redirect URLs
const getCurrentOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined, // sessionStorage: deletes token when the tab closes.
    storageKey: 'supabase.auth.token'
  }
})

// Database types (will be updated based on your schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: number
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: number
          user_id: string
          subject_id: number
          duration_minutes: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          subject_id: number
          duration_minutes: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          subject_id?: number
          duration_minutes?: number
          notes?: string | null
          created_at?: string
        }
      }
      habits: {
        Row: {
          id: number
          user_id: string
          name: string
          description: string | null
          target_frequency: number
          color: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          name: string
          description?: string | null
          target_frequency: number
          color: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          name?: string
          description?: string | null
          target_frequency?: number
          color?: string
          created_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: number
          user_id: string
          habit_id: number
          completed_date: string
        }
        Insert: {
          id?: number
          user_id: string
          habit_id: number
          completed_date: string
        }
        Update: {
          id?: number
          user_id?: string
          habit_id?: number
          completed_date?: string
        }
      }
      goals: {
        Row: {
          id: number
          user_id: string
          goal_type: string
          target_value: number
          target_unit: string
          period: string
          description: string | null
          is_active: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          goal_type: string
          target_value: number
          target_unit?: string
          period: string
          description?: string | null
          is_active?: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          goal_type?: string
          target_value?: number
          target_unit?: string
          period?: string
          description?: string | null
          is_active?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Export typed Supabase client
export type SupabaseClient = ReturnType<typeof createClient<Database>>