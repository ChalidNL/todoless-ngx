import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Onboarding } from './components/Onboarding';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { InboxBacklog } from './components/InboxBacklog';
import { TasksView } from './components/TasksView';
import { ItemOverview } from './components/ItemOverview';
import { Notes } from './components/Notes';
import { Settings } from './components/Settings';
import { Calendar } from './components/Calendar';
import { Rewards } from './components/Rewards';
import { Dashboard } from './components/Dashboard';
import { pb } from './lib/pocketbase';
import { api } from './lib/pocketbase-client';
import { Inbox as InboxIcon, CheckSquare, ShoppingCart, FileText, Settings as SettingsIcon, CalendarDays, RefreshCw, Star, LayoutDashboard } from 'lucide-react';
import { getOnboardingMode, OnboardingMode } from './lib/onboarding-gate';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold mb-2">App Error</h1>
            <p className="text-neutral-600 mb-6 text-sm">
              Something went wrong. Reset all data to continue.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Reset All Data & Restart
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [appScreen, setAppScreen] = useState<'checking' | 'onboarding' | 'login' | 'register' | 'app'>('checking');
  const [onboardingMode, setOnboardingMode] = useState<OnboardingMode>('none');
  const { completionMessage } = useApp();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkFirstRun = async () => {
      if (loading) return;

      // 1. Check if any users exist (unauthenticated, works on fresh install)
      let hasUsers = true;
      try {
        const resp = await fetch('/api/collections/users/records?perPage=1&fields=id');
        const data = await resp.json();
        if (resp.ok && data.totalItems === 0) {
          hasUsers = false;
        }
      } catch {
        hasUsers = true;
      }

      // 2. Determine onboarding mode
      let hasSeenOnboarding = false;
      if (pb.authStore.isValid && user) {
        hasSeenOnboarding = await api.hasUserSeenOnboarding();
      }

      const mode = getOnboardingMode({
        hasUsers,
        isAuthenticated: pb.authStore.isValid && !!user,
        hasUserSeenOnboarding: hasSeenOnboarding,
      });

      const path = window.location.pathname.toLowerCase();

      if (mode === 'admin') {
        setOnboardingMode('admin');
        setAppScreen('onboarding');
        return;
      }

      if (mode === 'user') {
        setOnboardingMode('user');
        setAppScreen('onboarding');
        return;
      }

      // mode === 'none'
      if (path === '/register') {
        setAppScreen('register');
        return;
      }

      if (!pb.authStore.isValid || !user) {
        setAppScreen('login');
        return;
      }

      setAppScreen('app');
    };

    void checkFirstRun();
  }, [loading, user]);

  if (appScreen === 'checking') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
      </div>
    );
  }

  if (appScreen === 'onboarding') {
    return (
      <Onboarding
        mode={onboardingMode}
        onComplete={() => {
          setAppScreen('app');
        }}
      />
    );
  }

  if (appScreen === 'register') {
    return <Register onRegister={() => { setAppScreen('app'); navigate('/'); }} />;
  }

  if (appScreen === 'login') {
    return <Login onLogin={() => { setAppScreen('app'); navigate('/'); }} onSwitchToRegister={() => setAppScreen('register')} />;
  }

  if (!pb.authStore.isValid) {
    return <Login onLogin={() => { setAppScreen('app'); navigate('/'); }} onSwitchToRegister={() => setAppScreen('register')} />;
  }

  const isChild = (user as any)?.role === 'child';

  const navItems: { to: string; label: string; icon: React.ReactNode; childOnly?: boolean }[] = [
    { to: '/', label: 'Inbox', icon: <InboxIcon className="w-5 h-5" /> },
    { to: '/tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { to: '/calendar', label: 'Calendar', icon: <CalendarDays className="w-5 h-5" /> },
    { to: '/items', label: 'Items', icon: <ShoppingCart className="w-5 h-5" /> },
    { to: '/notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
    ...(isChild ? [{ to: '/rewards', label: 'Rewards', icon: <Star className="w-5 h-5" /> }] : []),
    { to: '/settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <main>
        <Routes>
          <Route path="/" element={<InboxBacklog />} />
          <Route path="/tasks" element={<TasksView />} />
          <Route path="/items" element={<ItemOverview />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {completionMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-neutral-200">
            <p className="text-sm text-neutral-600">{completionMessage}</p>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-area-inset-bottom z-40">
        <div className="max-w-2xl mx-auto flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 px-4 transition-colors rounded-lg ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`
              }
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
