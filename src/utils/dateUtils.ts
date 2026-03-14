// Get ISO week number (1-53)
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Get current week in sprint (1-based)
export function getCurrentSprintWeek(sprintStartDate: number): number {
  const start = new Date(sprintStartDate);
  const now = new Date();
  
  const startWeek = getISOWeek(start);
  const currentWeek = getISOWeek(now);
  
  // Handle year boundary
  if (now.getFullYear() > start.getFullYear()) {
    const weeksInStartYear = getISOWeek(new Date(start.getFullYear(), 11, 31));
    return (weeksInStartYear - startWeek) + currentWeek + 1;
  }
  
  return currentWeek - startWeek + 1;
}

// Get total weeks in sprint based on duration
export function getTotalSprintWeeks(startDate: number, endDate: number): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.ceil(diffDays / 7);
}

// Format week display
export function formatSprintWeek(currentWeek: number, totalWeeks: number): string {
  if (currentWeek > totalWeeks) {
    return `Week ${totalWeeks}/${totalWeeks} (Completed)`;
  }
  return `Week ${currentWeek}/${totalWeeks}`;
}
