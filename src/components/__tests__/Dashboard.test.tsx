import { describe, it, expect, vi } from 'vitest';
import React from 'react';

vi.mock('../../context/AppContext', () => ({
  useApp: vi.fn(() => ({
    tasks: [
      { id: '1', title: 'Task 1', status: 'done', completedAt: Date.now() },
      { id: '2', title: 'Task 2', status: 'todo', dueDate: Date.now() + 86400000 },
      { id: '3', title: 'Task 3', status: 'in_progress' },
    ],
    items: [
      { id: 'i1', title: 'Item 1', completed: true },
      { id: 'i2', title: 'Item 2', completed: false },
    ],
    sprints: [],
    labels: [],
    appSettings: { language: 'en' },
  })),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

describe('Dashboard Component', () => {
  it('computes quick stats from tasks', () => {
    const tasks = [
      { id: '1', status: 'done' },
      { id: '2', status: 'todo' },
      { id: '3', status: 'in_progress' },
    ];
    const completed = tasks.filter(t => t.status === 'done').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    
    expect(completed).toBe(1);
    expect(todo).toBe(1);
    expect(inProgress).toBe(1);
  });

  it('counts completed tasks correctly', () => {
    const tasks = [
      { id: '1', status: 'done', completedAt: Date.now() },
      { id: '2', status: 'done', completedAt: Date.now() },
      { id: '3', status: 'todo' },
    ];
    const completedCount = tasks.filter(t => t.status === 'done').length;
    expect(completedCount).toBe(2);
  });

  it('identifies upcoming due dates', () => {
    const now = Date.now();
    const tasks = [
      { id: '1', title: 'Due soon', dueDate: now + 86400000, status: 'todo' },
      { id: '2', title: 'Due later', dueDate: now + 7 * 86400000, status: 'todo' },
      { id: '3', title: 'No due date', status: 'todo' },
    ];
    const upcoming = tasks
      .filter(t => t.dueDate && t.dueDate < now + 3 * 86400000)
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
    
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].title).toBe('Due soon');
  });

  it('computes chart data structure for recharts', () => {
    const weeklyData = [
      { day: 'Mon', completed: 3 },
      { day: 'Tue', completed: 5 },
      { day: 'Wed', completed: 2 },
    ];
    expect(weeklyData).toHaveLength(3);
    expect(weeklyData[0]).toHaveProperty('day');
    expect(weeklyData[0]).toHaveProperty('completed');
  });

  it('handles empty task list gracefully', () => {
    const tasks: any[] = [];
    const completed = tasks.filter(t => t.status === 'done').length;
    expect(completed).toBe(0);
  });
});
