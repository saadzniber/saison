/**
 * Human-readable date formatting utilities.
 * Consistent formats across the app.
 */

/** Returns "Today", "Tomorrow", "Yesterday", or "Mon, Mar 4" from a "YYYY-MM-DD" string */
export function readableDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - now.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  return d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Calendar day header: "Mon 4" or "Today" */
export function calendarDayLabel(dateStr: string, isToday: boolean): string {
  if (isToday) return 'Today';
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = d.toLocaleDateString('default', { weekday: 'short' });
  const day = d.getDate();
  return `${weekday} ${day}`;
}

/** Relative time: "Just now", "5m ago", "2h ago", "Yesterday", "3 days ago" */
export function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 2) return 'Yesterday';
  return `${diffDay} days ago`;
}

/** Full readable date for recipe detail: "March 4, 2026" */
export function fullDate(date: Date): string {
  return date.toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' });
}
