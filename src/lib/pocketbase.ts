import PocketBase from 'pocketbase';

// Get PocketBase URL from environment variable or use default
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Create a single PocketBase client instance
export const pb = new PocketBase(POCKETBASE_URL);

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

// Database types (TypeScript interfaces)
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: 'admin' | 'user' | 'child';
  avatar?: string;
  created: string;
  updated: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'todo' | 'done';
  priority?: 'urgent' | 'normal' | 'low';
  horizon?: 'week' | 'month' | '3months' | '6months' | 'year';
  blocked: boolean;
  blocked_comment?: string;
  sprint_id?: string;
  assigned_to?: string;
  due_date?: string;
  repeat_interval?: 'week' | 'month' | 'year';
  labels: string[];
  is_private: boolean;
  archived: boolean;
  archived_at?: string;
  delete_after?: string;
  completed_at?: string;
  user: string; // User ID relation
  created: string;
  updated: string;
}

export interface Item {
  id: string;
  title: string;
  quantity?: number;
  category?: string;
  location?: string;
  minimum_stock?: number;
  completed: boolean;
  labels: string[];
  shop_id?: string;
  is_private: boolean;
  user: string; // User ID relation
  created: string;
  updated: string;
}

export interface Note {
  id: string;
  content: string;
  linked_to?: string;
  linked_type?: 'task' | 'item';
  labels: string[];
  pinned: boolean;
  is_private: boolean;
  user: string; // User ID relation
  created: string;
  updated: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  is_private: boolean;
  created_by: string; // User ID relation
  created: string;
}

export interface Shop {
  id: string;
  name: string;
  color: string;
  user: string; // User ID relation
  created: string;
}

export interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  duration: '1week' | '2weeks' | '3weeks' | '1month';
  week_number?: number;
  year?: number;
  user: string; // User ID relation
  created: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_date: string;
  end_date?: string;
  assigned_to?: string;
  priority?: 'urgent' | 'normal' | 'low';
  horizon?: 'week' | 'month' | '3months' | '6months' | 'year';
  blocked: boolean;
  blocked_comment?: string;
  due_date?: string;
  repeat_interval?: 'week' | 'month' | 'year';
  labels: string[];
  is_private: boolean;
  user: string; // User ID relation
  created: string;
  updated: string;
}

export interface InviteCode {
  id: string;
  code: string;
  created_by: string; // User ID relation
  expires_at: string;
  used: boolean;
  used_by?: string;
  used_at?: string;
  created: string;
}

export interface AppSettings {
  id: string;
  user: string; // User ID relation (unique)
  theme: string;
  language: string;
  archive_retention_days?: number;
  auto_cleanup: boolean;
  preferences: any; // JSON field
  created: string;
  updated: string;
}
