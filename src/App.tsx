import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext'; // Use localStorage version for demo
import { LanguageProvider } from './context/LanguageContext';
import { Onboarding } from './components/Onboarding';
import { InboxBacklog } from './components/InboxBacklog';
import { TasksView } from './components/TasksView';
import { ItemOverview } from './components/ItemOverview';
import { Notes } from './components/Notes';
import { Settings } from './components/Settings';
import { Calendar } from './components/Calendar';
import { Inbox as InboxIcon, CheckSquare, ShoppingCart, FileText, Settings as SettingsIcon, CalendarDays, RefreshCw, AlertCircle } from 'lucide-react';

type Screen = 'inbox' | 'tasks' | 'items' | 'notes' | 'calendar' | 'settings';
type AppScreen = 'onboarding' | 'app';

// Error Boundary Component
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
  const [currentScreen, setCurrentScreen] = useState<Screen>('inbox');
  const [appScreen, setAppScreen] = useState<AppScreen | null>(null); // null = checking
  const [checkingFirstRun, setCheckingFirstRun] = useState(true);
  const { completionMessage, appSettings, users } = useApp();

  // FIRST-RUN DETECTION: Check if onboarding was completed
  useEffect(() => {
    const checkFirstRun = () => {
      // Check if onboarding was already completed
      const onboardingComplete = localStorage.getItem('onboarding_complete');
      const hasCompletedOnboarding = appSettings.hasCompletedOnboarding;
      
      if (onboardingComplete === 'true' || hasCompletedOnboarding || users.length > 0) {
        console.log('✅ Onboarding already completed');
        setAppScreen('app');
      } else {
        console.log('🆕 First run detected → Showing onboarding');
        setAppScreen('onboarding');
      }
      
      setCheckingFirstRun(false);
    };

    checkFirstRun();
  }, [appSettings, users]);

  // Show loading while checking for first run
  if (checkingFirstRun) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
      </div>
    );
  }

  // If we determined this is onboarding, show it
  if (appScreen === 'onboarding') {
    return (
      <Onboarding
        onComplete={() => {
          console.log('✅ Onboarding completed');
          localStorage.setItem('onboarding_complete', 'true');
          setAppScreen('app');
          // Note: User is already logged in from onboarding registration
        }}
      />
    );
  }

  // User is authenticated → show main app
  const renderScreen = () => {
    switch (currentScreen) {
      case 'inbox':
        return <InboxBacklog />;
      case 'tasks':
        return <TasksView />;
      case 'items':
        return <ItemOverview />;
      case 'notes':
        return <Notes />;
      case 'calendar':
        return <Calendar />;
      case 'settings':
        return <Settings />;
    }
  };

  const navItems: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'items', label: 'Items', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Main Content */}
      <main>{renderScreen()}</main>

      {/* Completion Message Toast */}
      {completionMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-neutral-200">
            <p className="text-sm text-neutral-600">{completionMessage}</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-area-inset-bottom z-40">
        <div className="max-w-2xl mx-auto flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center gap-1 py-3 px-4 transition-colors rounded-lg ${
                currentScreen === item.id
                  ? 'bg-black text-white'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ErrorBoundary>
    </AppProvider>
  );
}