export interface Label {
  id: string;
  name: string;
  color: string;
  isPrivate?: boolean;
  createdBy?: string; // User ID who created this label
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
  avatarUrl?: string;
  role?: 'admin' | 'user' | 'child';
  password?: string;
}

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  createdAt: number;
  expiresAt: number; // 1 hour from creation
  used?: boolean;
  usedBy?: string;
  usedAt?: number;
}

export interface Item {
  id: string;
  title: string;
  quantity?: number;
  category?: string;
  location?: string;
  minimumStock?: number;
  completed: boolean;
  labels: string[];
  shopId?: string;
  isPrivate?: boolean;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'todo' | 'done';
  priority?: 'urgent' | 'normal' | 'low';
  horizon?: 'week' | 'month' | '3months' | '6months' | 'year';
  blocked?: boolean;
  blockedComment?: string;
  sprintId?: string;
  assignedTo?: string;
  dueDate?: number;
  repeatInterval?: 'week' | 'month' | 'year';
  labels?: string[];
  isPrivate?: boolean;
  archived?: boolean;
  archivedAt?: number;
  createdAt: number;
  completedAt?: number;
}

export interface ArchivedTask extends Task {
  archived: true;
  archivedAt: number;
  deleteAfter?: number; // timestamp when to auto-delete
}

export interface Note {
  id: string;
  content: string;
  linkedTo?: string;
  linkedType?: 'task' | 'item';
  labels: string[];
  pinned?: boolean;
  isPrivate?: boolean;
  createdAt: number;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  duration: SprintDuration;
  weekNumber?: number; // ISO week number when sprint started
  year?: number; // Year when sprint started
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: number;
  endDate?: number;
  assignedTo?: string; // User ID
  priority?: Priority;
  horizon?: Horizon;
  blocked: boolean;
  blockedComment?: string;
  dueDate?: number;
  repeatInterval?: 'week' | 'month' | 'year';
  labels: string[];
  isPrivate?: boolean;
  createdAt: number;
}

export interface Filter {
  id: string;
  name: string;
  type?: 'task' | 'item' | 'note';
  labelIds?: string[];
  showCompleted?: boolean;
  // Task specific
  status?: TaskStatus[];
  priority?: Priority[];
  horizon?: Horizon[];
  assignedTo?: string[];
  hasSprintId?: boolean;
  blocked?: boolean;
  // Item specific
  category?: string[];
  location?: string[];
  belowMinimumStock?: boolean;
  // Note specific
  linkedType?: ('task' | 'item')[];
  // Common
  isPrivate?: boolean;
}

export interface FilterView {
  id: string;
  name: string;
  filterId: string;
}

export interface AppSettings {
  hasCompletedOnboarding: boolean;
  sprintDuration: SprintDuration;
  currentUserId?: string;
  archiveRetention?: number; // days: 30, 60, 90, or 0 (unlimited)
  theme?: 'light' | 'dark' | 'auto';
}

export interface ProgressStats {
  tasksCompletedThisWeek: number;
  lastWeekReset: number;
}