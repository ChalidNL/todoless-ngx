import React, { useEffect, useState } from 'react';
import { Task, RepeatInterval } from '../../types';
import { useApp } from '../../context/AppContext';
import { User, Trash2, Menu, X, CalendarDays, Flag, Tag } from 'lucide-react';
import { LabelBadge } from './LabelBadge';

interface CompactTaskCardProps {
  task: Task;
  showCheckbox?: boolean;
}

type TaskEditor = 'title' | 'labels' | 'assignee' | 'schedule' | null;

export const CompactTaskCard = ({ task, showCheckbox = true }: CompactTaskCardProps) => {
  const { updateTask, deleteTask, labels, users } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [activeEditor, setActiveEditor] = useState<TaskEditor>(null);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [labelInput, setLabelInput] = useState('');

  const handleToggleComplete = () => {
    if (task.status === 'done') {
      updateTask(task.id, { status: 'todo', completedAt: undefined });
    } else {
      updateTask(task.id, { status: 'done', completedAt: Date.now() });
    }
  };

  const dateValue = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '';

  useEffect(() => {
    setTitleDraft(task.title);
  }, [task.title]);

  const visibleLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(labelInput.trim().toLowerCase())
  );
  return (
    <div className={`rounded-lg border transition-colors ${
      task.flag || task.blocked
        ? 'bg-red-50 border-red-200'
        : 'bg-white border-neutral-200'
    } ${task.status === 'done' ? 'opacity-50' : 'hover:border-neutral-300'}`}>
      <div className="flex items-center gap-2 p-2.5">
        {/* Layer 1: checkbox + description + hamburger */}
        {showCheckbox && (
          <input
            type="checkbox"
            checked={task.status === 'done'}
            onChange={handleToggleComplete}
            className="w-[18px] h-[18px] rounded border-neutral-300 text-blue-600 accent-blue-600 flex-shrink-0 cursor-pointer"
          />
        )}

        <div className="flex-1 min-w-0">
          <span className={`text-sm leading-6 ${task.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
            {task.title}
          </span>

          {/* Layer 2 */}
          {showMenu && (
            <div className="mt-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveEditor(activeEditor === 'title' ? null : 'title')}
                  className={`p-2 rounded-md transition-colors min-w-[36px] min-h-[36px] border border-neutral-200 ${activeEditor === 'title' ? 'bg-neutral-900 text-white border-neutral-900' : 'hover:bg-neutral-100 text-neutral-600'}`}
                  title="edit text"
                  aria-label="Edit task text"
                >
                  <span className="text-sm leading-none font-semibold">T</span>
                </button>
                <button
                  onClick={() => setActiveEditor(activeEditor === 'labels' ? null : 'labels')}
                  className={`p-2 rounded-md transition-colors min-w-[36px] min-h-[36px] border border-neutral-200 ${activeEditor === 'labels' ? 'bg-neutral-900 text-white border-neutral-900' : 'hover:bg-neutral-100 text-neutral-600'}`}
                  title="#label"
                  aria-label="Edit labels"
                >
                  <Tag className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => setActiveEditor(activeEditor === 'assignee' ? null : 'assignee')}
                  className={`p-2 rounded-md transition-colors min-w-[36px] min-h-[36px] border border-neutral-200 ${activeEditor === 'assignee' ? 'bg-neutral-900 text-white border-neutral-900' : 'hover:bg-neutral-100 text-neutral-600'}`}
                  title="@assignee"
                  aria-label="Edit assignee"
                >
                  <User className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => setActiveEditor(activeEditor === 'schedule' ? null : 'schedule')}
                  className={`p-2 rounded-md transition-colors min-w-[36px] min-h-[36px] border border-neutral-200 ${activeEditor === 'schedule' ? 'bg-neutral-900 text-white border-neutral-900' : 'hover:bg-neutral-100 text-neutral-600'}`}
                  title="//due date / recurring"
                  aria-label="Edit due date and recurring"
                >
                  <CalendarDays className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => updateTask(task.id, { flag: !task.flag, blocked: !task.flag })}
                  className={`p-2 rounded-md transition-colors min-w-[36px] min-h-[36px] border ${task.flag ? 'bg-red-200 text-red-700 border-red-300' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'}`}
                  title="flag"
                  aria-label="Toggle flag"
                >
                  <Flag className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>

                <button
                  onClick={() => {
                    deleteTask(task.id);
                    setShowMenu(false);
                    setActiveEditor(null);
                  }}
                  className="p-2 rounded-md transition-colors min-w-[36px] min-h-[36px] border border-neutral-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  title="delete"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>
              </div>

              {/* Layer 3 */}
              {activeEditor === 'title' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={() => {
                      const next = titleDraft.trim();
                      if (next && next !== task.title) updateTask(task.id, { title: next });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const next = titleDraft.trim();
                        if (next && next !== task.title) updateTask(task.id, { title: next });
                        (e.currentTarget as HTMLInputElement).blur();
                      }
                    }}
                    className="w-full text-sm leading-6 px-2.5 py-2 border border-neutral-200 rounded-md"
                    aria-label="Task text input"
                  />
                </div>
              )}

              {activeEditor === 'labels' && (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="Type label..."
                    className="w-full text-sm leading-6 px-2.5 py-2 border border-neutral-200 rounded-md"
                    aria-label="Label input"
                  />
                  <div className="flex flex-wrap gap-1">
                    {visibleLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => {
                          const has = task.labels.includes(label.id);
                          updateTask(task.id, {
                            labels: has ? task.labels.filter((id) => id !== label.id) : [...task.labels, label.id],
                          });
                        }}
                        className={task.labels.includes(label.id) ? 'ring-1 ring-neutral-900 rounded' : ''}
                      >
                        <LabelBadge label={label} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeEditor === 'assignee' && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => updateTask(task.id, { assignedTo: task.assignedTo === u.id ? undefined : u.id })}
                      className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${task.assignedTo === u.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              )}

              {activeEditor === 'schedule' && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateValue}
                    onChange={(e) => updateTask(task.id, { dueDate: e.target.value ? new Date(`${e.target.value}T00:00:00`).getTime() : undefined })}
                    className="text-xs px-2 py-1 border border-neutral-200 rounded"
                    aria-label="Due date"
                  />
                  <select
                    value={task.repeatInterval || ''}
                    onChange={(e) => updateTask(task.id, { repeatInterval: (e.target.value || undefined) as RepeatInterval | undefined })}
                    className="text-xs px-2 py-1 border border-neutral-200 rounded"
                    aria-label="Recurring interval"
                  >
                    <option value="">No repeat</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              )}

            </div>
          )}
        </div>

        <button
          onClick={() => {
            const next = !showMenu;
            setShowMenu(next);
            setActiveEditor(next ? activeEditor : null);
          }}
          className="p-2 border border-neutral-200 hover:bg-neutral-100 rounded-md transition-colors flex-shrink-0"
          aria-label="Open task attributes"
        >
          {showMenu ? <X className="w-[18px] h-[18px] text-neutral-600" strokeWidth={1.75} /> : <Menu className="w-[18px] h-[18px] text-neutral-500" strokeWidth={1.75} />}
        </button>
      </div>
    </div>
  );
};
