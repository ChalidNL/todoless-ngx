import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getISOWeek } from '../utils/dateUtils';
import { api } from '../lib/pocketbase-client';
import { pb } from '../lib/pocketbase';
import type {
  Item,
  Task,
  Note,
  Label,
  Shop,
  CalendarEvent,
  Filter,
  FilterView,
  AppSettings,
  ProgressStats,
  Sprint,
  User,
  SprintDuration,
  InviteCode,
  Reward,
  Goal,
} from '../types';

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
  rewards: Reward[];
  goals: Goal[];
  sharedView: boolean;
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
  addReward: (reward: Omit<Reward, 'id'>) => void;
  deleteReward: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setSharedView: (shared: boolean) => void;
  refreshRewards: () => Promise<void>;
  refreshGoals: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
};

const defaultSettings: AppSettings = {
  hasCompletedOnboarding: false,
  sprintDuration: '2weeks',
  sprintStartDay: 1,
  currentUserId: undefined,
  language: 'en',
  archiveRetention: 30,
  autoCleanup: true,
  theme: 'light',
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterViews, setFilterViews] = useState<FilterView[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sharedView, setSharedView] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultSettings);
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    tasksCompletedThisWeek: 0,
    lastWeekReset: getWeekStart(),
  });
  const [activeLabelFilters, setActiveLabelFilters] = useState<string[]>([]);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);

  const refreshItems = async () => setItems(await api.getItems());
  const refreshTasks = async () => setTasks(await api.getTasks());
  const refreshNotes = async () => setNotes(await api.getNotes());
  const refreshLabels = async () => setLabels(await api.getLabels());
  const refreshShops = async () => setShops(await api.getShops());
  const refreshCalendarEvents = async () => setCalendarEvents(await api.getCalendarEvents());
  const refreshSprints = async () => setSprints(await api.getSprints());
  const refreshUsers = async () => setUsers(await api.getUsers());
  const refreshInvites = async () => setInviteCodes(await api.getInvites());
  const refreshRewards = async () => setRewards(await api.getRewards());
  const refreshGoals = async () => setGoals(await api.getGoals());

  const refreshSettings = async () => {
    const settings = await api.getSettings();
    const currentUserId = pb.authStore.record?.id;
    setAppSettings((prev) => ({
      ...prev,
      ...settings,
      currentUserId,
      hasCompletedOnboarding: true,
    }));
  };

  const refreshAll = async () => {
    if (!pb.authStore.isValid || !pb.authStore.record) {
      setItems([]);
      setTasks([]);
      setNotes([]);
      setLabels([]);
      setShops([]);
      setCalendarEvents([]);
      setSprints([]);
      setUsers([]);
      setInviteCodes([]);
      setRewards([]);
      setGoals([]);
      setAppSettings(defaultSettings);
      return;
    }

    await Promise.all([
      refreshItems(),
      refreshTasks(),
      refreshNotes(),
      refreshLabels(),
      refreshShops(),
      refreshCalendarEvents(),
      refreshSprints(),
      refreshUsers(),
      refreshInvites(),
      refreshRewards(),
      refreshGoals(),
      refreshSettings(),
    ]);
  };

  useEffect(() => {
    const onChangeUnsub = pb.authStore.onChange(() => {
      void refreshAll();
    });

    void refreshAll();

    return () => {
      onChangeUnsub();
    };
  }, []);

  useEffect(() => {
    if (!pb.authStore.isValid) return;

    const subscribeAll = async () => {
      await Promise.all([
        pb.collection('tasks').subscribe('*', () => void refreshTasks()),
        pb.collection('items').subscribe('*', () => void refreshItems()),
        pb.collection('notes').subscribe('*', () => void refreshNotes()),
        pb.collection('labels').subscribe('*', () => void refreshLabels()),
        pb.collection('shops').subscribe('*', () => void refreshShops()),
        pb.collection('calendar_events').subscribe('*', () => void refreshCalendarEvents()),
        pb.collection('sprints').subscribe('*', () => void refreshSprints()),
        pb.collection('invite_codes').subscribe('*', () => void refreshInvites()),
        pb.collection('app_settings').subscribe('*', () => void refreshSettings()),
      ]);
    };

    void subscribeAll();

    return () => {
      pb.collection('tasks').unsubscribe();
      pb.collection('items').unsubscribe();
      pb.collection('notes').unsubscribe();
      pb.collection('labels').unsubscribe();
      pb.collection('shops').unsubscribe();
      pb.collection('calendar_events').unsubscribe();
      pb.collection('sprints').unsubscribe();
      pb.collection('invite_codes').unsubscribe();
      pb.collection('app_settings').unsubscribe();
    };
  }, [pb.authStore.isValid]);

  useEffect(() => {
    if (!pb.authStore.isValid) return;
    if (sharedView) {
      void (async () => {
        setTasks(await api.getSharedTasks());
        setItems(await api.getSharedItems());
      })();
    } else {
      void (async () => {
        await refreshTasks();
        await refreshItems();
      })();
    }
  }, [sharedView]);

  useEffect(() => {
    if (completionMessage) {
      const timer = setTimeout(() => setCompletionMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [completionMessage]);

  const addItem = (item: Omit<Item, 'id' | 'createdAt'>) => {
    void (async () => {
      await api.createItem(item);
      await refreshItems();
    })();
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    void (async () => {
      await api.createTask(task);
      await refreshTasks();
    })();
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    void (async () => {
      await api.createNote(note);
      await refreshNotes();
    })();
  };

  const addLabel = (label: Omit<Label, 'id'>) => {
    void (async () => {
      await api.createLabel(label);
      await refreshLabels();
    })();
  };

  const createLabel = addLabel;

  const addShop = (shop: Omit<Shop, 'id'>) => {
    void (async () => {
      await api.createShop(shop);
      await refreshShops();
    })();
  };

  const createShop = addShop;

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    void (async () => {
      await api.createCalendarEvent(event);
      await refreshCalendarEvents();
    })();
  };

  const addFilter = (filter: Omit<Filter, 'id'>) => {
    setFilters((prev) => [...prev, { ...filter, id: crypto.randomUUID() }]);
  };

  const addFilterView = (view: Omit<FilterView, 'id'>) => {
    setFilterViews((prev) => [...prev, { ...view, id: crypto.randomUUID() }]);
  };

  const addSprint = (sprint: Omit<Sprint, 'id'>) => {
    void (async () => {
      await api.createSprint(sprint);
      await refreshSprints();
    })();
  };

  const addUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    void (async () => {
      await api.updateItem(id, updates);
      await refreshItems();
    })();
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    void (async () => {
      await api.updateTask(id, updates);
      await refreshTasks();
    })();
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    void (async () => {
      await api.updateNote(id, updates);
      await refreshNotes();
    })();
  };

  const updateLabel = (id: string, updates: Partial<Label>) => {
    void (async () => {
      await api.updateLabel(id, updates);
      await refreshLabels();
    })();
  };

  const updateShop = (id: string, updates: Partial<Shop>) => {
    void (async () => {
      await api.updateShop(id, updates);
      await refreshShops();
    })();
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    void (async () => {
      await api.updateCalendarEvent(id, updates);
      await refreshCalendarEvents();
    })();
  };

  const updateAppSettings = (settings: Partial<AppSettings>) => {
    setAppSettings((prev) => ({ ...prev, ...settings }));
    void api.updateSettings(settings);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    void (async () => {
      await api.updateUser(id, updates);
      await refreshUsers();
    })();
  };

  const deleteItem = (id: string) => {
    void (async () => {
      await api.deleteItem(id);
      await refreshItems();
      await refreshNotes();
    })();
  };

  const deleteTask = (id: string) => {
    void (async () => {
      await api.deleteTask(id);
      await refreshTasks();
      await refreshNotes();
    })();
  };

  const deleteNote = (id: string) => {
    void (async () => {
      await api.deleteNote(id);
      await refreshNotes();
    })();
  };

  const deleteLabel = (id: string) => {
    void (async () => {
      await api.deleteLabel(id);
      await Promise.all([refreshLabels(), refreshTasks(), refreshItems(), refreshNotes()]);
    })();
  };

  const deleteShop = (id: string) => {
    void (async () => {
      await api.deleteShop(id);
      await refreshShops();
    })();
  };

  const deleteCalendarEvent = (id: string) => {
    void (async () => {
      await api.deleteCalendarEvent(id);
      await refreshCalendarEvents();
    })();
  };

  const deleteFilter = (id: string) => {
    setFilters((prev) => prev.filter((filter) => filter.id !== id));
  };

  const deleteSprint = (id: string) => {
    void (async () => {
      await api.deleteSprint(id);
      await refreshSprints();
    })();
  };

  const archiveCompletedSprintTasks = (sprintId?: string) => {
    const now = Date.now();
    const retention = appSettings.archiveRetention || 0;
    const deleteAfter = retention > 0 ? now + retention * 24 * 60 * 60 * 1000 : undefined;
    const sprint = sprintId ? sprints.find((s) => s.id === sprintId) : currentSprint;
    if (!sprint) return;

    tasks
      .filter((task) => task.status === 'done' && task.sprintId === sprint.id)
      .forEach((task) => updateTask(task.id, { archived: true, archivedAt: now, deleteAfter }));
  };

  const archiveAllDoneTasks = () => {
    const now = Date.now();
    const retention = appSettings.archiveRetention || 0;
    const deleteAfter = retention > 0 ? now + retention * 24 * 60 * 60 * 1000 : undefined;

    tasks.filter((task) => task.status === 'done' && !task.archived).forEach((task) => {
      updateTask(task.id, { archived: true, archivedAt: now, deleteAfter });
    });
  };

  const deleteArchivedTasks = () => {
    tasks.filter((task) => task.archived).forEach((task) => deleteTask(task.id));
  };

  const cleanupExpiredArchives = () => {
    const now = Date.now();
    tasks.filter((task) => task.archived && task.deleteAfter && task.deleteAfter < now).forEach((task) => deleteTask(task.id));
  };

  const moveFilterUp = (id: string) => {
    setFilters((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(index - 1, 0, item);
      return next;
    });
  };

  const moveFilterDown = (id: string) => {
    setFilters((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index < 0 || index >= prev.length - 1) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(index + 1, 0, item);
      return next;
    });
  };

  const toggleLabelFilter = (labelId: string) => {
    setActiveLabelFilters((prev) => (prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]));
  };

  const clearLabelFilters = () => setActiveLabelFilters([]);

  const showCompletionMessage = (message: string) => setCompletionMessage(message);

  const moveTaskToStatus = (taskId: string, status: 'backlog' | 'todo' | 'done') => {
    updateTask(taskId, { status });
  };

  const createNewSprint = () => {
    const now = new Date();
    const duration = appSettings.sprintDuration || '2weeks';
    const startDay = appSettings.sprintStartDay ?? 1;
    let durationDays = 14;

    if (duration === '1week') durationDays = 7;
    if (duration === '3weeks') durationDays = 21;
    if (duration === '1month') durationDays = 30;

    const currentDay = now.getDay();
    let daysUntilStart = startDay - currentDay;
    if (daysUntilStart <= 0) daysUntilStart += 7;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + daysUntilStart);
    startDate.setHours(0, 0, 0, 0);

    const sprint: Omit<Sprint, 'id'> = {
      name: `Sprint ${sprints.length + 1}`,
      startDate: startDate.getTime(),
      endDate: startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
      duration: duration as SprintDuration,
      weekNumber: getISOWeek(startDate),
      year: startDate.getFullYear(),
    };

    addSprint(sprint);
  };

  const convertTaskToItem = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    addItem({ title: task.title, completed: false, labels: task.labels });
    deleteTask(taskId);
  };

  const convertItemToTask = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    addTask({ title: item.title, status: 'todo', blocked: false, labels: item.labels });
    deleteItem(itemId);
  };

  const generateInviteCode = (): InviteCode => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + 60 * 60 * 1000;

    const inviteCode: InviteCode = {
      id: crypto.randomUUID(),
      code,
      createdBy: appSettings.currentUserId,
      createdAt: now,
      expiresAt,
      used: false,
    };

    void (async () => {
      await api.createInvite({ code, expiresAt });
      await refreshInvites();
    })();

    return inviteCode;
  };

  const validateInviteCode = (code: string): InviteCode | null => {
    const invite = inviteCodes.find((entry) => entry.code === code);
    if (!invite) return null;
    if (invite.expiresAt && invite.expiresAt < Date.now()) return null;
    if (invite.used) return null;
    return invite;
  };

  const useInviteCode = (_code: string, _userId: string): boolean => true;

  const deleteInviteCode = (id: string) => {
    void (async () => {
      await api.deleteInvite(id);
      await refreshInvites();
    })();
  };

  const uncheckAllDoneTasks = () => {
    tasks.filter((task) => task.status === 'done').forEach((task) => {
      updateTask(task.id, { status: 'todo', completedAt: undefined });
    });
  };

  const uncheckAllDoneItems = () => {
    items.filter((item) => item.completed).forEach((item) => updateItem(item.id, { completed: false }));
  };

  const addReward = (reward: Omit<Reward, 'id'>) => {
    void (async () => {
      await api.createReward(reward);
      await refreshRewards();
    })();
  };

  const deleteReward = (id: string) => {
    void (async () => {
      await api.deleteReward(id);
      await refreshRewards();
    })();
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    void (async () => {
      await api.createGoal(goal);
      await refreshGoals();
    })();
  };

  const updateGoalFn = (id: string, updates: Partial<Goal>) => {
    void (async () => {
      await api.updateGoal(id, updates);
      await refreshGoals();
    })();
  };

  const deleteGoal = (id: string) => {
    void (async () => {
      await api.deleteGoal(id);
      await refreshGoals();
    })();
  };

  const contextValue = useMemo(
    () => ({
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
      rewards,
      goals,
      sharedView,
      addReward,
      deleteReward,
      addGoal,
      updateGoal: updateGoalFn,
      deleteGoal,
      setSharedView,
      refreshRewards,
      refreshGoals,
    }),
    [
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
      rewards,
      goals,
      sharedView,
      appSettings,
      progressStats,
      activeLabelFilters,
      completionMessage,
      currentSprint,
    ],
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
