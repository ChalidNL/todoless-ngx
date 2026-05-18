import React from 'react';

interface AttributeChipProps {
  icon?: React.ReactNode;
  label: string;
  color?: string;
  muted?: boolean;
  onRemove?: (e: React.MouseEvent) => void;
}

/**
 * Single global pill chip for all task/grocery attributes.
 *
 * Compact (h-7), fully rounded, inline-flex.
 * Icon + text only — no avatars, no initials, no heavy styling.
 * Use `color` to tint the chip (label/assignee entity color).
 * Use `muted` for neutral chips (date, repeat, shop).
 */
export const AttributeChip = ({ icon, label, color, muted, onRemove }: AttributeChipProps) => {
  const backgroundColor = color && !muted ? `${color}15` : undefined;
  const textColor = color && !muted ? color : undefined;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs font-normal leading-none"
      style={backgroundColor || textColor ? { backgroundColor, color: textColor } : undefined}
    >
      {icon && <span className="flex-shrink-0 flex items-center">{icon}</span>}
      <span className="truncate max-w-[120px]">{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className="ml-0.5 hover:opacity-70 leading-none text-current"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
};
