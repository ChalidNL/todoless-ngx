import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Item, Task, Note, Label, Shop, CalendarEvent, Filter, FilterView, AppSettings, ProgressStats, Sprint, User, SprintDuration, InviteCode } from '../types';
import { getISOWeek } from '../utils/dateUtils';

// Context for managing app state
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
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  addLabel: (label: Omit<Label, 'id'>) => void;
  createLabel: (label: Omit<Label, 'id'>) => void;
  addShop: (shop: Omit<Shop, 'id'>) => void;
  createShop: (shop: Omit<Shop, 'id'>) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  addFilter: (filter: Omit<Filter, 'id'>) => void;
  addFilterView: (view: Omit<FilterView, 'id'>) => void;
  addSprint: (sprint: Omit<Sprint, 'id'>) => void;
  addUser: (user: User) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  updateShop: (id: string, updates: Partial<Shop>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteItem: (id: string) => void;
  deleteTask: (id: string) => void;
  deleteNote: (id: string) => void;
  deleteLabel: (id: string) => void;
  deleteShop: (id: string) => void;
  deleteCalendarEvent: (id: string) => void;
  deleteFilter: (id: string) => void;
  deleteSprint: (id: string) => void;
  archiveCompletedSprintTasks: (sprintId?: string) => void;
  archiveAllDoneTasks: () => void;
  deleteArchivedTasks: () => void;
  cleanupExpiredArchives: () => void;
  moveFilterUp: (id: string) => void;
  moveFilterDown: (id: string) => void;
  toggleLabelFilter: (labelId: string) => void;
  clearLabelFilters: () => void;
  showCompletionMessage: (message: string) => void;
  moveTaskToStatus: (taskId: string, status: 'backlog' | 'todo' | 'done') => void;
  createNewSprint: () => void;
  convertTaskToItem: (taskId: string) => void;
  convertItemToTask: (itemId: string) => void;
  generateInviteCode: () => InviteCode;
  validateInviteCode: (code: string) => InviteCode | null;
  useInviteCode: (code: string, userId: string) => boolean;
  deleteInviteCode: (id: string) => void;
  uncheckAllDoneTasks: () => void;
  uncheckAllDoneItems: () => void;
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
  items: 'todoless_items',
  tasks: 'todoless_tasks',
  notes: 'todoless_notes',
  labels: 'todoless_labels',
  shops: 'todoless_shops',
  calendarEvents: 'todoless_calendarEvents',
  filters: 'todoless_filters',
  filterViews: 'todoless_filterViews',
  sprints: 'todoless_sprints',
  users: 'todoless_users',
  inviteCodes: 'todoless_inviteCodes',
  appSettings: 'todoless_appSettings',
  progressStats: 'todoless_progressStats',
};

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.items);
    const parsed = saved ? JSON.parse(saved) : [];
    // Migrate old data to ensure labels array exists
    return parsed.map((item: any) => ({
      ...item,
      labels: item.labels || [],
    }));
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.tasks);
    const parsed = saved ? JSON.parse(saved) : [];
    // Migrate old data to ensure labels array exists and status is set correctly
    return parsed.map((task: any) => {
      // Migrate from old 'completed' boolean to new 'status' property
      let status = task.status;
      if (!status) {
        // If no status property exists, derive it from 'completed' or default to 'todo'
        if (task.completed === true) {
          status = 'done';
        } else {
          status = 'todo';
        }
      }
      
      return {
        ...task,
        labels: task.labels || [],
        status: status,
      };
    });
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.notes);
    const parsed = saved ? JSON.parse(saved) : [];
    // Migrate old data to ensure labels array and pinned exist
    return parsed.map((note: any) => ({
      ...note,
      labels: note.labels || [],
      pinned: note.pinned || false,
    }));
  });

  const [labels, setLabels] = useState<Label[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.labels);
    return saved ? JSON.parse(saved) : [];
  });

  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.shops);
    return saved ? JSON.parse(saved) : [];
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.calendarEvents);
    return saved ? JSON.parse(saved) : [];
  });

  const [filters, setFilters] = useState<Filter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.filters);
    return saved ? JSON.parse(saved) : [];
  });

  const [filterViews, setFilterViews] = useState<FilterView[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.filterViews);
    return saved ? JSON.parse(saved) : [];
  });

  const [sprints, setSprints] = useState<Sprint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.sprints);
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.users);
    return saved ? JSON.parse(saved) : [];
  });

  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.inviteCodes);
    return saved ? JSON.parse(saved) : [];
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.appSettings);
    return saved ? JSON.parse(saved) : {
      hasCompletedOnboarding: false,
      sprintDuration: '2weeks',
      currentUserId: undefined,
    };
  });

  const [progressStats, setProgressStats] = useState<ProgressStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.progressStats);
    const stats = saved ? JSON.parse(saved) : {
      tasksCompletedThisWeek: 0,
      lastWeekReset: getWeekStart(),
    };

    // Reset weekly counter if it's a new week
    const currentWeekStart = getWeekStart();
    if (stats.lastWeekReset < currentWeekStart) {
      return {
        tasksCompletedThisWeek: 0,
        lastWeekReset: currentWeekStart,
      };
    }

    return stats;
  });

  const [activeLabelFilters, setActiveLabelFilters] = useState<string[]>([]);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.labels, JSON.stringify(labels));
  }, [labels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.shops, JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.calendarEvents, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.filterViews, JSON.stringify(filterViews));
  }, [filterViews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sprints, JSON.stringify(sprints));
  }, [sprints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.inviteCodes, JSON.stringify(inviteCodes));
  }, [inviteCodes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.appSettings, JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.progressStats, JSON.stringify(progressStats));
  }, [progressStats]);

  // Auto-clear completion message after 3 seconds
  useEffect(() => {
    if (completionMessage) {
      const timer = setTimeout(() => setCompletionMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [completionMessage]);

  // Auto-cleanup expired archives (runs every hour)
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setTasks(prev => prev.filter(task => {
        if (task.archived && task.deleteAfter && task.deleteAfter < now) {
          return false; // Delete expired archives
        }
        return true;
      }));
    };
    
    cleanup(); // Run immediately on mount
    const interval = setInterval(cleanup, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval);
  }, [appSettings.archiveRetention]);

  const addItem = (item: Omit<Item, 'id' | 'createdAt'>) => {
    setItems(prev => [...prev, { ...item, id: generateId(), createdAt: Date.now() }]);
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    setTasks(prev => [...prev, { ...task, id: generateId(), createdAt: Date.now() }]);
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    setNotes(prev => [...prev, { ...note, id: generateId(), createdAt: Date.now() }]);
  };

  const addLabel = (label: Omit<Label, 'id'>) => {
    setLabels(prev => [...prev, { ...label, id: generateId(), createdBy: appSettings.currentUserId }]);
  };

  const createLabel = (label: Omit<Label, 'id'>) => {
    setLabels(prev => [...prev, { ...label, id: generateId(), createdBy: appSettings.currentUserId }]);
  };

  const addShop = (shop: Omit<Shop, 'id'>) => {
    setShops(prev => [...prev, { ...shop, id: generateId() }]);
  };

  const createShop = (shop: Omit<Shop, 'id'>) => {
    setShops(prev => [...prev, { ...shop, id: generateId() }]);
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    setCalendarEvents(prev => [...prev, { ...event, id: generateId(), createdAt: Date.now() }]);
  };

  const addFilter = (filter: Omit<Filter, 'id'>) => {
    setFilters(prev => [...prev, { ...filter, id: generateId() }]);
  };

  const addFilterView = (view: Omit<FilterView, 'id'>) => {
    setFilterViews(prev => [...prev, { ...view, id: generateId() }]);
  };

  const addSprint = (sprint: Omit<Sprint, 'id'>) => {
    setSprints(prev => [...prev, { ...sprint, id: generateId() }]);
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => (task.id === id ? { ...task, ...updates } : task)));
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => (note.id === id ? { ...note, ...updates } : note)));
  };

  const updateLabel = (id: string, updates: Partial<Label>) => {
    setLabels(prev => prev.map(label => (label.id === id ? { ...label, ...updates } : label)));
  };

  const updateShop = (id: string, updates: Partial<Shop>) => {
    setShops(prev => prev.map(shop => (shop.id === id ? { ...shop, ...updates } : shop)));
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => prev.map(event => (event.id === id ? { ...event, ...updates } : event)));
  };

  const updateAppSettings = (settings: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...settings }));
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => (user.id === id ? { ...user, ...updates } : user)));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setNotes(prev => prev.filter(note => !(note.linkedType === 'item' && note.linkedTo === id)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    setNotes(prev => prev.filter(note => !(note.linkedType === 'task' && note.linkedTo === id)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const deleteLabel = (id: string) => {
    setLabels(prev => prev.filter(label => label.id !== id));
    setItems(prev => prev.map(item => ({
      ...item,
      labels: item.labels.filter(labelId => labelId !== id),
    })));
    setTasks(prev => prev.map(task => ({
      ...task,
      labels: task.labels.filter(labelId => labelId !== id),
    })));
    setNotes(prev => prev.map(note => ({
      ...note,
      labels: note.labels.filter(labelId => labelId !== id),
    })));
  };

  const deleteShop = (id: string) => {
    setShops(prev => prev.filter(shop => shop.id !== id));
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(event => event.id !== id));
  };

  const deleteFilter = (id: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== id));
  };

  const deleteSprint = (id: string) => {
    setSprints(prev => prev.filter(sprint => sprint.id !== id));
  };

  const archiveCompletedSprintTasks = (sprintId?: string) => {
    const now = Date.now();
    const retention = appSettings.archiveRetention || 0;
    const deleteAfter = retention > 0 ? now + (retention * 24 * 60 * 60 * 1000) : undefined;
    
    const sprint = sprintId ? sprints.find(s => s.id === sprintId) : currentSprint;
    if (sprint) {
      setTasks(prev => prev.map(task => {
        if (task.status === 'done' && task.sprintId === sprint.id) {
          return { ...task, archived: true, archivedAt: now, deleteAfter };
        }
        return task;
      }));
    }
  };

  const archiveAllDoneTasks = () => {
    const now = Date.now();
    const retention = appSettings.archiveRetention || 0;
    const deleteAfter = retention > 0 ? now + (retention * 24 * 60 * 60 * 1000) : undefined;
    
    setTasks(prev => prev.map(task => {
      if (task.status === 'done' && !task.archived) {
        return { ...task, archived: true, archivedAt: now, deleteAfter };
      }
      return task;
    }));
  };

  const deleteArchivedTasks = () => {
    setTasks(prev => prev.filter(task => !task.archived));
  };

  const cleanupExpiredArchives = () => {
    const now = Date.now();
    setTasks(prev => prev.filter(task => {
      if (task.archived && task.deleteAfter && task.deleteAfter < now) {
        return false; // Delete expired archives
      }
      return true;
    }));
  };

  const moveFilterUp = (id: string) => {
    setFilters(prev => {
      const index = prev.findIndex(filter => filter.id === id);
      if (index > 0) {
        const newFilters = [...prev];
        const [removed] = newFilters.splice(index, 1);
        newFilters.splice(index - 1, 0, removed);
        return newFilters;
      }
      return prev;
    });
  };

  const moveFilterDown = (id: string) => {
    setFilters(prev => {
      const index = prev.findIndex(filter => filter.id === id);
      if (index < prev.length - 1) {
        const newFilters = [...prev];
        const [removed] = newFilters.splice(index, 1);
        newFilters.splice(index + 1, 0, removed);
        return newFilters;
      }
      return prev;
    });
  };

  const toggleLabelFilter = (labelId: string) => {
    setActiveLabelFilters(prev => {
      if (prev.includes(labelId)) {
        return prev.filter(id => id !== labelId);
      } else {
        return [...prev, labelId];
      }
    });
  };

  const clearLabelFilters = () => {
    setActiveLabelFilters([]);
  };

  const showCompletionMessage = (message: string) => {
    setCompletionMessage(message);
  };

  const incrementClarified = () => {
    setProgressStats(prev => ({
      ...prev,
      tasksCompletedThisWeek: prev.tasksCompletedThisWeek + 1,
    }));
  };

  const moveTaskToStatus = (taskId: string, status: 'backlog' | 'todo' | 'done') => {
    setTasks(prev => prev.map(task => (task.id === taskId ? { ...task, status } : task)));
  };

  const createNewSprint = () => {
    const now = Date.now();
    const nowDate = new Date(now);
    const duration = appSettings.sprintDuration;
    let durationDays = 14; // default 2 weeks
    
    if (duration === '1week') durationDays = 7;
    else if (duration === '2weeks') durationDays = 14;
    else if (duration === '3weeks') durationDays = 21;
    else if (duration === '1month') durationDays = 30;

    const newSprint: Omit<Sprint, 'id'> = {
      name: `Sprint ${sprints.length + 1}`,
      startDate: now,
      endDate: now + (durationDays * 24 * 60 * 60 * 1000),
      duration: duration,
      weekNumber: getISOWeek(nowDate),
      year: nowDate.getFullYear(),
    };
    const sprint = { ...newSprint, id: generateId() };
    setSprints(prev => [...prev, sprint]);
    setCurrentSprint(sprint);
  };

  const convertTaskToItem = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      addItem({ 
        title: task.title, 
        completed: false,
        labels: task.labels 
      });
      deleteTask(taskId);
    }
  };

  const convertItemToTask = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      addTask({ 
        title: item.title, 
        status: 'todo',
        blocked: false,
        labels: item.labels 
      });
      deleteItem(itemId);
    }
  };

  const generateInviteCode = (): InviteCode => {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + (60 * 60 * 1000); // 1 hour from now
    
    const inviteCode: InviteCode = {
      id: generateId(),
      code: code,
      createdBy: appSettings.currentUserId || '',
      createdAt: now,
      expiresAt: expiresAt,
    };
    setInviteCodes(prev => [...prev, inviteCode]);
    return inviteCode;
  };

  const validateInviteCode = (code: string): InviteCode | null => {
    const invite = inviteCodes.find(inviteCode => inviteCode.code === code);
    if (!invite) return null;
    
    // Check if expired
    if (invite.expiresAt < Date.now()) {
      return null;
    }
    
    // Check if already used
    if (invite.used) {
      return null;
    }
    
    return invite;
  };

  const useInviteCode = (code: string, userId: string): boolean => {
    const inviteCode = validateInviteCode(code);
    if (inviteCode) {
      setInviteCodes(prev => prev.map(invite => 
        invite.code === code 
          ? { ...invite, used: true, usedBy: userId, usedAt: Date.now() }
          : invite
      ));
      return true;
    }
    return false;
  };

  const deleteInviteCode = (id: string) => {
    setInviteCodes(prev => prev.filter(inviteCode => inviteCode.id !== id));
  };

  const uncheckAllDoneTasks = () => {
    setTasks(prev => prev.map(task => {
      if (task.status === 'done') {
        return { ...task, status: 'todo' as const, completedAt: undefined };
      }
      return task;
    }));
  };

  const uncheckAllDoneItems = () => {
    setItems(prev => prev.map(item => {
      if (item.completed) {
        return { ...item, completed: false };
      }
      return item;
    }));
  };

  // Memoize the context value to prevent unnecessary re-renders
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
    incrementClarified,
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
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};