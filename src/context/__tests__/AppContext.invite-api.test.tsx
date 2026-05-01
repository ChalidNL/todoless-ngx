// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';

vi.mock('../../lib/pocketbase-client', () => ({
  api: {
    getItems: async () => [],
    getTasks: async () => [],
    getNotes: async () => [],
    getLabels: async () => [],
    getShops: async () => [],
    getCalendarEvents: async () => [],
    getSprints: async () => [],
    getUsers: async () => [],
    getInvites: async () => [],
    getRewards: async () => [],
    getGoals: async () => [],
    getSettings: async () => ({ hasCompletedOnboarding: true }),
  },
}));
vi.mock('../../lib/pocketbase', () => ({
  pb: {
    authStore: {
      isValid: false,
      record: null,
      onChange: () => () => {},
    },
    collection: () => ({
      subscribe: async () => {},
      unsubscribe: () => {},
    }),
  },
}));

import { AppProvider, useApp } from '../AppContext';

let capturedContext: ReturnType<typeof useApp> | null = null;

const Probe = () => {
  capturedContext = useApp();
  return null;
};

describe('AppContext invite API shape', () => {
  it('does not expose dead or local invite validation APIs', async () => {
    capturedContext = null;

    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );

    await waitFor(() => expect(capturedContext).not.toBeNull());

    expect(capturedContext).not.toHaveProperty('useInviteCode');
    expect(capturedContext).not.toHaveProperty('validateInviteCode');
  });
});
