// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Onboarding } from '../Onboarding';

const {
  updateAppSettingsMock,
  registerAdminMock,
  createFamilyMock,
  updateUserFamilyMock,
  markOnboardingSeenMock,
} = vi.hoisted(() => ({
  updateAppSettingsMock: vi.fn(),
  registerAdminMock: vi.fn(),
  createFamilyMock: vi.fn(),
  updateUserFamilyMock: vi.fn(),
  markOnboardingSeenMock: vi.fn(),
}));

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({ updateAppSettings: updateAppSettingsMock }),
}));

vi.mock('../../lib/pocketbase-client', () => ({
  api: {
    registerAdmin: registerAdminMock,
    createFamily: createFamilyMock,
    updateUserFamily: updateUserFamilyMock,
    markOnboardingSeen: markOnboardingSeenMock,
  },
}));

describe('Onboarding admin flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not mark setup complete when family creation fails', async () => {
    registerAdminMock.mockResolvedValueOnce({ user: { id: 'admin-1' } });
    createFamilyMock.mockRejectedValueOnce(new Error('Family service unavailable'));

    const onComplete = vi.fn();
    render(<Onboarding mode="admin" onComplete={onComplete} />);

    // Door info slides heen
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByText('Volgende'));
    }

    // Family stap
    fireEvent.change(screen.getByPlaceholderText('Familie Jansen'), {
      target: { value: 'Familie Test' },
    });
    fireEvent.click(screen.getByText('Volgende'));

    // Admin account stap
    fireEvent.change(screen.getByPlaceholderText('Jan Jansen'), {
      target: { value: 'Admin User' },
    });
    fireEvent.change(screen.getByPlaceholderText('admin@voorbeeld.nl'), {
      target: { value: 'admin@example.com' },
    });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    fireEvent.click(screen.getByText('Account aanmaken'));

    await waitFor(() => {
      expect(createFamilyMock).toHaveBeenCalledWith('Familie Test', 'admin-1');
    });

    expect(markOnboardingSeenMock).not.toHaveBeenCalled();
    expect(updateAppSettingsMock).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(updateUserFamilyMock).not.toHaveBeenCalled();
    expect(screen.getByText('Kon familie niet aanmaken. Controleer de familienaam of probeer opnieuw.')).toBeTruthy();
  });
});
