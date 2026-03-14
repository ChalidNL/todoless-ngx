import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          password_hash: string | null;
          role: 'admin' | 'user' | 'child';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password_hash?: string | null;
          role?: 'admin' | 'user' | 'child';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password_hash?: string | null;
          role?: 'admin' | 'user' | 'child';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          status: 'backlog' | 'todo' | 'done';
          priority: 'urgent' | 'normal' | 'low' | null;
          horizon: 'week' | 'month' | '3months' | '6months' | 'year' | null;
          blocked: boolean;
          blocked_comment: string | null;
          sprint_id: string | null;
          assigned_to: string | null;
          due_date: string | null;
          repeat_interval: 'week' | 'month' | 'year' | null;
          labels: string[];
          is_private: boolean;
          archived: boolean;
          archived_at: string | null;
          delete_after: string | null;
          created_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          status?: 'backlog' | 'todo' | 'done';
          priority?: 'urgent' | 'normal' | 'low' | null;
          horizon?: 'week' | 'month' | '3months' | '6months' | 'year' | null;
          blocked?: boolean;
          blocked_comment?: string | null;
          sprint_id?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          repeat_interval?: 'week' | 'month' | 'year' | null;
          labels?: string[];
          is_private?: boolean;
          archived?: boolean;
          archived_at?: string | null;
          delete_after?: string | null;
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          status?: 'backlog' | 'todo' | 'done';
          priority?: 'urgent' | 'normal' | 'low' | null;
          horizon?: 'week' | 'month' | '3months' | '6months' | 'year' | null;
          blocked?: boolean;
          blocked_comment?: string | null;
          sprint_id?: string | null;
          assigned_to?: string | null;
          due_date?: string | null;
          repeat_interval?: 'week' | 'month' | 'year' | null;
          labels?: string[];
          is_private?: boolean;
          archived?: boolean;
          archived_at?: string | null;
          delete_after?: string | null;
          created_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          title: string;
          quantity: number | null;
          category: string | null;
          location: string | null;
          minimum_stock: number | null;
          completed: boolean;
          labels: string[];
          shop_id: string | null;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          quantity?: number | null;
          category?: string | null;
          location?: string | null;
          minimum_stock?: number | null;
          completed?: boolean;
          labels?: string[];
          shop_id?: string | null;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          quantity?: number | null;
          category?: string | null;
          location?: string | null;
          minimum_stock?: number | null;
          completed?: boolean;
          labels?: string[];
          shop_id?: string | null;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          content: string;
          linked_to: string | null;
          linked_type: 'task' | 'item' | null;
          labels: string[];
          pinned: boolean;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          linked_to?: string | null;
          linked_type?: 'task' | 'item' | null;
          labels?: string[];
          pinned?: boolean;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          linked_to?: string | null;
          linked_type?: 'task' | 'item' | null;
          labels?: string[];
          pinned?: boolean;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      labels: {
        Row: {
          id: string;
          name: string;
          color: string;
          is_private: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          is_private?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          is_private?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      shops: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      sprints: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          duration: '1week' | '2weeks' | '3weeks' | '1month';
          week_number: number | null;
          year: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          duration: '1week' | '2weeks' | '3weeks' | '1month';
          week_number?: number | null;
          year?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          duration?: '1week' | '2weeks' | '3weeks' | '1month';
          week_number?: number | null;
          year?: number | null;
          created_at?: string;
        };
      };
      invite_codes: {
        Row: {
          id: string;
          code: string;
          created_by: string | null;
          created_at: string;
          expires_at: string;
          used: boolean;
          used_by: string | null;
          used_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          created_by?: string | null;
          created_at?: string;
          expires_at: string;
          used?: boolean;
          used_by?: string | null;
          used_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          created_by?: string | null;
          created_at?: string;
          expires_at?: string;
          used?: boolean;
          used_by?: string | null;
          used_at?: string | null;
        };
      };
      app_settings: {
        Row: {
          id: string;
          user_id: string | null;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          settings: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          title: string;
          start_date: string;
          end_date: string | null;
          assigned_to: string | null;
          priority: 'urgent' | 'normal' | 'low' | null;
          horizon: 'week' | 'month' | '3months' | '6months' | 'year' | null;
          blocked: boolean;
          blocked_comment: string | null;
          due_date: string | null;
          repeat_interval: 'week' | 'month' | 'year' | null;
          labels: string[];
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          start_date: string;
          end_date?: string | null;
          assigned_to?: string | null;
          priority?: 'urgent' | 'normal' | 'low' | null;
          horizon?: 'week' | 'month' | '3months' | '6months' | 'year' | null;
          blocked?: boolean;
          blocked_comment?: string | null;
          due_date?: string | null;
          repeat_interval?: 'week' | 'month' | 'year' | null;
          labels?: string[];
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          start_date?: string;
          end_date?: string | null;
          assigned_to?: string | null;
          priority?: 'urgent' | 'normal' | 'low' | null;
          horizon?: 'week' | 'month' | '3months' | '6months' | 'year' | null;
          blocked?: boolean;
          blocked_comment?: string | null;
          due_date?: string | null;
          repeat_interval?: 'week' | 'month' | 'year' | null;
          labels?: string[];
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
