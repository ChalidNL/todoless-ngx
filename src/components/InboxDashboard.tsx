import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, CheckCircle2, Clock, Trophy, Target, TrendingUp, RotateCcw } from 'lucide-react';

export const InboxDashboard = () => {
  const { tasks, users, appSettings, currentSprint, uncheckAllDoneTasks, showCompletionMessage } = useApp();

  const currentUser = users.find(u => u.id === appSettings.currentUserId);
  const isChild = currentUser?.role === 'child';

  // Calculate metrics
  const openTasks = tasks.filter(t => t.status !== 'done' && !t.archived).length;
  const doneTasks = tasks.filter(t => t.status === 'done' && !t.archived).length;
  const blockedTasks = tasks.filter(t => t.blocked && !t.archived).length;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done' && !t.archived).length;
  
  // Sprint metrics
  const sprintTasks = currentSprint ? tasks.filter(t => t.sprintId === currentSprint.id) : [];
  const sprintTotal = sprintTasks.length;
  const sprintCompleted = sprintTasks.filter(t => t.status === 'done').length;
  const sprintProgress = sprintTotal > 0 ? Math.round((sprintCompleted / sprintTotal) * 100) : 0;

  // Child metrics (for when you're assigned tasks by others)
  const childTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const childPoints = childTasks.filter(t => t.status === 'done').length * 10;
  const weekPoints = childTasks.filter(t => {
    if (!t.completedAt) return false;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return t.completedAt > weekAgo && t.status === 'done';
  }).length * 10;

  if (isChild) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 mb-6 border border-purple-200">
        <h2 className="text-2xl font-bold mb-6 text-purple-900">🎮 Mijn Score</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Total Points */}
          <div className="bg-white rounded-xl p-6 text-center border-2 border-yellow-300 shadow-sm">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-3xl font-bold text-yellow-600">{childPoints}</div>
            <div className="text-sm text-neutral-600 mt-1">Totaal Punten</div>
          </div>

          {/* Week Points */}
          <div className="bg-white rounded-xl p-6 text-center border-2 border-green-300 shadow-sm">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-3xl font-bold text-green-600">{weekPoints}</div>
            <div className="text-sm text-neutral-600 mt-1">Deze Week</div>
          </div>

          {/* Open Tasks */}
          <div className="bg-white rounded-xl p-6 text-center border-2 border-blue-300 shadow-sm">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-3xl font-bold text-blue-600">{childTasks.filter(t => t.status !== 'done').length}</div>
            <div className="text-sm text-neutral-600 mt-1">Te Doen</div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl p-6 text-center border-2 border-purple-300 shadow-sm">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-3xl font-bold text-purple-600">{childTasks.filter(t => t.status === 'done').length}</div>
            <div className="text-sm text-neutral-600 mt-1">Klaar!</div>
          </div>
        </div>

        {/* Motivational message */}
        <div className="mt-4 bg-white rounded-xl p-4 text-center border-2 border-pink-200">
          <p className="text-sm text-neutral-700">
            {childPoints === 0 && "Start met taken maken om punten te verdienen! 🚀"}
            {childPoints > 0 && childPoints < 50 && "Super bezig! Ga zo door! 💪"}
            {childPoints >= 50 && childPoints < 100 && "Wauw! Je bent een ster! ⭐"}
            {childPoints >= 100 && "Ongelofelijk! Je bent een kampioen! 🏆"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border border-neutral-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-neutral-900">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Open Tasks */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Open</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{openTasks}</div>
        </div>

        {/* Done Tasks */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Klaar</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{doneTasks}</div>
        </div>

        {/* Urgent */}
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Urgent</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{urgentTasks}</div>
        </div>

        {/* Blocked */}
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Blocked</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{blockedTasks}</div>
        </div>

        {/* Sprint Progress */}
        {currentSprint && (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Sprint</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-purple-600">{sprintProgress}%</div>
              <div className="flex-1">
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${sprintProgress}%` }}
                  />
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  {sprintCompleted} / {sprintTotal} taken
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Uncheck All Button */}
      {doneTasks > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <button
            onClick={() => {
              uncheckAllDoneTasks();
              showCompletionMessage('Alle done taken teruggezet naar todo');
            }}
            className="w-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg flex items-center justify-center gap-2 text-sm text-neutral-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Uncheck All ({doneTasks})
          </button>
        </div>
      )}
    </div>
  );
};