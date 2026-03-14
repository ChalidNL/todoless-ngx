import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Item, Task, Note, Label, Shop, CalendarEvent, Filter, FilterView, AppSettings, ProgressStats, Sprint, User, SprintDuration, InviteCode } from '../types';
import { getISOWeek } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';
import * as supabaseHelpers from '../lib/supabase-helpers';

// Context for managing app state with Supabase
interface AppContextType {
  items: Item[];
  tasks: Task[];
  notes: Note[];
  labels: Label[];
  shops: Shop[];
  calendarEvents: CalendarEvent[];
  filters: Filter[];
  filterViews: FilterView[];
  sprints: Sprint[];
  users: User[];
  inviteCodes: InviteCode[];
  appSettings: AppSettings;
  progressStats: ProgressStats;
  activeLabelFilters: string[];
  completionMessage: string | null;
  currentSprint: Sprint | null;
  isLoading: boolean;
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
  addLabel: (label: Omit<Label, 'id'>) => Promise<void>;
  createLabel: (label: Omit<Label, 'id'>) => Promise<void>;
  addShop: (shop: Omit<Shop, 'id'>) => Promise<void>;
  createShop: (shop: Omit<Shop, 'id'>) => Promise<void>;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<void>;
  addFilter: (filter: Omit<Filter, 'id'>) => void;
  addFilterView: (view: Omit<FilterView, 'id'>) => void;
  addSprint: (sprint: Omit<Sprint, 'id'>) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>;
  updateShop: (id: string, updates: Partial<Shop>) => Promise<void>;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  deleteFilter: (id: string) => void;
  deleteSprint: (id: string) => Promise<void>;
  archiveCompletedSprintTasks: (sprintId?: string) => Promise<void>;
  archiveAllDoneTasks: () => Promise<void>;
  deleteArchivedTasks: () => Promise<void>;
  cleanupExpiredArchives: () => Promise<void>;
  moveFilterUp: (id: string) => void;
  moveFilterDown: (id: string) => void;
  toggleLabelFilter: (labelId: string) => void;
  clearLabelFilters: () => void;
  showCompletionMessage: (message: string) => void;
  moveTaskToStatus: (taskId: string, status: 'backlog' | 'todo' | 'done') => Promise<void>;
  createNewSprint: () => Promise<void>;
  convertTaskToItem: (taskId: string) => Promise<void>;
  convertItemToTask: (itemId: string) => Promise<void>;
  generateInviteCode: () => Promise<InviteCode>;
  validateInviteCode: (code: string) => InviteCode | null;
  useInviteCode: (code: string, userId: string) => Promise<boolean>;
  deleteInviteCode: (id: string) => Promise<void>;
  uncheckAllDoneTasks: () => Promise<void>;
  uncheckAllDoneItems: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const STORAGE_KEYS = {
  filters: 'todoless_filters',
  filterViews: 'todoless_filterViews',
  activeLabelFilters: 'todoless_activeLabelFilters',
};

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.toISOString();
};

const getWeekEnd = () => {
  const weekStart = new Date(getWeekStart());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd.toISOString();
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Supabase-backed state
  const [items, setItems] = useState<Item[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    currentUserId: null,
    archivePeriod: 30,
    language: 'en',
  });
  
  // Local state (not persisted to Supabase)
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterViews, setFilterViews] = useState<FilterView[]>([]);
  const [activeLabelFilters, setActiveLabelFilters] = useState<string[]>([]);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load localStorage-based data
  useEffect(() => {
    const savedFilters = localStorage.getItem(STORAGE_KEYS.filters);
    const savedFilterViews = localStorage.getItem(STORAGE_KEYS.filterViews);
    const savedActiveLabelFilters = localStorage.getItem(STORAGE_KEYS.activeLabelFilters);
    
    if (savedFilters) setFilters(JSON.parse(savedFilters));
    if (savedFilterViews) setFilterViews(JSON.parse(savedFilterViews));
    if (savedActiveLabelFilters) setActiveLabelFilters(JSON.parse(savedActiveLabelFilters));
  }, []);

  // Save localStorage-based data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filterViews, JSON.stringify(filterViews));
  }, [filterViews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activeLabelFilters, JSON.stringify(activeLabelFilters));
  }, [activeLabelFilters]);

  // Load all data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load all data in parallel
        const [
          tasksData,
          itemsData,
          notesData,
          labelsData,
          shopsData,
          eventsData,
          sprintsData,
          usersData,
          inviteCodesData,
        ] = await Promise.all([
          supabaseHelpers.fetchTasks(),
          supabaseHelpers.fetchItems(),
          supabaseHelpers.fetchNotes(),
          supabaseHelpers.fetchLabels(),
          supabaseHelpers.fetchShops(),
          supabaseHelpers.fetchCalendarEvents(),
          supabaseHelpers.fetchSprints(),
          supabaseHelpers.fetchUsers(),
          supabaseHelpers.fetchInviteCodes(),
        ]);

        setTasks(tasksData);
        setItems(itemsData);
        setNotes(notesData);
        setLabels(labelsData);
        setShops(shopsData);
        setCalendarEvents(eventsData);
        setSprints(sprintsData);
        setUsers(usersData);
        setInviteCodes(inviteCodesData);

        // Load user settings if logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const settings = await supabaseHelpers.fetchAppSettings(session.user.id);
          setAppSettings(settings);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    // Subscribe to tasks changes
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        const data = await supabaseHelpers.fetchTasks();
        setTasks(data);
      })
      .subscribe();

    // Subscribe to items changes
    const itemsSubscription = supabase
      .channel('items-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, async () => {
        const data = await supabaseHelpers.fetchItems();
        setItems(data);
      })
      .subscribe();

    // Subscribe to notes changes
    const notesSubscription = supabase
      .channel('notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, async () => {
        const data = await supabaseHelpers.fetchNotes();
        setNotes(data);
      })
      .subscribe();

    // Subscribe to labels changes
    const labelsSubscription = supabase
      .channel('labels-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'labels' }, async () => {
        const data = await supabaseHelpers.fetchLabels();
        setLabels(data);
      })
      .subscribe();

    // Cleanup subscriptions
    return () => {
      tasksSubscription.unsubscribe();
      itemsSubscription.unsubscribe();
      notesSubscription.unsubscribe();
      labelsSubscription.unsubscribe();
    };
  }, []);

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const totalTasks = tasks.filter(t => !t.archived).length;
    const completedTasks = tasks.filter(t => t.status === 'done' && !t.archived).length;
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done' && !t.archived).length;
    const blockedTasks = tasks.filter(t => t.blocked && t.status !== 'done' && !t.archived).length;

    return {
      totalTasks,
      completedTasks,
      urgentTasks,
      blockedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }, [tasks]);

  // Find current sprint
  const currentSprint = useMemo(() => {
    const now = new Date();
    return sprints.find(s => {
      const start = new Date(s.startDate);
      const end = new Date(s.endDate);
      return now >= start && now <= end;
    }) || null;
  }, [sprints]);

  // CRUD Operations for Tasks
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    try {
      await supabaseHelpers.createTask(task);
      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Handle status change to 'done'
      if (updates.status === 'done' && !updates.completedAt) {
        updates.completedAt = new Date().toISOString();
      }
      
      await supabaseHelpers.updateTask(id, updates);
      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await supabaseHelpers.deleteTask(id);
      // Real-time subscription will update the state
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // CRUD Operations for Items
  const addItem = async (item: Omit<Item, 'id' | 'createdAt'>) => {
    try {
      await supabaseHelpers.createItem(item);
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      await supabaseHelpers.updateItem(id, updates);
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await supabaseHelpers.deleteItem(id);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  // CRUD Operations for Notes
  const addNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      await supabaseHelpers.createNote(note);
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      await supabaseHelpers.updateNote(id, updates);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await supabaseHelpers.deleteNote(id);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  // CRUD Operations for Labels
  const addLabel = async (label: Omit<Label, 'id'>) => {
    try {
      await supabaseHelpers.createLabel(label);
    } catch (error) {
      console.error('Error creating label:', error);
      throw error;
    }
  };

  const createLabel = addLabel; // Alias

  const updateLabel = async (id: string, updates: Partial<Label>) => {
    try {
      await supabaseHelpers.updateLabel(id, updates);
    } catch (error) {
      console.error('Error updating label:', error);
      throw error;
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      await supabaseHelpers.deleteLabel(id);
    } catch (error) {
      console.error('Error deleting label:', error);
      throw error;
    }
  };

  // CRUD Operations for Shops
  const addShop = async (shop: Omit<Shop, 'id'>) => {
    try {
      await supabaseHelpers.createShop(shop);
    } catch (error) {
      console.error('Error creating shop:', error);
      throw error;
    }
  };

  const createShop = addShop; // Alias

  const updateShop = async (id: string, updates: Partial<Shop>) => {
    try {
      await supabaseHelpers.updateShop(id, updates);
    } catch (error) {
      console.error('Error updating shop:', error);
      throw error;
    }
  };

  const deleteShop = async (id: string) => {
    try {
      await supabaseHelpers.deleteShop(id);
    } catch (error) {
      console.error('Error deleting shop:', error);
      throw error;
    }
  };

  // CRUD Operations for Calendar Events
  const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    try {
      await supabaseHelpers.createCalendarEvent(event);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      await supabaseHelpers.updateCalendarEvent(id, updates);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    try {
      await supabaseHelpers.deleteCalendarEvent(id);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  };

  // CRUD Operations for Sprints
  const addSprint = async (sprint: Omit<Sprint, 'id'>) => {
    try {
      await supabaseHelpers.createSprint(sprint);
      // Reload sprints
      const data = await supabaseHelpers.fetchSprints();
      setSprints(data);
    } catch (error) {
      console.error('Error creating sprint:', error);
      throw error;
    }
  };

  const deleteSprint = async (id: string) => {
    try {
      await supabaseHelpers.deleteSprint(id);
      // Reload sprints
      const data = await supabaseHelpers.fetchSprints();
      setSprints(data);
    } catch (error) {
      console.error('Error deleting sprint:', error);
      throw error;
    }
  };

  // User Operations
  const addUser = async (user: User) => {
    try {
      await supabaseHelpers.createUser(user);
      // Reload users
      const data = await supabaseHelpers.fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      await supabaseHelpers.updateUser(id, updates);
      // Reload users
      const data = await supabaseHelpers.fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // App Settings
  const updateAppSettings = async (settings: Partial<AppSettings>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        // Fall back to localStorage if not authenticated
        setAppSettings(prev => ({ ...prev, ...settings }));
        return;
      }

      await supabaseHelpers.updateAppSettings(session.user.id, settings);
      setAppSettings(prev => ({ ...prev, ...settings }));
    } catch (error) {
      console.error('Error updating app settings:', error);
      throw error;
    }
  };

  // Filter Operations (localStorage only)
  const addFilter = (filter: Omit<Filter, 'id'>) => {
    const newFilter = { ...filter, id: generateId() };
    setFilters(prev => [...prev, newFilter]);
  };

  const deleteFilter = (id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  };

  const moveFilterUp = (id: string) => {
    setFilters(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index <= 0) return prev;
      const newFilters = [...prev];
      [newFilters[index - 1], newFilters[index]] = [newFilters[index], newFilters[index - 1]];
      return newFilters;
    });
  };

  const moveFilterDown = (id: string) => {
    setFilters(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index < 0 || index >= prev.length - 1) return prev;
      const newFilters = [...prev];
      [newFilters[index], newFilters[index + 1]] = [newFilters[index + 1], newFilters[index]];
      return newFilters;
    });
  };

  const addFilterView = (view: Omit<FilterView, 'id'>) => {
    const newView = { ...view, id: generateId() };
    setFilterViews(prev => [...prev, newView]);
  };

  // Label Filter Operations
  const toggleLabelFilter = (labelId: string) => {
    setActiveLabelFilters(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const clearLabelFilters = () => {
    setActiveLabelFilters([]);
  };

  // Completion Message
  const showCompletionMessage = (message: string) => {
    setCompletionMessage(message);
    setTimeout(() => setCompletionMessage(null), 3000);
  };

  // Task Operations
  const moveTaskToStatus = async (taskId: string, status: 'backlog' | 'todo' | 'done') => {
    await updateTask(taskId, { status });
  };

  // Sprint Operations
  const createNewSprint = async () => {
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = now.getFullYear();
    const startDate = getWeekStart();
    const endDate = getWeekEnd();

    const newSprint: Omit<Sprint, 'id'> = {
      name: `Week ${weekNumber} ${year}`,
      startDate,
      endDate,
      duration: '1week',
      weekNumber,
      year,
    };

    await addSprint(newSprint);
  };

  // Archive Operations
  const archiveCompletedSprintTasks = async (sprintId?: string) => {
    const targetSprintId = sprintId || currentSprint?.id;
    if (!targetSprintId) return;

    const tasksToArchive = tasks.filter(
      t => t.sprintId === targetSprintId && t.status === 'done' && !t.archived
    );

    const archivePeriodDays = appSettings.archivePeriod || 30;
    const deleteAfter = archivePeriodDays === -1
      ? null
      : new Date(Date.now() + archivePeriodDays * 24 * 60 * 60 * 1000).toISOString();

    for (const task of tasksToArchive) {
      await updateTask(task.id, {
        archived: true,
        archivedAt: new Date().toISOString(),
        deleteAfter,
      });
    }

    showCompletionMessage(`Archived ${tasksToArchive.length} completed tasks from sprint`);
  };

  const archiveAllDoneTasks = async () => {
    const tasksToArchive = tasks.filter(t => t.status === 'done' && !t.archived);

    const archivePeriodDays = appSettings.archivePeriod || 30;
    const deleteAfter = archivePeriodDays === -1
      ? null
      : new Date(Date.now() + archivePeriodDays * 24 * 60 * 60 * 1000).toISOString();

    for (const task of tasksToArchive) {
      await updateTask(task.id, {
        archived: true,
        archivedAt: new Date().toISOString(),
        deleteAfter,
      });
    }

    showCompletionMessage(`Archived ${tasksToArchive.length} completed tasks`);
  };

  const deleteArchivedTasks = async () => {
    const archivedTasks = tasks.filter(t => t.archived);
    
    for (const task of archivedTasks) {
      await deleteTask(task.id);
    }

    showCompletionMessage(`Deleted ${archivedTasks.length} archived tasks`);
  };

  const cleanupExpiredArchives = async () => {
    const now = new Date();
    const expiredTasks = tasks.filter(
      t => t.archived && t.deleteAfter && new Date(t.deleteAfter) <= now
    );

    for (const task of expiredTasks) {
      await deleteTask(task.id);
    }

    if (expiredTasks.length > 0) {
      showCompletionMessage(`Cleaned up ${expiredTasks.length} expired archived tasks`);
    }
  };

  // Conversion Operations
  const convertTaskToItem = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newItem: Omit<Item, 'id' | 'createdAt'> = {
      title: task.title,
      completed: task.status === 'done',
      labels: task.labels,
      isPrivate: task.isPrivate,
      quantity: null,
      category: null,
      location: null,
      minimumStock: null,
      shopId: null,
    };

    await addItem(newItem);
    await deleteTask(taskId);
    showCompletionMessage('Converted task to item');
  };

  const convertItemToTask = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newTask: Omit<Task, 'id' | 'createdAt' | 'completedAt'> = {
      title: item.title,
      status: item.completed ? 'done' : 'backlog',
      labels: item.labels,
      isPrivate: item.isPrivate,
      priority: null,
      horizon: null,
      blocked: false,
      blockedComment: null,
      sprintId: null,
      assignedTo: null,
      dueDate: null,
      repeatInterval: null,
      archived: false,
      archivedAt: null,
      deleteAfter: null,
    };

    await addTask(newTask);
    await deleteItem(itemId);
    showCompletionMessage('Converted item to task');
  };

  // Invite Code Operations
  const generateInviteCode = async (): Promise<InviteCode> => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const newInviteCode: Omit<InviteCode, 'id'> = {
      code,
      createdAt: new Date().toISOString(),
      expiresAt,
      used: false,
      usedBy: null,
      usedAt: null,
      createdBy: appSettings.currentUserId,
    };

    const createdCode = await supabaseHelpers.createInviteCode(newInviteCode);
    
    // Reload invite codes
    const data = await supabaseHelpers.fetchInviteCodes();
    setInviteCodes(data);

    return createdCode as InviteCode;
  };

  const validateInviteCode = (code: string): InviteCode | null => {
    const invite = inviteCodes.find(ic => ic.code === code);
    if (!invite) return null;
    if (invite.used) return null;
    if (new Date(invite.expiresAt) < new Date()) return null;
    return invite;
  };

  const useInviteCode = async (code: string, userId: string): Promise<boolean> => {
    const invite = validateInviteCode(code);
    if (!invite) return false;

    await supabaseHelpers.updateInviteCode(invite.id, {
      used: true,
      usedBy: userId,
      usedAt: new Date().toISOString(),
    });

    // Reload invite codes
    const data = await supabaseHelpers.fetchInviteCodes();
    setInviteCodes(data);

    return true;
  };

  const deleteInviteCode = async (id: string) => {
    try {
      await supabaseHelpers.deleteInviteCode(id);
      // Reload invite codes
      const data = await supabaseHelpers.fetchInviteCodes();
      setInviteCodes(data);
    } catch (error) {
      console.error('Error deleting invite code:', error);
      throw error;
    }
  };

  // Bulk Operations
  const uncheckAllDoneTasks = async () => {
    const doneTasks = tasks.filter(t => t.status === 'done' && !t.archived);
    
    for (const task of doneTasks) {
      await updateTask(task.id, { status: 'backlog' });
    }

    showCompletionMessage(`Unchecked ${doneTasks.length} tasks`);
  };

  const uncheckAllDoneItems = async () => {
    const doneItems = items.filter(i => i.completed);
    
    for (const item of doneItems) {
      await updateItem(item.id, { completed: false });
    }

    showCompletionMessage(`Unchecked ${doneItems.length} items`);
  };

  // Run cleanup on mount and periodically
  useEffect(() => {
    cleanupExpiredArchives();
    const interval = setInterval(cleanupExpiredArchives, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval);
  }, []);

  const value: AppContextType = {
    items,
    tasks,
    notes,
    labels,
    shops,
    calendarEvents,
    filters,
    filterViews,
    sprints,
    users,
    inviteCodes,
    appSettings,
    progressStats,
    activeLabelFilters,
    completionMessage,
    currentSprint,
    isLoading,
    addItem,
    addTask,
    addNote,
    addLabel,
    createLabel,
    addShop,
    createShop,
    addCalendarEvent,
    addFilter,
    addFilterView,
    addSprint,
    addUser,
    updateItem,
    updateTask,
    updateNote,
    updateLabel,
    updateShop,
    updateCalendarEvent,
    updateAppSettings,
    updateUser,
    deleteItem,
    deleteTask,
    deleteNote,
    deleteLabel,
    deleteShop,
    deleteCalendarEvent,
    deleteFilter,
    deleteSprint,
    archiveCompletedSprintTasks,
    archiveAllDoneTasks,
    deleteArchivedTasks,
    cleanupExpiredArchives,
    moveFilterUp,
    moveFilterDown,
    toggleLabelFilter,
    clearLabelFilters,
    showCompletionMessage,
    moveTaskToStatus,
    createNewSprint,
    convertTaskToItem,
    convertItemToTask,
    generateInviteCode,
    validateInviteCode,
    useInviteCode,
    deleteInviteCode,
    uncheckAllDoneTasks,
    uncheckAllDoneItems,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
