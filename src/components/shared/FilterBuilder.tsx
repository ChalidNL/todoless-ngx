import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LabelBadge } from './LabelBadge';
import { Priority, Horizon, TaskStatus } from '../../types';
import { Save, Eye } from 'lucide-react';

interface FilterBuilderProps {
  type: 'task' | 'item' | 'note';
  onSave: () => void;
}

export const FilterBuilder = ({ type, onSave }: FilterBuilderProps) => {
  const { labels, users, items, tasks, notes, addFilter } = useApp();
  const [filterName, setFilterName] = useState('');
  
  // Common filters
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isPrivate, setIsPrivate] = useState<boolean | undefined>(undefined);
  
  // Task specific
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<Priority[]>([]);
  const [selectedHorizon, setSelectedHorizon] = useState<Horizon[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [hasSprintId, setHasSprintId] = useState<boolean | undefined>(undefined);
  const [blocked, setBlocked] = useState<boolean | undefined>(undefined);
  
  // Item specific
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [belowMinimumStock, setBelowMinimumStock] = useState<boolean | undefined>(undefined);
  
  // Note specific
  const [selectedLinkedTypes, setSelectedLinkedTypes] = useState<('task' | 'item')[]>([]);

  // Live preview of filtered results
  const filteredResults = useMemo(() => {
    let results: any[] = [];
    
    if (type === 'task') {
      results = tasks.filter(task => {
        if (!showCompleted && task.status === 'done') return false;
        if (selectedLabels.length > 0 && !selectedLabels.some(id => task.labels?.includes(id))) return false;
        if (isPrivate !== undefined && task.isPrivate !== isPrivate) return false;
        if (selectedStatus.length > 0 && !selectedStatus.includes(task.status || 'todo')) return false;
        if (selectedPriority.length > 0 && !selectedPriority.includes(task.priority || 'normal')) return false;
        if (selectedHorizon.length > 0 && !selectedHorizon.includes(task.horizon || 'week')) return false;
        if (selectedAssignees.length > 0 && !selectedAssignees.includes(task.assignedTo || '')) return false;
        if (hasSprintId !== undefined && (task.sprintId ? true : false) !== hasSprintId) return false;
        if (blocked !== undefined && task.blocked !== blocked) return false;
        return true;
      });
    } else if (type === 'item') {
      results = items.filter(item => {
        if (!showCompleted && item.completed) return false;
        if (selectedLabels.length > 0 && !selectedLabels.some(id => item.labels.includes(id))) return false;
        if (isPrivate !== undefined && item.isPrivate !== isPrivate) return false;
        if (selectedCategories.length > 0 && !selectedCategories.includes(item.category || '')) return false;
        if (selectedLocations.length > 0 && !selectedLocations.includes(item.location || '')) return false;
        if (belowMinimumStock !== undefined) {
          const isBelowMin = item.minimumStock && item.quantity && item.quantity < item.minimumStock;
          if (isBelowMin !== belowMinimumStock) return false;
        }
        return true;
      });
    } else if (type === 'note') {
      results = notes.filter(note => {
        if (selectedLabels.length > 0 && !selectedLabels.some(id => note.labels.includes(id))) return false;
        if (isPrivate !== undefined && note.isPrivate !== isPrivate) return false;
        if (selectedLinkedTypes.length > 0 && !selectedLinkedTypes.includes(note.linkedTo?.type as any)) return false;
        return true;
      });
    }
    
    return results;
  }, [type, tasks, items, notes, showCompleted, selectedLabels, isPrivate, selectedStatus, selectedPriority, selectedHorizon, selectedAssignees, hasSprintId, blocked, selectedCategories, selectedLocations, belowMinimumStock, selectedLinkedTypes]);

  const toggleArrayValue = <T,>(arr: T[], value: T, setter: (arr: T[]) => void) => {
    if (arr.includes(value)) {
      setter(arr.filter(v => v !== value));
    } else {
      setter([...arr, value]);
    }
  };

  const getUniqueCategories = () => {
    const categories = items.map(i => i.category).filter(Boolean) as string[];
    return [...new Set(categories)];
  };

  const getUniqueLocations = () => {
    const locations = items.map(i => i.location).filter(Boolean) as string[];
    return [...new Set(locations)];
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;

    const filter: any = {
      name: filterName,
      type,
      showCompleted,
    };

    // Add common fields
    if (selectedLabels.length > 0) filter.labelIds = selectedLabels;
    if (isPrivate !== undefined) filter.isPrivate = isPrivate;

    // Add type-specific fields
    if (type === 'task') {
      if (selectedStatus.length > 0) filter.status = selectedStatus;
      if (selectedPriority.length > 0) filter.priority = selectedPriority;
      if (selectedHorizon.length > 0) filter.horizon = selectedHorizon;
      if (selectedAssignees.length > 0) filter.assignedTo = selectedAssignees;
      if (hasSprintId !== undefined) filter.hasSprintId = hasSprintId;
      if (blocked !== undefined) filter.blocked = blocked;
    } else if (type === 'item') {
      if (selectedCategories.length > 0) filter.category = selectedCategories;
      if (selectedLocations.length > 0) filter.location = selectedLocations;
      if (belowMinimumStock !== undefined) filter.belowMinimumStock = belowMinimumStock;
    } else if (type === 'note') {
      if (selectedLinkedTypes.length > 0) filter.linkedType = selectedLinkedTypes;
    }

    addFilter(filter);
    onSave();
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Filter Name</label>
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="e.g. Boodschappen, Urgent Tasks, etc."
          className="w-full px-3 py-2 border border-neutral-200 rounded text-sm"
        />
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-2">Labels</label>
          <div className="flex flex-wrap gap-2">
            {labels.map(label => (
              <button
                key={label.id}
                onClick={() => toggleArrayValue(selectedLabels, label.id, setSelectedLabels)}
                className={`transition-opacity ${
                  selectedLabels.includes(label.id) ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <LabelBadge label={label} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task Specific Filters */}
      {type === 'task' && (
        <>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {(['backlog', 'todo', 'done'] as TaskStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => toggleArrayValue(selectedStatus, status, setSelectedStatus)}
                  className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                    selectedStatus.includes(status)
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-2">Priority</label>
            <div className="flex flex-wrap gap-2">
              {(['urgent', 'normal', 'low'] as Priority[]).map(priority => (
                <button
                  key={priority}
                  onClick={() => toggleArrayValue(selectedPriority, priority, setSelectedPriority)}
                  className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                    selectedPriority.includes(priority)
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-2">Horizon</label>
            <div className="flex flex-wrap gap-2">
              {(['week', 'month', '3months', '6months', 'year'] as Horizon[]).map(horizon => (
                <button
                  key={horizon}
                  onClick={() => toggleArrayValue(selectedHorizon, horizon, setSelectedHorizon)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    selectedHorizon.includes(horizon)
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {horizon}
                </button>
              ))}
            </div>
          </div>

          {users.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">Assigned To</label>
              <div className="flex flex-wrap gap-2">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => toggleArrayValue(selectedAssignees, user.id, setSelectedAssignees)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      selectedAssignees.includes(user.id)
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {user.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs text-neutral-700">
              <input
                type="checkbox"
                checked={hasSprintId === true}
                onChange={(e) => setHasSprintId(e.target.checked ? true : undefined)}
                className="rounded"
              />
              In Sprint
            </label>
            <label className="flex items-center gap-2 text-xs text-neutral-700">
              <input
                type="checkbox"
                checked={blocked === true}
                onChange={(e) => setBlocked(e.target.checked ? true : undefined)}
                className="rounded"
              />
              Blocked
            </label>
          </div>
        </>
      )}

      {/* Item Specific Filters */}
      {type === 'item' && (
        <>
          {getUniqueCategories().length > 0 && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {getUniqueCategories().map(category => (
                  <button
                    key={category}
                    onClick={() => toggleArrayValue(selectedCategories, category, setSelectedCategories)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {getUniqueLocations().length > 0 && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-2">Location</label>
              <div className="flex flex-wrap gap-2">
                {getUniqueLocations().map(location => (
                  <button
                    key={location}
                    onClick={() => toggleArrayValue(selectedLocations, location, setSelectedLocations)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      selectedLocations.includes(location)
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs text-neutral-700">
            <input
              type="checkbox"
              checked={belowMinimumStock === true}
              onChange={(e) => setBelowMinimumStock(e.target.checked ? true : undefined)}
              className="rounded"
            />
            Below Minimum Stock
          </label>
        </>
      )}

      {/* Note Specific Filters */}
      {type === 'note' && (
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-2">Linked To</label>
          <div className="flex flex-wrap gap-2">
            {(['task', 'item'] as ('task' | 'item')[]).map(linkType => (
              <button
                key={linkType}
                onClick={() => toggleArrayValue(selectedLinkedTypes, linkType, setSelectedLinkedTypes)}
                className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                  selectedLinkedTypes.includes(linkType)
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {linkType}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Common Filters */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs text-neutral-700">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded"
          />
          Show Completed
        </label>
        <label className="flex items-center gap-2 text-xs text-neutral-700">
          <input
            type="checkbox"
            checked={isPrivate === true}
            onChange={(e) => setIsPrivate(e.target.checked ? true : undefined)}
            className="rounded"
          />
          Private Only
        </label>
      </div>

      {/* Live Preview */}
      <div className="border-t border-neutral-200 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-neutral-600" />
          <label className="text-xs font-medium text-neutral-700">
            Live Preview ({filteredResults.length} {type}s)
          </label>
        </div>
        <div className="max-h-40 overflow-y-auto space-y-2 bg-neutral-50 rounded p-3">
          {filteredResults.length === 0 ? (
            <p className="text-xs text-neutral-400 italic text-center py-4">
              No {type}s match these filters
            </p>
          ) : (
            filteredResults.slice(0, 10).map((result) => (
              <div key={result.id} className="text-xs p-2 bg-white rounded border border-neutral-200">
                {type === 'task' && result.title}
                {type === 'item' && result.title}
                {type === 'note' && result.content.substring(0, 50)}
                {result.completed && <span className="ml-2 text-neutral-400">(completed)</span>}
              </div>
            ))
          )}
          {filteredResults.length > 10 && (
            <p className="text-xs text-neutral-400 italic text-center py-2">
              + {filteredResults.length - 10} more...
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleSaveFilter}
        disabled={!filterName.trim()}
        className="w-full px-4 py-2 bg-neutral-900 text-white rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        Save Filter
      </button>
    </div>
  );
};