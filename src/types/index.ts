export interface Label {
  id: string;
  name: string;
  color: string;
  isPrivate?: boolean;
  createdBy?: string;
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
export type RepeatInterval = 'week' | 'month' | 'year';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role?: 'admin' | 'user';
}

export interface InviteCode {
  id: string;
  code: string;
  createdBy?: string;
  createdAt?: number;
  expiresAt?: number;
  used?: boolean;
  usedBy?: string;
  usedAt?: number;
}

export interface Item {
  id: string;
  title: string;
  completed: boolean;
  shopId?: string;
  quantity?: number;
  priority?: Priority;
  assignedTo?: string;
  dueDate?: number;
  labels: string[];
  createdAt: number;
  createdBy?: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  blocked: boolean;
  blockedComment?: string;
  priority?: Priority;
  horizon?: Horizon;
  assignedTo?: string;
  sprintId?: string;
  dueDate?: number;
  repeatInterval?: RepeatInterval;
  completedAt?: number;
  archived?: boolean;
  archivedAt?: number;
  deleteAfter?: number;
  isPrivate?: boolean;
  labels: string[];
  createdAt: number;
  createdBy?: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  pinned?: boolean;
  linkedType?: 'task' | 'item';
  linkedTo?: string;
  labels: string[];
  createdAt: number;
  createdBy?: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  duration: SprintDuration;
  weekNumber: number;
  year: number;
  createdBy?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  allDay?: boolean;
  taskId?: string;
  createdAt: number;
  createdBy?: string;
}

export interface Filter {
  id: string;
  name: string;
  labelIds: string[];
  showCompleted: boolean;
  type: 'task' | 'item' | 'note';
}

export interface FilterView {
  id: string;
  name: string;
  filterIds: string[];
}

export interface AppSettings {
  hasCompletedOnboarding?: boolean;
  sprintDuration?: SprintDuration;
  sprintStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  currentUserId?: string;
  language?: string;
  archiveRetention?: number;
  autoCleanup?: boolean;
  theme?: 'light' | 'dark';
}

export interface ProgressStats {
  tasksCompletedThisWeek: number;
  lastWeekReset: number;
}