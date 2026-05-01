// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Register } from '../Register';

const { signUpMock, validateInviteCodeMock } = vi.hoisted(() => ({
  signUpMock: vi.fn(),
  validateInviteCodeMock: vi.fn(),
}));

vi.mock('../AuthProvider', () => ({
  useAuth: () => ({ signUp: signUpMock }),
}));

vi.mock('../../lib/pocketbase-client', () => ({
  api: {
    validateInviteCode: validateInviteCodeMock,
  },
}));

describe('Register invite validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/register');
  });

  it('shows an error and does not call backend for short codes', async () => {
    render(<Register onRegister={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('ABC123'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByText('Validate Code'));

    expect(screen.getByText('Please enter a valid invite code')).toBeTruthy();
    expect(validateInviteCodeMock).not.toHaveBeenCalled();
  });

  it('shows backend error and does not continue when invite code is invalid', async () => {
    validateInviteCodeMock.mockRejectedValueOnce(new Error('Invalid or expired invite code'));

    render(<Register onRegister={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('ABC123'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByText('Validate Code'));

    await waitFor(() => {
      expect(validateInviteCodeMock).toHaveBeenCalledWith('ABC123');
    });

    expect(screen.getByText('Invalid or expired invite code')).toBeTruthy();
    expect(screen.queryByText('Invite code validated!')).toBeNull();
  });

  it('continues to account creation only after successful backend validation', async () => {
    validateInviteCodeMock.mockResolvedValueOnce({ id: 'inv1', code: 'ABC123' });

    render(<Register onRegister={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('ABC123'), { target: { value: 'abc123' } });
    fireEvent.click(screen.getByText('Validate Code'));

    await waitFor(() => {
      expect(screen.getByText('Invite code validated!')).toBeTruthy();
    });
  });
});
