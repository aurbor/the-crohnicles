import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  diaryEntries,
  items,
  medicationEntries,
  medications,
  symptomEntries,
  journalEntries,
  weightEntries,
} from "@/lib/db/schema";
import { totalNutrition } from "@/lib/nutrition";
import type { Mood } from "@/components/quick-add/mood-picker";

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

export interface DaySummary {
  date: string;
  diary: DiaryLine[];
  medications: MedLine[];
  symptoms: SymptomLine[];
  journalNotes: string | null;
  activity: string | null;
  weightKg: number | null;
  totals: { calories: number; protein: number; sugar: number };
  moods: Mood[];
}

function emptyDay(date: string): DaySummary {
  return {
    date,
    diary: [],
    medications: [],
    symptoms: [],
    journalNotes: null,
    activity: null,
    weightKg: null,
    totals: { calories: 0, protein: 0, sugar: 0 },
    moods: [],
  };
}

function dateKey(occurredAt: string): string {
  return occurredAt.slice(0, 10);
}

function timeKey(occurredAt: string): string {
  return occurredAt.slice(11, 16);
}

/** gridStart/gridEnd are "YYYY-MM-DD" bounds (inclusive start, exclusive end). */
export async function getMonthData(
  gridStart: string,
  gridEnd: string
): Promise<Map<string, DaySummary>> {
  const startBound = `${gridStart}T00:00:00`;
  const endBound = `${gridEnd}T00:00:00`;

  const [diaryRows, medRows, symptomRows, journalRows, weightRows] = await Promise.all([
    db
      .select({
        id: diaryEntries.id,
        occurredAt: diaryEntries.occurredAt,
        quantity: diaryEntries.quantity,
        mood: diaryEntries.mood,
        notes: diaryEntries.notes,
        itemName: items.name,
        itemType: items.type,
        basis: items.basis,
        calories: items.calories,
        protein: items.protein,
        sugar: items.sugar,
        unitWeightG: items.unitWeightG,
      })
      .from(diaryEntries)
      .innerJoin(items, eq(diaryEntries.itemId, items.id))
      .where(and(gte(diaryEntries.occurredAt, startBound), lt(diaryEntries.occurredAt, endBound))),
    db
      .select({
        id: medicationEntries.id,
        occurredAt: medicationEntries.occurredAt,
        quantity: medicationEntries.quantity,
        notes: medicationEntries.notes,
        name: medications.name,
        strength: medications.strength,
        form: medications.form,
      })
      .from(medicationEntries)
      .innerJoin(medications, eq(medicationEntries.medicationId, medications.id))
      .where(
        and(gte(medicationEntries.occurredAt, startBound), lt(medicationEntries.occurredAt, endBound))
      ),
    db
      .select()
      .from(symptomEntries)
      .where(and(gte(symptomEntries.occurredAt, startBound), lt(symptomEntries.occurredAt, endBound))),
    db.select().from(journalEntries).where(and(gte(journalEntries.date, gridStart), lt(journalEntries.date, gridEnd))),
    db.select().from(weightEntries).where(and(gte(weightEntries.date, gridStart), lt(weightEntries.date, gridEnd))),
  ]);

  const days = new Map<string, DaySummary>();
  const get = (date: string) => {
    let d = days.get(date);
    if (!d) {
      d = emptyDay(date);
      days.set(date, d);
    }
    return d;
  };

  for (const row of diaryRows) {
    const date = dateKey(row.occurredAt);
    const day = get(date);
    const nutrition = totalNutrition(row, row.quantity);
    day.diary.push({
      id: row.id,
      itemName: row.itemName,
      itemType: row.itemType,
      quantity: row.quantity,
      calories: nutrition.calories,
      protein: nutrition.protein,
      sugar: nutrition.sugar,
      mood: row.mood,
      notes: row.notes,
      time: timeKey(row.occurredAt),
    });
    day.totals.calories += nutrition.calories;
    day.totals.protein += nutrition.protein;
    day.totals.sugar += nutrition.sugar;
    if (row.mood) day.moods.push(row.mood);
  }

  for (const row of medRows) {
    const day = get(dateKey(row.occurredAt));
    day.medications.push({
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      strength: row.strength,
      form: row.form,
      notes: row.notes,
      time: timeKey(row.occurredAt),
    });
  }

  for (const row of symptomRows) {
    const day = get(dateKey(row.occurredAt));
    day.symptoms.push({
      id: row.id,
      bristolScale: row.bristolScale,
      severity: row.severity,
      notes: row.notes,
      time: timeKey(row.occurredAt),
    });
  }

  for (const row of journalRows) {
    const day = get(row.date);
    day.journalNotes = row.notes || null;
    day.activity = row.activity;
  }

  for (const row of weightRows) {
    const day = get(row.date);
    day.weightKg = row.weightKg;
  }

  return days;
}
