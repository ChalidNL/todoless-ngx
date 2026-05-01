// @vitest-environment jsdom
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

const authState = vi.hoisted(() => ({ loading: false, user: null as null | { id: string } }));
const hasUserSeenOnboardingMock = vi.hoisted(() => vi.fn());
const getOnboardingModeMock = vi.hoisted(() => vi.fn());

vi.mock('../context/AppContext', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useApp: () => ({ completionMessage: null }),
}));

vi.mock('../context/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../components/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => authState,
}));

vi.mock('../components/Onboarding', () => ({
  Onboarding: ({ mode, onComplete }: { mode: 'admin' | 'user' | 'info'; onComplete: () => void }) => (
    <button onClick={onComplete}>finish-{mode}</button>
  ),
}));

vi.mock('../components/Login', () => ({ Login: () => <div>login-screen</div> }));
vi.mock('../components/Register', () => ({ Register: () => <div>register-screen</div> }));
vi.mock('../components/InboxBacklog', () => ({ InboxBacklog: () => <div>app-screen</div> }));
vi.mock('../components/TasksView', () => ({ TasksView: () => <div /> }));
vi.mock('../components/ItemOverview', () => ({ ItemOverview: () => <div /> }));
vi.mock('../components/Notes', () => ({ Notes: () => <div /> }));
vi.mock('../components/Settings', () => ({ Settings: () => <div /> }));
vi.mock('../components/Calendar', () => ({ Calendar: () => <div /> }));
vi.mock('../components/Rewards', () => ({ Rewards: () => <div /> }));
vi.mock('../components/Dashboard', () => ({ Dashboard: () => <div /> }));

vi.mock('../lib/pocketbase-client', () => ({
  api: {
    hasUserSeenOnboarding: hasUserSeenOnboardingMock,
  },
}));

const pbState = vi.hoisted(() => ({ isValid: false }));
vi.mock('../lib/pocketbase', () => ({
  pb: {
    authStore: {
      get isValid() {
        return pbState.isValid;
      },
    },
  },
}));

vi.mock('../lib/onboarding-gate', () => ({
  getOnboardingMode: getOnboardingModeMock,
}));

describe('App onboarding fast-path localStorage key', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authState.loading = false;
    authState.user = null;
    pbState.isValid = false;
    hasUserSeenOnboardingMock.mockResolvedValue(false);
    getOnboardingModeMock.mockReturnValue('info');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [{ setup_complete: true }], totalItems: 1 }),
      })
    );
  });

  it('sets onboarding localStorage key when info onboarding completes', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    const finishButton = await screen.findByText('finish-info');
    fireEvent.click(finishButton);

    await waitFor(() => {
      expect(localStorage.getItem('todoless_onboarding_completed')).toBe('anon');
      expect(screen.getByText('login-screen')).toBeTruthy();
    });
  });

  it('clears stale onboarding key when authenticated user does not match', async () => {
    authState.user = { id: 'user-2' };
    pbState.isValid = true;
    localStorage.setItem('todoless_onboarding_completed', 'user:user-1');
    getOnboardingModeMock.mockReturnValue('user');

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await screen.findByText('finish-user');

    expect(localStorage.getItem('todoless_onboarding_completed')).toBeNull();
    expect(hasUserSeenOnboardingMock).toHaveBeenCalled();
  });
});
