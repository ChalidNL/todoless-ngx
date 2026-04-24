import React, { useState } from 'react';
import { Brain, Inbox, Calendar, Check, Eye, EyeOff, ShoppingCart, StickyNote, UserPlus, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from './AuthProvider';
import { api } from '../lib/pocketbase-client';
import { AppLogo } from './shared/AppLogo';

interface OnboardingProps {
  mode: 'admin' | 'user';
  onComplete: () => void;
}

export const Onboarding = ({ mode, onComplete }: OnboardingProps) => {
  const { updateAppSettings } = useApp();
  const { signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const isAdmin = mode === 'admin';

  const steps = [
    {
      icon: <Sparkles className="w-16 h-16 text-neutral-900" />,
      title: 'Welcome to todoless-ngx',
      description: 'Your daily assistant for quick, simple productivity without overwhelm.',
    },
    {
      icon: <Inbox className="w-16 h-16 text-neutral-900" />,
      title: 'Brain Dump & Inbox',
      description: 'Capture everything in Inbox. Quick brain dumps convert to Tasks, Items or Notes with one click.',
    },
    {
      icon: <Calendar className="w-16 h-16 text-neutral-900" />,
      title: 'Tasks & Sprint Planning',
      description: 'Organize tasks with labels, due dates, priority and assignments. Create sprints to focus on what matters now.',
    },
    {
      icon: <Check className="w-16 h-16 text-neutral-900" />,
      title: 'Checked Out System',
      description: 'Completed items and tasks automatically move to "Checked Out" sections. Check them back in or use "Check In All" to restore.',
    },
    {
      icon: <ShoppingCart className="w-16 h-16 text-neutral-900" />,
      title: 'Items & Shopping',
      description: 'Track groceries with quantities and stores. Convert tasks to items instantly when needed.',
    },
    {
      icon: <StickyNote className="w-16 h-16 text-neutral-900" />,
      title: 'Notes & Knowledge',
      description: 'Create standalone notes or pin important notes at the top. Link notes to tasks for context.',
    },
  ];

  // Add admin creation step for first-time setup
  if (isAdmin) {
    steps.push({
      icon: <UserPlus className="w-16 h-16 text-neutral-900" />,
      title: 'Create Admin Account',
      description: 'Set up your administrator account to get started.',
    });
  } else {
    steps.push({
      icon: <Check className="w-16 h-16 text-neutral-900" />,
      title: "Let's Start",
      description: 'Ready to unload your mind and get organized?',
    });
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (isAdmin) {
        handleCreateAdmin();
      } else {
        handleUserOnboardingComplete();
      }
    }
  };

  const handleCreateAdmin = async () => {
    if (!email || !password || !name) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const { error: signUpError } = await signUp(email, password, name, '');
    if (signUpError) {
      setError(signUpError.message || 'Failed to create admin account');
      return;
    }

    // Admin setup: create app_settings record with setup_complete=true
    await api.markOnboardingSeen(true);
    updateAppSettings({ hasCompletedOnboarding: true, setupComplete: true });
    onComplete();
  };

  const handleUserOnboardingComplete = async () => {
    // Regular user: create app_settings record (setup_complete stays false)
    await api.markOnboardingSeen(false);
    updateAppSettings({ hasCompletedOnboarding: true });
    onComplete();
  };

  const handleSkip = () => {
    if (isAdmin) {
      // Can't skip initial setup
      return;
    }
    handleUserOnboardingComplete();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const showAdminForm = isAdmin && isLastStep;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Skip button - only show for user onboarding */}
      {!isAdmin && (
        <div className="p-4 flex justify-end">
          <button
            onClick={handleSkip}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Skip
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {showAdminForm ? (
          // Admin creation form
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center mb-8">
              <AppLogo size="lg" showText={true} variant="dark" />
            </div>

            <h1 className="text-2xl mb-4 text-center text-neutral-900">
              {step.title}
            </h1>

            <p className="text-center text-neutral-600 max-w-sm mx-auto mb-8">
              {step.description}
            </p>

            <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="relative">
                <label className="block text-sm text-neutral-600 mb-1">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform translate-y-1 text-neutral-500 hover:text-neutral-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                onClick={handleCreateAdmin}
                className="w-full bg-neutral-900 text-white py-3 rounded-lg hover:bg-neutral-800 transition-colors font-medium"
              >
                Create Admin Account
              </button>

              <p className="text-xs text-neutral-500 text-center">
                This will be the only account with permission to invite new users.
              </p>
            </div>
          </div>
        ) : (
          // Regular onboarding steps
          <>
            <div className="mb-8">
              {step.icon}
            </div>

            <h1 className="text-2xl mb-4 text-center text-neutral-900">
              {step.title}
            </h1>

            <p className="text-center text-neutral-600 max-w-sm mb-12">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex gap-2 mb-12">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-neutral-900' : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleNext}
              className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
