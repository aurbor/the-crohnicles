import type { ActivityType } from "@/lib/activity/estimate";
import type { Mood } from "@/components/quick-add/mood-picker";

/**
 * Shapes and pure helpers for a calendar day. Deliberately free of any database
 * import so client components can use them without pulling better-sqlite3 into
 * the browser bundle — the queries live in ./month-data.
 */

export interface DiaryLine {
  id: number;
  itemName: string;
  itemType: "drink" | "food";
  quantity: number;
  calories: number;
  protein: number;
  sugar: number;
  mood: Mood | null;
  notes: string | null;
  time: string;
}

export interface MedLine {
  id: number;
  name: string;
  quantity: number;
  strength: string;
  form: string;
  notes: string | null;
  time: string;
}

export interface SymptomLine {
  id: number;
  bristolScale: number | null;
  severity: number | null;
  notes: string | null;
  time: string;
}

export interface ActivityLine {
  id: number;
  type: ActivityType;
  distanceMiles: number;
  caloriesBurned: number;
  notes: string | null;
  time: string;
}

export interface DaySummary {
  date: string;
  diary: DiaryLine[];
  medications: MedLine[];
  symptoms: SymptomLine[];
  activities: ActivityLine[];
  journalNotes: string | null;
  /** Legacy free-text activity from before activity logging got its own entries. */
  legacyActivity: string | null;
  weightKg: number | null;
  totals: { calories: number; protein: number; sugar: number };
  caloriesBurned: number;
  moods: Mood[];
}

export function emptyDay(date: string): DaySummary {
  return {
    date,
    diary: [],
    medications: [],
    symptoms: [],
    activities: [],
    journalNotes: null,
    legacyActivity: null,
    weightKg: null,
    totals: { calories: 0, protein: 0, sugar: 0 },
    caloriesBurned: 0,
    moods: [],
  };
}

export function isActiveDay(day: DaySummary): boolean {
  return day.activities.length > 0 || !!day.legacyActivity?.trim();
}
