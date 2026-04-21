import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewGlobalHeader } from '../shared/NewGlobalHeader';

vi.mock('../../context/AppContext', () => ({
  useApp: vi.fn(() => ({
    users: [],
    labels: [],
    filters: [],
    items: [],
    shops: [],
    appSettings: {},
  })),
}));

describe('NewGlobalHeader', () => {
  it('does not show Private quick filter button in filter panel', () => {
    render(<NewGlobalHeader onFilter={vi.fn()} type="task" />);

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(screen.queryByRole('button', { name: /^private$/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
  });
});
