import React, { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SprintCreator = () => {
  const { addSprint, sprints } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [sprintNumber, setSprintNumber] = useState(sprints.length + 1);
  const [periodValue, setPeriodValue] = useState(2);
  const [periodUnit, setPeriodUnit] = useState<'week' | 'day' | 'month'>('week');

  const handleCreate = () => {
    const now = Date.now();
    let durationInDays = periodValue;
    
    if (periodUnit === 'week') {
      durationInDays = periodValue * 7;
    } else if (periodUnit === 'month') {
      durationInDays = periodValue * 30;
    }
    
    // Determine duration type for Sprint interface
    let duration: '1week' | '2weeks' | '3weeks' | '1month' = '2weeks';
    if (periodUnit === 'week' && periodValue === 1) duration = '1week';
    else if (periodUnit === 'week' && periodValue === 2) duration = '2weeks';
    else if (periodUnit === 'week' && periodValue === 3) duration = '3weeks';
    else if (periodUnit === 'month' && periodValue === 1) duration = '1month';

    addSprint({
      name: `Sprint ${sprintNumber}`,
      startDate: now,
      endDate: now + (durationInDays * 24 * 60 * 60 * 1000),
      duration: duration,
    });

    setSprintNumber(prev => prev + 1);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-30"
      >
        <Calendar className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create New Sprint</h3>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-neutral-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Sprint Number */}
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Sprint Number</label>
            <input
              type="number"
              min="1"
              value={sprintNumber}
              onChange={(e) => setSprintNumber(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-neutral-200 rounded"
            />
          </div>

          {/* Period Value */}
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Duration</label>
            <input
              type="number"
              min="1"
              value={periodValue}
              onChange={(e) => setPeriodValue(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-neutral-200 rounded"
            />
          </div>

          {/* Period Unit */}
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Period</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodUnit('day')}
                className={`flex-1 px-3 py-2 rounded border transition-colors ${
                  periodUnit === 'day'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Day{periodValue !== 1 ? 's' : ''}
              </button>
              <button
                onClick={() => setPeriodUnit('week')}
                className={`flex-1 px-3 py-2 rounded border transition-colors ${
                  periodUnit === 'week'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Week{periodValue !== 1 ? 's' : ''}
              </button>
              <button
                onClick={() => setPeriodUnit('month')}
                className={`flex-1 px-3 py-2 rounded border transition-colors ${
                  periodUnit === 'month'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Month{periodValue !== 1 ? 's' : ''}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-neutral-50 p-3 rounded border border-neutral-200">
            <p className="text-sm text-neutral-600">
              Creating: <span className="font-semibold">Sprint {sprintNumber}</span> for{' '}
              <span className="font-semibold">
                {periodValue} {periodUnit}{periodValue !== 1 ? 's' : ''}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-neutral-200 rounded hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Sprint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
