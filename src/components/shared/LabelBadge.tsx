import React from 'react';
import { Label } from '../../types';

interface LabelBadgeProps {
  label: Label;
  onRemove?: (e?: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

export const LabelBadge = ({ label, onRemove, size = 'md' }: LabelBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'
      }`}
      style={{
        backgroundColor: `${label.color}15`,
        color: label.color,
      }}
    >
      {label.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className="hover:opacity-70"
        >
          ×
        </button>
      )}
    </span>
  );
};