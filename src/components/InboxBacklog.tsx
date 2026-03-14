import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CompactTaskCard } from './shared/CompactTaskCard';
import { NewGlobalHeader } from './shared/NewGlobalHeader';
import { TopBar } from './shared/TopBar';
import { DueDateNotifications } from './shared/DueDateNotifications';
import { CheckSquare, Zap, Compass, Flag, X } from 'lucide-react';
import { Priority, Horizon } from '../types';

export const InboxBacklog = () => {
  const { tasks, addTask, updateTask, sprints, currentSprint, createNewSprint } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const backlogTasks = tasks
    .filter(t => t.status === 'backlog')
    .filter(t => searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddTaskWithValue = (value: string, metadata?: { assignee?: string; labels?: string[]; dueDate?: number }) => {
    if (!value.trim()) return;
    addTask({
      title: value.trim(),
      status: 'backlog',
      priority: 'normal',
      labels: metadata?.labels || [],
      assignedTo: metadata?.assignee,
      dueDate: metadata?.dueDate,
      horizon: null,
      sprint: null
    });
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleBulkAssignToSprint = () => {
    if (!currentSprint) {
      createNewSprint();
    }
    
    selectedTasks.forEach(taskId => {
      updateTask(taskId, { 
        status: 'todo',
        sprintId: currentSprint?.id 
      });
    });
    
    setSelectedTasks([]);
    setShowBulkMenu(false);
  };

  const handleBulkSetPriority = (priority: Priority) => {
    selectedTasks.forEach(taskId => {
      updateTask(taskId, { priority });
    });
    setSelectedTasks([]);
    setShowBulkMenu(false);
  };

  const handleBulkSetHorizon = (horizon: Horizon) => {
    selectedTasks.forEach(taskId => {
      updateTask(taskId, { horizon });
    });
    setSelectedTasks([]);
    setShowBulkMenu(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <TopBar />
      {/* Header */}
      <NewGlobalHeader
        onAdd={handleAddTaskWithValue}
        onSearch={setSearchQuery}
        searchPlaceholder="Search or brain dump..."
      />

      {/* Backlog list */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {backlogTasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-sm">Inbox is empty</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backlogTasks.map((task) => (
              <div 
                key={task.id} 
                className="relative"
                onClick={(e) => {
                  // Only select on card click, not on interactive elements
                  if ((e.target as HTMLElement).closest('input, button, textarea')) return;
                  handleTaskSelect(task.id);
                }}
              >
                {/* Selection indicator - blue circle top right (click to deselect) */}
                {selectedTasks.includes(task.id) && (
                  <div 
                    className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskSelect(task.id);
                    }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                <div className={`${selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
                  <CompactTaskCard task={task} showCheckbox={true} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      {selectedTasks.length > 0 && (
        <div className="fixed bottom-20 right-4 z-50">
          {/* Bulk Menu */}
          {showBulkMenu && (
            <div className="mb-4 bg-white rounded-lg shadow-xl border border-neutral-200 p-4 w-64">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Bulk Actions</h3>
                <button 
                  onClick={() => setShowBulkMenu(false)}
                  className="p-1 hover:bg-neutral-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sprint */}
              <div className="mb-4">
                <p className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Assign to Sprint
                </p>
                <button
                  onClick={handleBulkAssignToSprint}
                  className="w-full px-3 py-2 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100 border border-green-200"
                >
                  {currentSprint ? currentSprint.name : 'Create & Assign Sprint'}
                </button>
              </div>

              {/* Horizon */}
              <div className="mb-4">
                <p className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
                  <Compass className="w-3 h-3" />
                  Set Horizon
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleBulkSetHorizon('today')}
                    className="flex-1 px-2 py-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleBulkSetHorizon('week')}
                    className="flex-1 px-2 py-1.5 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                  >
                    Week
                  </button>
                  <button
                    onClick={() => handleBulkSetHorizon('month')}
                    className="flex-1 px-2 py-1.5 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
                  >
                    Month
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  Set Priority
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleBulkSetPriority('urgent')}
                    className="flex-1 px-2 py-1.5 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
                  >
                    High
                  </button>
                  <button
                    onClick={() => handleBulkSetPriority('normal')}
                    className="flex-1 px-2 py-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    Med
                  </button>
                  <button
                    onClick={() => handleBulkSetPriority('low')}
                    className="flex-1 px-2 py-1.5 text-xs bg-neutral-50 text-neutral-700 rounded hover:bg-neutral-100"
                  >
                    Low
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAB Button */}
          <button
            onClick={() => setShowBulkMenu(!showBulkMenu)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all relative"
          >
            {showBulkMenu ? (
              <X className="w-6 h-6" />
            ) : (
              <>
                <CheckSquare className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                  {selectedTasks.length}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      <DueDateNotifications />
    </div>
  );
};