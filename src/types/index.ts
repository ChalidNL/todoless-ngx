export interface Label {
  id: string;
  name: string;
  color: string;
  is_private?: boolean; // PostgreSQL uses snake_case
  created_by?: string; // User ID who created this label
}

export interface Shop {
  id: string;
  name: string;
  color: string;
}

export type Priority = 'urgent' | 'normal' | 'low';
export type Horizon = 'week' | 'month' | '3months' | '6months' | 'year';
export type TaskStatus = 'backlog' | 'todo' | 'done';
export type SprintDuration = '1week' | '2weeks' | '3weeks' | '1month';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string; // PostgreSQL uses snake_case
  role?: 'admin' | 'user';
}

export interface InviteCode {
  id: string;
  code: string;
  created_by?: string;
  created_at?: string; // ISO string from PostgreSQL
  expires_at?: string | null; // ISO string from PostgreSQL
  used_by?: string | null;
  used_at?: string | null;
  max_uses?: number;
  current_uses?: number;
}

export interface Item {
  id: string;
  title: string;
  description?: string;
  quantity?: number;
  shop_id?: string;
  status?: string;
  priority?: Priority;
  assigned_to?: string;
  due_date?: string | null;
  completed_at?: string | null;
  archived_at?: string | null;
  labels?: string[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: Priority;
  horizon?: Horizon;
  assigned_to?: string;
  sprint_id?: string;
  parent_task_id?: string;
  due_date?: string | null;
  blocked?: boolean;
  block_reason?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completed_at?: string | null;
  archived_at?: string | null;
  labels?: string[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  pinned?: boolean;
  archived?: boolean;
  labels?: string[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  duration: SprintDuration;
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  task_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Filter {
  id: string;
  name: string;
  query: string;
  type: 'task' | 'item' | 'note';
}

export interface FilterView {
  id: string;
  name: string;
  filters: string[];
}

export interface AppSettings {
  hasCompletedOnboarding?: boolean;
  sprintDuration?: SprintDuration;
  currentUserId?: string;
  language?: string;
  archiveRetention?: number; // days
  autoCleanup?: boolean;
  theme?: 'light' | 'dark';
}

export interface ProgressStats {
  tasksCompletedThisWeek: number;
  lastWeekReset: number | string;
}