import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import { NewGlobalHeader } from './shared/NewGlobalHeader';
import { TopBar } from './shared/TopBar';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CompactTaskCard } from './shared/CompactTaskCard';

type CalendarView = 'list' | 'day' | 'week' | 'month' | 'year';

export const Calendar = () => {
  const { tasks, addTask } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [recurringType, setRecurringType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');
  const [searchQuery, setSearchQuery] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = (value: string, metadata?: { assignee?: string; labels?: string[]; dueDate?: number }) => {
    setNewEventTitle(value);
    setShowAddModal(true);
  };

  const handleCreateEvent = () => {
    if (!newEventTitle) return;

    let dueDate: number | undefined;
    if (newEventDate) {
      const date = new Date(newEventDate);
      if (newEventTime) {
        const [hours, minutes] = newEventTime.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
      }
      dueDate = date.getTime();
    }

    const newTask = {
      title: newEventTitle,
      dueDate,
      recurring: recurringType !== 'none' ? recurringType : undefined,
      isEvent: true,
    };

    addTask(newTask);
    setShowAddModal(false);
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventTime('');
    setRecurringType('none');
  };

  const getTasksForDay = (day: number) => {
    const dayDate = new Date(year, month, day);
    const dayStart = new Date(dayDate).setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate).setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate >= dayStart && task.dueDate <= dayEnd;
    });
  };

  const getTodayTasks = () => {
    const today = new Date();
    const dayStart = new Date(today).setHours(0, 0, 0, 0);
    const dayEnd = new Date(today).setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate >= dayStart && task.dueDate <= dayEnd;
    });
  };

  const getWeekDays = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    const dayStart = new Date(date).setHours(0, 0, 0, 0);
    const dayEnd = new Date(date).setHours(23, 59, 59, 999);

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate >= dayStart && task.dueDate <= dayEnd;
    });
  };

  const getAllTasks = () => {
    return tasks
      .filter(task => task.dueDate)
      .filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
  };

  const getTasksForYear = () => {
    const yearStart = new Date(year, 0, 1).getTime();
    const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();
    
    const monthsData = [];
    for (let m = 0; m < 12; m++) {
      const monthTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.getFullYear() === year && taskDate.getMonth() === m;
      });
      monthsData.push({ month: m, tasks: monthTasks });
    }
    
    return monthsData;
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-24 bg-neutral-50 border border-neutral-100"></div>
      );
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const tasksForDay = getTasksForDay(day);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={`min-h-24 border border-neutral-200 p-2 bg-white ${
            isToday ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-500' : 'text-neutral-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {tasksForDay.slice(0, 3).map(task => (
              <div
                key={task.id}
                className={`text-xs px-1.5 py-0.5 rounded truncate ${task.status === 'done' ? 'bg-neutral-100 text-neutral-500 line-through' : 'bg-blue-50 text-blue-700'}`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {tasksForDay.length > 3 && (
              <div className="text-xs text-neutral-400 px-1.5">
                +{tasksForDay.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderListView = () => {
    const allTasks = getAllTasks();
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
        {allTasks.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p>No scheduled tasks found</p>
          </div>
        ) : (
          allTasks.map(task => (
            <CompactTaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    );
  };

  const renderDayView = () => {
    const todayTasks = getTodayTasks();
    const today = new Date();
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h2 className="text-lg font-semibold mb-4">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p>No tasks for today</p>
            </div>
          ) : (
            todayTasks.map(task => (
              <CompactTaskCard key={task.id} task={task} />
            ))
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="max-w-full mx-auto px-4 py-4 overflow-x-auto">
        <div className="min-w-[1200px] space-y-3">
          {/* Header Row */}
          <div className="grid grid-cols-7 gap-2 pb-2 border-b border-neutral-200">
            {weekDays.map((day, idx) => {
              const isToday = new Date().toDateString() === day.toDateString();
              return (
                <div key={idx} className="text-center">
                  <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-neutral-700'}`}>
                    {daysOfWeek[day.getDay()]}
                  </div>
                  <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-neutral-900'}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Tasks Grid with Long Bars */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const dayTasks = getTasksForDate(day);
              const isToday = new Date().toDateString() === day.toDateString();
              
              return (
                <div 
                  key={idx} 
                  className={`border-2 rounded-lg p-2 min-h-[400px] ${
                    isToday ? 'border-blue-300 bg-blue-50' : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        className={`px-3 py-2 rounded-lg text-sm border ${
                          task.status === 'done'
                            ? 'bg-neutral-100 text-neutral-500 line-through border-neutral-200' 
                            : task.priority === 'urgent'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : task.priority === 'low'
                            ? 'bg-neutral-50 text-neutral-600 border-neutral-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                        title={task.title}
                      >
                        <div className="font-medium break-words">
                          {task.title}
                        </div>
                        {task.dueDate && (
                          <div className="text-xs mt-1 opacity-75">
                            {new Date(task.dueDate).toLocaleTimeString('nl-NL', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-neutral-50 border-b border-neutral-200">
            {daysOfWeek.map(day => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-neutral-700"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {renderCalendarDays()}
          </div>
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const monthsData = getTasksForYear();
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-4">
          {monthsData.map(({ month: m, tasks: monthTasks }) => (
            <div key={m} className="border border-neutral-200 rounded-lg p-3 bg-white">
              <h3 className="text-sm font-semibold mb-2">{monthNames[m]}</h3>
              <div className="text-xs text-neutral-600">
                {monthTasks.length} {monthTasks.length === 1 ? 'task' : 'tasks'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <TopBar />
      
      {/* Global Header */}
      <NewGlobalHeader 
        onSearch={setSearchQuery}
        onAdd={handleAddEvent}
        searchPlaceholder="Search events or add with @user #label //date..."
        type="task"
      />

      {/* Month Navigation & View Selector */}
      <div className="bg-white border-b border-neutral-200 sticky top-[105px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Month Navigation - Centered */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-neutral-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium min-w-48 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-neutral-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* View Selector */}
          <div className="flex gap-2 justify-center">
            {(['list', 'day', 'week', 'month', 'year'] as CalendarView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                  view === v
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Content */}
      {view === 'list' && renderListView()}
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
      {view === 'year' && renderYearView()}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Title</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Event title"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">Date</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">Time (optional)</label>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">Recurring</label>
                <select
                  value={recurringType}
                  onChange={(e) => setRecurringType(e.target.value as typeof recurringType)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};