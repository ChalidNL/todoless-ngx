import React from 'react';
import { Target, Edit, Trash2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface GoalProps {
  goal: {
    id: string;
    title: string;
    description?: string;
    pointsRequired: number;
    pointsCurrent: number;
    completed: boolean;
  };
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const GoalTracker = ({ goal, isAdmin, onEdit, onDelete }: GoalProps) => {
  const progress = Math.min(100, Math.round((goal.pointsCurrent / goal.pointsRequired) * 100));

  return (
    <div className={`bg-white rounded-lg border p-4 ${goal.completed ? 'border-green-300 bg-green-50' : 'border-neutral-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className={`w-4 h-4 ${goal.completed ? 'text-green-500' : 'text-blue-500'}`} />
          <h3 className="font-medium text-sm">{goal.title}</h3>
        </div>
        {isAdmin && (
          <div className="flex gap-1">
            <button onClick={() => onEdit?.(goal.id)} className="p-1 hover:bg-neutral-100 rounded">
              <Edit className="w-3.5 h-3.5 text-neutral-400" />
            </button>
            <button onClick={() => onDelete?.(goal.id)} className="p-1 hover:bg-red-50 rounded">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        )}
      </div>
      {goal.description && (
        <p className="text-xs text-neutral-500 mb-2">{goal.description}</p>
      )}
      <Progress value={progress} className="h-2 mb-1" />
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{goal.pointsCurrent} / {goal.pointsRequired} pts</span>
        <span>{progress}%</span>
      </div>
      {goal.completed && (
        <div className="mt-2 text-center">
          <span className="text-green-600 font-medium text-sm animate-pulse">🎉 Goal Complete!</span>
        </div>
      )}
    </div>
  );
};
