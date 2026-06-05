import { RepeatInterval } from '../types';

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth'] as const;
const ORDINALS_NL = ['eerste', 'tweede', 'derde', 'vierde', 'vijfde'] as const;
const WEEKDAY_INDEX_TO_NAME_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const WEEKDAY_INDEX_TO_NAME_NL = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'] as const;

type SupportedLanguage = 'nl' | 'en';

type MonthlyWeekdayParts = {
  weekdayIndex: number;
  occurrenceIndex: number;
  isLastOccurrence: boolean;
};

function toDate(value: number | string | Date): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

function toCalendarDate(value: number | string | Date): Date {
  if (typeof value === 'string') {
    const utcMidnightMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.000)?Z$/);
    if (utcMidnightMatch) {
      const [, year, month, day] = utcMidnightMatch;
      return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0);
    }
  }

  return toDate(value);
}

function addMonthsPreservingDay(baseDate: Date, monthsToAdd: number): Date {
  const year = baseDate.getFullYear();
  const monthIndex = baseDate.getMonth() + monthsToAdd;
  const targetYear = year + Math.floor(monthIndex / 12);
  const normalizedMonth = ((monthIndex % 12) + 12) % 12;
  const daysInMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const targetDay = Math.min(baseDate.getDate(), daysInMonth);

  return new Date(
    targetYear,
    normalizedMonth,
    targetDay,
    baseDate.getHours(),
    baseDate.getMinutes(),
    baseDate.getSeconds(),
    baseDate.getMilliseconds(),
  );
}

function getMonthlyWeekdayParts(input: number | string | Date): MonthlyWeekdayParts {
  const date = toCalendarDate(input);
  const dayOfMonth = date.getDate();
  const occurrenceIndex = Math.floor((dayOfMonth - 1) / 7);
  const weekdayIndex = date.getDay();
  const nextSameWeekday = new Date(date.getTime());
  nextSameWeekday.setDate(dayOfMonth + 7);

  return {
    weekdayIndex,
    occurrenceIndex,
    isLastOccurrence: nextSameWeekday.getMonth() !== date.getMonth(),
  };
}

function getNthWeekdayInMonth(baseDate: Date, monthsToAdd: number): Date {
  const targetMonthSeed = addMonthsPreservingDay(baseDate, monthsToAdd);
  const targetYear = targetMonthSeed.getFullYear();
  const targetMonth = targetMonthSeed.getMonth();
  const { weekdayIndex, occurrenceIndex, isLastOccurrence } = getMonthlyWeekdayParts(baseDate);

  const firstDayOfMonth = new Date(
    targetYear,
    targetMonth,
    1,
    baseDate.getHours(),
    baseDate.getMinutes(),
    baseDate.getSeconds(),
    baseDate.getMilliseconds(),
  );

  const firstWeekdayOffset = (weekdayIndex - firstDayOfMonth.getDay() + 7) % 7;
  const firstWeekdayDate = 1 + firstWeekdayOffset;
  let targetDay = firstWeekdayDate + (occurrenceIndex * 7);

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  if (isLastOccurrence || targetDay > daysInMonth) {
    const lastDayOfMonth = new Date(
      targetYear,
      targetMonth,
      daysInMonth,
      baseDate.getHours(),
      baseDate.getMinutes(),
      baseDate.getSeconds(),
      baseDate.getMilliseconds(),
    );
    const reverseOffset = (lastDayOfMonth.getDay() - weekdayIndex + 7) % 7;
    targetDay = daysInMonth - reverseOffset;
  }

  return new Date(
    targetYear,
    targetMonth,
    targetDay,
    baseDate.getHours(),
    baseDate.getMinutes(),
    baseDate.getSeconds(),
    baseDate.getMilliseconds(),
  );
}

export function getRepeatDescriptor(
  repeatInterval?: RepeatInterval | null,
  dueDate?: number | string,
  language: SupportedLanguage = 'en'
): string | null {
  if (!repeatInterval) return null;

  const labels = language === 'nl'
    ? {
        day: 'Elke dag',
        week: 'Elke week',
        month: 'Elke maand',
        year: 'Elk jaar',
      }
    : {
        day: 'Every day',
        week: 'Every week',
        month: 'Every month',
        year: 'Every year',
      };

  if (repeatInterval !== 'month_weekday') {
    return labels[repeatInterval];
  }

  if (!dueDate) {
    return language === 'nl' ? 'Elke eerste maandag van de maand' : 'Every first Monday of the month';
  }

  const date = toCalendarDate(dueDate);
  const { weekdayIndex, occurrenceIndex, isLastOccurrence } = getMonthlyWeekdayParts(date);
  const weekday = language === 'nl' ? WEEKDAY_INDEX_TO_NAME_NL[weekdayIndex] : WEEKDAY_INDEX_TO_NAME_EN[weekdayIndex];

  if (isLastOccurrence) {
    return language === 'nl' ? `Elke laatste ${weekday} van de maand` : `Every last ${weekday} of the month`;
  }

  const ordinal = language === 'nl'
    ? ORDINALS_NL[Math.min(occurrenceIndex, ORDINALS_NL.length - 1)]
    : ORDINALS[Math.min(occurrenceIndex, ORDINALS.length - 1)];

  return language === 'nl'
    ? `Elke ${ordinal} ${weekday} van de maand`
    : `Every ${ordinal} ${weekday} of the month`;
}

export function getNextRecurringDueDate(repeatInterval: RepeatInterval, baseDateIso: string): string {
  const baseDate = toCalendarDate(baseDateIso);
  let nextDate: Date;

  switch (repeatInterval) {
    case 'day':
      nextDate = new Date(baseDate.getTime());
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'week':
      nextDate = new Date(baseDate.getTime());
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'month':
      nextDate = addMonthsPreservingDay(baseDate, 1);
      break;
    case 'year':
      nextDate = new Date(baseDate.getTime());
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'month_weekday':
      nextDate = getNthWeekdayInMonth(baseDate, 1);
      break;
    default:
      nextDate = new Date(baseDate.getTime());
      break;
  }

  return nextDate.toISOString();
}
