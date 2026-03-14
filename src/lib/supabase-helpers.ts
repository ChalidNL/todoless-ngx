import { supabase } from './supabase';
import type { Task, Item, Note, Label, Shop, Sprint, InviteCode, CalendarEvent, User, AppSettings } from '../types';

// Helper function to get current user ID from session
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};

// Tasks
export const fetchTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title: task.title,
      status: task.status || 'backlog',
      priority: task.priority,
      horizon: task.horizon,
      blocked: task.blocked || false,
      blocked_comment: task.blockedComment,
      sprint_id: task.sprintId,
      assigned_to: task.assignedTo,
      due_date: task.dueDate,
      repeat_interval: task.repeatInterval,
      labels: task.labels || [],
      is_private: task.isPrivate || false,
      archived: task.archived || false,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      status: updates.status,
      priority: updates.priority,
      horizon: updates.horizon,
      blocked: updates.blocked,
      blocked_comment: updates.blockedComment,
      sprint_id: updates.sprintId,
      assigned_to: updates.assignedTo,
      due_date: updates.dueDate,
      repeat_interval: updates.repeatInterval,
      labels: updates.labels,
      is_private: updates.isPrivate,
      archived: updates.archived,
      archived_at: updates.archivedAt,
      delete_after: updates.deleteAfter,
      completed_at: updates.completedAt,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Items
export const fetchItems = async () => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createItem = async (item: Omit<Item, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('items')
    .insert([{
      title: item.title,
      quantity: item.quantity,
      category: item.category,
      location: item.location,
      minimum_stock: item.minimumStock,
      completed: item.completed || false,
      labels: item.labels || [],
      shop_id: item.shopId,
      is_private: item.isPrivate || false,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateItem = async (id: string, updates: Partial<Item>) => {
  const { data, error } = await supabase
    .from('items')
    .update({
      title: updates.title,
      quantity: updates.quantity,
      category: updates.category,
      location: updates.location,
      minimum_stock: updates.minimumStock,
      completed: updates.completed,
      labels: updates.labels,
      shop_id: updates.shopId,
      is_private: updates.isPrivate,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteItem = async (id: string) => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Notes
export const fetchNotes = async () => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([{
      content: note.content,
      linked_to: note.linkedTo,
      linked_type: note.linkedType,
      labels: note.labels || [],
      pinned: note.pinned || false,
      is_private: note.isPrivate || false,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateNote = async (id: string, updates: Partial<Note>) => {
  const { data, error } = await supabase
    .from('notes')
    .update({
      content: updates.content,
      linked_to: updates.linkedTo,
      linked_type: updates.linkedType,
      labels: updates.labels,
      pinned: updates.pinned,
      is_private: updates.isPrivate,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteNote = async (id: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Labels
export const fetchLabels = async () => {
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const createLabel = async (label: Omit<Label, 'id'>) => {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('labels')
    .insert([{
      name: label.name,
      color: label.color,
      is_private: label.isPrivate || false,
      created_by: userId,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateLabel = async (id: string, updates: Partial<Label>) => {
  const { data, error } = await supabase
    .from('labels')
    .update({
      name: updates.name,
      color: updates.color,
      is_private: updates.isPrivate,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteLabel = async (id: string) => {
  const { error } = await supabase
    .from('labels')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Shops
export const fetchShops = async () => {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const createShop = async (shop: Omit<Shop, 'id'>) => {
  const { data, error } = await supabase
    .from('shops')
    .insert([{
      name: shop.name,
      color: shop.color,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateShop = async (id: string, updates: Partial<Shop>) => {
  const { data, error } = await supabase
    .from('shops')
    .update({
      name: updates.name,
      color: updates.color,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteShop = async (id: string) => {
  const { error } = await supabase
    .from('shops')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Sprints
export const fetchSprints = async () => {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createSprint = async (sprint: Omit<Sprint, 'id'>) => {
  const { data, error } = await supabase
    .from('sprints')
    .insert([{
      name: sprint.name,
      start_date: sprint.startDate,
      end_date: sprint.endDate,
      duration: sprint.duration,
      week_number: sprint.weekNumber,
      year: sprint.year,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSprint = async (id: string) => {
  const { error } = await supabase
    .from('sprints')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Calendar Events
export const fetchCalendarEvents = async () => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('start_date', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert([{
      title: event.title,
      start_date: event.startDate,
      end_date: event.endDate,
      assigned_to: event.assignedTo,
      priority: event.priority,
      horizon: event.horizon,
      blocked: event.blocked || false,
      blocked_comment: event.blockedComment,
      due_date: event.dueDate,
      repeat_interval: event.repeatInterval,
      labels: event.labels || [],
      is_private: event.isPrivate || false,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      title: updates.title,
      start_date: updates.startDate,
      end_date: updates.endDate,
      assigned_to: updates.assignedTo,
      priority: updates.priority,
      horizon: updates.horizon,
      blocked: updates.blocked,
      blocked_comment: updates.blockedComment,
      due_date: updates.dueDate,
      repeat_interval: updates.repeatInterval,
      labels: updates.labels,
      is_private: updates.isPrivate,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteCalendarEvent = async (id: string) => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Users
export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const createUser = async (user: Omit<User, 'id'>) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      email: user.email,
      name: user.name,
      password_hash: user.password, // Should be hashed in production
      role: user.role || 'user',
      avatar_url: user.avatarUrl,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      email: updates.email,
      name: updates.name,
      role: updates.role,
      avatar_url: updates.avatarUrl,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Invite Codes
export const fetchInviteCodes = async () => {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createInviteCode = async (inviteCode: Omit<InviteCode, 'id'>) => {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('invite_codes')
    .insert([{
      code: inviteCode.code,
      created_by: userId,
      expires_at: inviteCode.expiresAt,
      used: inviteCode.used || false,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateInviteCode = async (id: string, updates: Partial<InviteCode>) => {
  const { data, error } = await supabase
    .from('invite_codes')
    .update({
      used: updates.used,
      used_by: updates.usedBy,
      used_at: updates.usedAt,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteInviteCode = async (id: string) => {
  const { error } = await supabase
    .from('invite_codes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// App Settings
export const fetchAppSettings = async (userId: string): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    // If no settings exist, return defaults
    if (error.code === 'PGRST116') {
      return {
        currentUserId: userId,
        archivePeriod: 30,
        language: 'en',
      };
    }
    throw error;
  }
  
  return data?.settings || {
    currentUserId: userId,
    archivePeriod: 30,
    language: 'en',
  };
};

export const updateAppSettings = async (userId: string, settings: Partial<AppSettings>) => {
  const { data, error } = await supabase
    .from('app_settings')
    .upsert([{
      user_id: userId,
      settings,
    }], {
      onConflict: 'user_id'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
