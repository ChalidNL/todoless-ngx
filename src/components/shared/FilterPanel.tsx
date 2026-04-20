import React from 'react';
import { Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LabelBadge } from './LabelBadge';

interface FilterPanelProps {
  type: 'task' | 'item';
  selectedFilterId: string | null;
  setSelectedFilterId: (id: string | null) => void;
  newFilterName: string;
  setNewFilterName: (name: string) => void;
  onCreateFilter: () => void;
}

export const FilterPanel = ({
  type,
  selectedFilterId,
  setSelectedFilterId,
  newFilterName,
  setNewFilterName,
  onCreateFilter,
}: FilterPanelProps) => {
  const { labels, filters, users, activeLabelFilters, toggleLabelFilter } = useApp();

  const typeFilters = filters.filter(f => f.type === type);

  return (
    <div className="border-b border-neutral-200 bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Saved filters */}
        {typeFilters.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-neutral-500 mb-2">Saved Filters</p>
            <div className="flex flex-wrap gap-2">
              {typeFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setSelectedFilterId(filter.id === selectedFilterId ? null : filter.id);
                  }}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    selectedFilterId === filter.id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Label filters */}
        <div className="mb-3">
          <p className="text-xs text-neutral-500 mb-2">Filter by Label</p>
          <div className="flex flex-wrap gap-2">
            {labels.map(label => (
              <button
                key={label.id}
                onClick={() => toggleLabelFilter(label.id)}
                className={`cursor-pointer ${activeLabelFilters.includes(label.id) ? 'ring-2 ring-neutral-900 rounded-full' : ''}`}
              >
                <LabelBadge label={label} />
              </button>
            ))}
          </div>
        </div>

        {/* Filter by Assignee (only for tasks) */}
        {type === 'task' && (
          <div className="mb-3">
            <p className="text-xs text-neutral-500 mb-2">Filter by Assignee</p>
            <div className="flex flex-wrap gap-2">
              {users.map(user => (
                <button
                  key={user.id}
                  className="px-3 py-1.5 bg-white border border-neutral-200 rounded text-xs hover:border-neutral-300 flex items-center gap-2"
                >
                  <div className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>
                  {user.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create new filter */}
        <div className="border-t border-neutral-200 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              placeholder="New filter name..."
              className="flex-1 px-3 py-1.5 border border-neutral-200 rounded text-sm bg-white"
            />
            <button
              onClick={onCreateFilter}
              disabled={!newFilterName.trim() || activeLabelFilters.length === 0}
              className="px-3 py-1.5 bg-neutral-900 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Save
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Select labels above, then save as filter</p>
        </div>
      </div>
    </div>
  );
};
