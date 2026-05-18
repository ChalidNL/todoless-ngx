/**
 * Entity colors — deterministic color palette keyed by entity ID.
 * Same entity always gets the same color. Used for user avatars,
 * assignee chips, and any entity badge across the app.
 *
 * Usage:
 *   <span style={{ backgroundColor: entityBg(user.id), color: entityColor(user.id) }}>
 *     <span style={{ backgroundColor: entityColor(user.id) }} className="...">
 *       {entityInitials(user.name)}
 *     </span>
 *     {user.name}
 *   </span>
 */

const PALETTE = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7', // violet
  '#f43f5e', // rose
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Return the full-opacity entity color hex (e.g. '#3b82f6').
 */
export function entityColor(id: string): string {
  return PALETTE[hashString(id) % PALETTE.length];
}

/**
 * Return a light background tint of the entity color.
 * Uses CSS 8-digit hex alpha notation (supported in Chrome 62+, Firefox 49+, Safari 10+).
 */
export function entityBg(id: string): string {
  return entityColor(id) + '15';
}

/**
 * Return a medium border tint of the entity color (~25% opacity).
 */
export function entityBorder(id: string): string {
  return entityColor(id) + '40';
}

/**
 * Extract initials from a name (1–2 chars).
 * - "John Doe" → "JD"
 * - "Alice" → "AL"
 * - "Jean-Claude Van Damme" → "JV"
 */
export function entityInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
