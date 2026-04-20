import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, CheckCircle, ShoppingCart, AlertTriangle, Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';

export const Dashboard = () => {
  const { tasks, items, users, sprints, currentSprint } = useApp();

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const openTasks = tasks.filter(t => t.status !== 'done' && !t.archived).length;
  const openItems = items.filter(i => !i.completed).length;
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'done').length;
  const completedThisWeek = tasks.filter(t => t.completedAt && t.completedAt > weekAgo).length;

  // Completions per user this week
  const completionsPerUser = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.completedAt && t.completedAt > weekAgo && t.assignedTo) {
        map[t.assignedTo] = (map[t.assignedTo] || 0) + 1;
      }
    });
    return users.map(u => ({
      name: u.name || u.email,
      completed: map[u.id] || 0,
    }));
  }, [tasks, users]);

  // Simple burndown: days in current sprint with remaining tasks
  const burndownData = useMemo(() => {
    if (!currentSprint) return [];
    const sprintTasks = tasks.filter(t => t.sprintId === currentSprint.id);
    const total = sprintTasks.length;
    const days: { day: string; remaining: number }[] = [];
    const start = currentSprint.startDate;
    const end = Math.min(currentSprint.endDate, now);
    for (let d = start; d <= end; d += 86400000) {
      const done = sprintTasks.filter(t => t.completedAt && t.completedAt <= d).length;
      days.push({
        day: new Date(d).toLocaleDateString('en', { weekday: 'short' }),
        remaining: total - done,
      });
    }
    return days;
  }, [tasks, currentSprint]);

  // Upcoming due dates
  const upcoming = tasks
    .filter(t => t.dueDate && t.dueDate > now && t.status !== 'done')
    .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4">
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" />
          Dashboard
        </h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Open Tasks', value: openTasks, icon: <CheckCircle className="w-5 h-5 text-blue-500" /> },
          { label: 'Grocery Items', value: openItems, icon: <ShoppingCart className="w-5 h-5 text-green-500" /> },
          { label: 'Overdue', value: overdue, icon: <AlertTriangle className="w-5 h-5 text-red-500" /> },
          { label: 'Done This Week', value: completedThisWeek, icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-1">{stat.icon}<span className="text-xs text-neutral-500">{stat.label}</span></div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sprint Burndown */}
      {burndownData.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
          <h2 className="font-semibold mb-3">Sprint Burndown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="remaining" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Completions per user */}
      {completionsPerUser.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Tasks Completed This Week
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={completionsPerUser}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Upcoming Due Dates */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6">
        <h2 className="font-semibold mb-3">Upcoming Due Dates</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-neutral-400">No upcoming deadlines</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map(t => (
              <div key={t.id} className="flex justify-between items-center text-sm">
                <span>{t.title}</span>
                <span className="text-neutral-500">{new Date(t.dueDate!).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
