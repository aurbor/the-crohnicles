import { differenceInCalendarDays, addDays, parseISO, format } from "date-fns";

export const DIET_LENGTH_DAYS = 56;

export interface DietProgress {
  startDate: string;
  endDate: string;
  dayNumber: number; // 1-indexed, clamped to [1, DIET_LENGTH_DAYS]
  daysElapsed: number; // unclamped, can be negative (before start) or beyond 56
  percentComplete: number; // 0-100, clamped
  isComplete: boolean;
  isBeforeStart: boolean;
}

export function getDietProgress(startDateIso: string, today = new Date()): DietProgress {
  const start = parseISO(startDateIso);
  const end = addDays(start, DIET_LENGTH_DAYS - 1);
  const daysElapsed = differenceInCalendarDays(today, start) + 1;
  const dayNumber = Math.min(Math.max(daysElapsed, 1), DIET_LENGTH_DAYS);
  const percentComplete = Math.min(Math.max((daysElapsed / DIET_LENGTH_DAYS) * 100, 0), 100);

  return {
    startDate: startDateIso,
    endDate: format(end, "yyyy-MM-dd"),
    dayNumber,
    daysElapsed,
    percentComplete,
    isComplete: daysElapsed > DIET_LENGTH_DAYS,
    isBeforeStart: daysElapsed < 1,
  };
}
