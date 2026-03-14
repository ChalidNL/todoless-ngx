import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Item, Task, Note, Label, Shop, CalendarEvent, Filter, FilterView, AppSettings, ProgressStats, Sprint, User, InviteCode } from '../types';
import { getISOWeek } from '../utils/dateUtils';
import { api } from '../lib/pocketbase-client'; // Changed from api-client to pocketbase-client
import { pb } from '../lib/pocketbase'; // Added for real-time subscriptions

// Context for managing app state with REST API
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
  error: string | null;
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
  refreshData: () => Promise<void>;
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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({ hasCompletedOnboarding: false, sprintDuration: '2weeks' });
  const [progressStats, setProgressStats] = useState<ProgressStats>({ tasksCompletedThisWeek: 0, lastWeekReset: Date.now() });
  const [activeLabelFilters, setActiveLabelFilters] = useState<string[]>([]);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client-only filters (not synced to backend)
  const [filters, setFilters] = useState<Filter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.filters);
    return saved ? JSON.parse(saved) : [];
  });

  const [filterViews, setFilterViews] = useState<FilterView[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.filterViews);
    return saved ? JSON.parse(saved) : [];
  });

  // Load initial data
  const loadData = async () => {
    // Skip loading if not authenticated
    if (!pb.authStore.isValid) {
      console.log('⏭️ Skipping data load (not authenticated)');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('📥 Loading data from PocketBase...');

      const [
        tasksData,
        itemsData,
        notesData,
        labelsData,
        shopsData,
        sprintsData,
        calendarData,
        settingsData,
        usersData,
        invitesData
      ] = await Promise.all([
        api.getTasks(),
        api.getItems(),
        api.getNotes(),
        api.getLabels(),
        api.getShops(),
        api.getSprints(),
        api.getCalendarEvents(),
        api.getSettings(),
        api.getUsers(),
        api.getInvites()
      ]);

      setTasks(tasksData);
      setItems(itemsData);
      setNotes(notesData);
      setLabels(labelsData);
      setShops(shopsData);
      setSprints(sprintsData);
      setCalendarEvents(calendarData);
      setAppSettings(settingsData);
      setUsers(usersData);
      setInviteCodes(invitesData);

      console.log('✅ Data loaded successfully');

    } catch (err: any) {
      console.error('❌ Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when authentication state changes
  useEffect(() => {
    if (pb.authStore.isValid) {
      console.log('🔐 User authenticated, loading data...');
      loadData();
    } else {
      console.log('🔓 User not authenticated, clearing data...');
      // Clear all data when logged out
      setTasks([]);
      setItems([]);
      setNotes([]);
      setLabels([]);
      setShops([]);
      setSprints([]);
      setCalendarEvents([]);
      setUsers([]);
      setInviteCodes([]);
    }
  }, [pb.authStore.isValid]);

  // Setup PocketBase real-time subscriptions
  useEffect(() => {
    if (!pb.authStore.isValid) {
      console.log('⏭️ Skipping realtime subscriptions (not authenticated)');
      return;
    }

    console.log('🔄 Setting up PocketBase realtime subscriptions');

    // Subscribe to each collection for real-time updates
    const subscriptions = [
      pb.collection('tasks').subscribe('*', (e) => {
        console.log('📋 Tasks update:', e.action);
        api.getTasks().then(setTasks);
      }),
      pb.collection('items').subscribe('*', (e) => {
        console.log('🛒 Items update:', e.action);
        api.getItems().then(setItems);
      }),
      pb.collection('notes').subscribe('*', (e) => {
        console.log('📝 Notes update:', e.action);
        api.getNotes().then(setNotes);
      }),
      pb.collection('labels').subscribe('*', (e) => {
        console.log('🏷️ Labels update:', e.action);
        api.getLabels().then(setLabels);
      }),
      pb.collection('shops').subscribe('*', (e) => {
        console.log('🏪 Shops update:', e.action);
        api.getShops().then(setShops);
      }),
      pb.collection('sprints').subscribe('*', (e) => {
        console.log('🏃 Sprints update:', e.action);
        api.getSprints().then(setSprints);
      }),
      pb.collection('calendar_events').subscribe('*', (e) => {
        console.log('📅 Calendar update:', e.action);
        api.getCalendarEvents().then(setCalendarEvents);
      }),
    ];

    return () => {
      // Unsubscribe from all collections on cleanup
      console.log('🔕 Unsubscribing from realtime updates');
      Promise.all([
        pb.collection('tasks').unsubscribe(),
        pb.collection('items').unsubscribe(),
        pb.collection('notes').unsubscribe(),
        pb.collection('labels').unsubscribe(),
        pb.collection('shops').unsubscribe(),
        pb.collection('sprints').unsubscribe(),
        pb.collection('calendar_events').unsubscribe(),
      ]);
    };
  }, [pb.authStore.isValid]);

  // Save client-only data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filterViews, JSON.stringify(filterViews));
  }, [filterViews]);

  // Auto-clear completion message
  useEffect(() => {
    if (completionMessage) {
      const timer = setTimeout(() => setCompletionMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [completionMessage]);

  // Items
  const addItem = async (item: Omit<Item, 'id' | 'createdAt'>) => {
    const newItem = await api.createItem(item);
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const updated = await api.updateItem(id, updates);
    setItems(prev => prev.map(item => item.id === id ? updated : item));
  };

  const deleteItem = async (id: string) => {
    await api.deleteItem(id);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Tasks
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    const newTask = await api.createTask(task);
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await api.updateTask(id, updates);
    setTasks(prev => prev.map(task => task.id === id ? updated : task));
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const moveTaskToStatus = async (taskId: string, status: 'backlog' | 'todo' | 'done') => {
    await updateTask(taskId, { status });
  };

  const uncheckAllDoneTasks = async () => {
    const doneTasks = tasks.filter(t => t.status === 'done');
    await Promise.all(doneTasks.map(t => updateTask(t.id, { status: 'todo' })));
  };

  // Notes
  const addNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote = await api.createNote(note);
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const updated = await api.updateNote(id, updates);
    setNotes(prev => prev.map(note => note.id === id ? updated : note));
  };

  const deleteNote = async (id: string) => {
    await api.deleteNote(id);
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  // Labels
  const addLabel = async (label: Omit<Label, 'id'>) => {
    const newLabel = await api.createLabel(label);
    setLabels(prev => [...prev, newLabel]);
  };

  const createLabel = addLabel;

  const updateLabel = async (id: string, updates: Partial<Label>) => {
    const updated = await api.updateLabel(id, updates);
    setLabels(prev => prev.map(label => label.id === id ? updated : label));
  };

  const deleteLabel = async (id: string) => {
    await api.deleteLabel(id);
    setLabels(prev => prev.filter(label => label.id !== id));
  };

  // Shops
  const addShop = async (shop: Omit<Shop, 'id'>) => {
    const newShop = await api.createShop(shop);
    setShops(prev => [...prev, newShop]);
  };

  const createShop = addShop;

  const updateShop = async (id: string, updates: Partial<Shop>) => {
    const updated = await api.updateShop(id, updates);
    setShops(prev => prev.map(shop => shop.id === id ? updated : shop));
  };

  const deleteShop = async (id: string) => {
    await api.deleteShop(id);
    setShops(prev => prev.filter(shop => shop.id !== id));
  };

  // Sprints
  const addSprint = async (sprint: Omit<Sprint, 'id'>) => {
    const newSprint = await api.createSprint(sprint);
    setSprints(prev => [...prev, newSprint]);
  };

  const deleteSprint = async (id: string) => {
    await api.deleteSprint(id);
    setSprints(prev => prev.filter(sprint => sprint.id !== id));
  };

  const createNewSprint = async () => {
    const now = Date.now();
    const nowDate = new Date(now);
    const duration = appSettings.sprintDuration || '2weeks';
    let durationDays = 14;

    if (duration === '1week') durationDays = 7;
    else if (duration === '2weeks') durationDays = 14;
    else if (duration === '3weeks') durationDays = 21;
    else if (duration === '1month') durationDays = 30;

    const newSprint = {
      name: `Sprint ${sprints.length + 1}`,
      start_date: new Date(now).toISOString(),
      end_date: new Date(now + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      duration,
      is_active: true
    };

    await addSprint(newSprint);
  };

  // Calendar
  const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent = await api.createCalendarEvent(event);
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const updated = await api.updateCalendarEvent(id, updates);
    setCalendarEvents(prev => prev.map(event => event.id === id ? updated : event));
  };

  const deleteCalendarEvent = async (id: string) => {
    await api.deleteCalendarEvent(id);
    setCalendarEvents(prev => prev.filter(event => event.id !== id));
  };

  // Settings
  const updateAppSettings = async (settings: Partial<AppSettings>) => {
    await api.updateSettings(settings);
    setAppSettings(prev => ({ ...prev, ...settings }));
  };

  // Users
  const addUser = async (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const updated = await api.updateUser(id, updates);
    setUsers(prev => prev.map(user => user.id === id ? updated : user));
  };

  // Invites
  const generateInviteCode = async (): Promise<InviteCode> => {
    const newInvite = await api.createInvite({ max_uses: 1, expires_at: null });
    setInviteCodes(prev => [...prev, newInvite]);
    return newInvite;
  };

  const deleteInviteCode = async (id: string) => {
    await api.deleteInvite(id);
    setInviteCodes(prev => prev.filter(invite => invite.id !== id));
  };

  const validateInviteCode = (code: string): InviteCode | null => {
    const invite = inviteCodes.find(i => i.code === code);
    if (!invite) return null;
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) return null;
    if (invite.used_by) return null;
    return invite;
  };

  const useInviteCode = async (code: string, userId: string): Promise<boolean> => {
    const invite = validateInviteCode(code);
    if (!invite) return false;
    // Mark as used on backend would happen during registration
    return true;
  };

  // Client-only filters
  const addFilter = (filter: Omit<Filter, 'id'>) => {
    setFilters(prev => [...prev, { ...filter, id: generateId() }]);
  };

  const addFilterView = (view: Omit<FilterView, 'id'>) => {
    setFilterViews(prev => [...prev, { ...view, id: generateId() }]);
  };

  const deleteFilter = (id: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== id));
  };

  const moveFilterUp = (id: string) => {
    setFilters(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index > 0) {
        const newFilters = [...prev];
        [newFilters[index - 1], newFilters[index]] = [newFilters[index], newFilters[index - 1]];
        return newFilters;
      }
      return prev;
    });
  };

  const moveFilterDown = (id: string) => {
    setFilters(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index < prev.length - 1) {
        const newFilters = [...prev];
        [newFilters[index], newFilters[index + 1]] = [newFilters[index + 1], newFilters[index]];
        return newFilters;
      }
      return prev;
    });
  };

  const toggleLabelFilter = (labelId: string) => {
    setActiveLabelFilters(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
  };

  const clearLabelFilters = () => {
    setActiveLabelFilters([]);
  };

  const showCompletionMessage = (message: string) => {
    setCompletionMessage(message);
  };

  // Archive/cleanup
  const archiveCompletedSprintTasks = async (sprintId?: string) => {
    const tasksToArchive = tasks.filter(t => 
      t.status === 'done' && (!sprintId || t.sprint_id === sprintId)
    );
    await Promise.all(tasksToArchive.map(t => 
      updateTask(t.id, { archived_at: new Date().toISOString() })
    ));
  };

  const archiveAllDoneTasks = async () => {
    const doneTasks = tasks.filter(t => t.status === 'done' && !t.archived_at);
    await Promise.all(doneTasks.map(t => 
      updateTask(t.id, { archived_at: new Date().toISOString() })
    ));
  };

  const deleteArchivedTasks = async () => {
    const archivedTasks = tasks.filter(t => t.archived_at);
    await Promise.all(archivedTasks.map(t => deleteTask(t.id)));
  };

  const cleanupExpiredArchives = async () => {
    const retention = appSettings.archiveRetention || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retention);

    const expiredTasks = tasks.filter(t => 
      t.archived_at && new Date(t.archived_at) < cutoffDate
    );
    await Promise.all(expiredTasks.map(t => deleteTask(t.id)));
  };

  const convertTaskToItem = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await addItem({ title: task.title, labels: task.labels || [], status: 'todo', priority: task.priority });
      await deleteTask(taskId);
    }
  };

  const convertItemToTask = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      await addTask({ title: item.title, labels: item.labels || [], status: 'todo', priority: item.priority || 'normal' });
      await deleteItem(itemId);
    }
  };

  const uncheckAllDoneItems = async () => {
    const doneItems = items.filter(i => i.completed_at);
    await Promise.all(doneItems.map(i => updateItem(i.id, { completed_at: null, status: 'todo' })));
  };

  const refreshData = async () => {
    await loadData();
  };

  const contextValue = useMemo(() => ({
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
    error,
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
    refreshData,
  }), [
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
    error,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};