import React from 'react';

interface AttributeChipProps {
  icon?: React.ReactNode;
  label: string;
  color?: string;
  muted?: boolean;
  active?: boolean;
  onRemove?: (e: React.MouseEvent) => void;
}

/**
 * Single global pill chip for all task/grocery attributes.
 *
 * Compact (h-7), fully rounded, inline-flex.
 * Icon + text only — no avatars, no initials, no heavy styling.
 * Use `color` to tint the chip (label/assignee entity color).
 * Use `muted` for neutral chips (date, repeat, shop).
 * Use `active` to force full-color rendering.
 */
export const AttributeChip = ({ icon, label, color, muted, active, onRemove }: AttributeChipProps) => {
  const isActive = active ?? (!muted && !!color);
  const backgroundColor = color && isActive ? `${color}20` : undefined;
  const textColor = color && isActive ? color : undefined;
  const borderColor = color && isActive ? `${color}40` : undefined;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-7 rounded-full text-xs font-normal leading-none border"
      style={{
        backgroundColor,
        color: textColor,
        borderColor: borderColor || (isActive ? color : 'transparent'),
      }}
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
