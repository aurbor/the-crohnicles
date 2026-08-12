import { and, eq, gte, lt } from "drizzle-orm";
import { eachDayOfInterval, format, parseISO } from "date-fns";
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
import { totalNutrition, round1 } from "@/lib/nutrition";
import type { Mood } from "@/components/quick-add/mood-picker";

export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  sugar: number;
}

export interface NameCount {
  name: string;
  count: number;
}

export interface SymptomPoint {
  date: string;
  bristolScale: number | null;
  severity: number | null;
}

export interface ReportsData {
  rangeStart: string;
  rangeEnd: string;
  totalDays: number;
  dailyNutrition: DailyNutrition[];
  drinkFrequency: NameCount[];
  foodFrequency: NameCount[];
  moodCounts: { mood: Mood; count: number }[];
  activeDayCount: number;
  weightSeries: { date: string; weightKg: number }[];
  symptomSeries: SymptomPoint[];
  medicationCounts: NameCount[];
  averages: {
    avgCalories: number;
    avgProtein: number;
    avgSugar: number;
    avgDrinksPerDay: number;
    avgFoodPerDay: number;
  };
}

export async function getReportsData(rangeStart: string, rangeEnd: string): Promise<ReportsData> {
  const rangeEndExclusive = format(new Date(parseISO(rangeEnd).getTime() + 86400000), "yyyy-MM-dd");
  const startBound = `${rangeStart}T00:00:00`;
  const endBoundExclusive = `${rangeEndExclusive}T00:00:00`;

  const [diaryRows, medRows, symptomRows, journalRows, weightRows] = await Promise.all([
    db
      .select({
        occurredAt: diaryEntries.occurredAt,
        quantity: diaryEntries.quantity,
        mood: diaryEntries.mood,
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
      .where(and(gte(diaryEntries.occurredAt, startBound), lt(diaryEntries.occurredAt, endBoundExclusive))),
    db
      .select({ occurredAt: medicationEntries.occurredAt, name: medications.name })
      .from(medicationEntries)
      .innerJoin(medications, eq(medicationEntries.medicationId, medications.id))
      .where(
        and(gte(medicationEntries.occurredAt, startBound), lt(medicationEntries.occurredAt, endBoundExclusive))
      ),
    db
      .select()
      .from(symptomEntries)
      .where(and(gte(symptomEntries.occurredAt, startBound), lt(symptomEntries.occurredAt, endBoundExclusive))),
    db
      .select()
      .from(journalEntries)
      .where(and(gte(journalEntries.date, rangeStart), lt(journalEntries.date, rangeEndExclusive))),
    db
      .select()
      .from(weightEntries)
      .where(and(gte(weightEntries.date, rangeStart), lt(weightEntries.date, rangeEndExclusive))),
  ]);

  const allDates = eachDayOfInterval({ start: parseISO(rangeStart), end: parseISO(rangeEnd) }).map((d) =>
    format(d, "yyyy-MM-dd")
  );

  const nutritionByDay = new Map<string, DailyNutrition>();
  for (const date of allDates) {
    nutritionByDay.set(date, { date, calories: 0, protein: 0, sugar: 0 });
  }

  const drinkCounts = new Map<string, number>();
  const foodCounts = new Map<string, number>();
  const moodTally = new Map<Mood, number>();
  let drinkEntryCount = 0;
  let foodEntryCount = 0;

  for (const row of diaryRows) {
    const date = row.occurredAt.slice(0, 10);
    const nutrition = totalNutrition(row, row.quantity);
    const bucket = nutritionByDay.get(date);
    if (bucket) {
      bucket.calories += nutrition.calories;
      bucket.protein += nutrition.protein;
      bucket.sugar += nutrition.sugar;
    }
    if (row.itemType === "drink") {
      drinkCounts.set(row.itemName, (drinkCounts.get(row.itemName) ?? 0) + row.quantity);
      drinkEntryCount += row.quantity;
    } else {
      foodCounts.set(row.itemName, (foodCounts.get(row.itemName) ?? 0) + row.quantity);
      foodEntryCount += row.quantity;
    }
    if (row.mood) moodTally.set(row.mood, (moodTally.get(row.mood) ?? 0) + 1);
  }

  const medicationCounts = new Map<string, number>();
  for (const row of medRows) {
    medicationCounts.set(row.name, (medicationCounts.get(row.name) ?? 0) + 1);
  }

  const activeDayCount = journalRows.filter((r) => r.activity && r.activity.trim().length > 0).length;

  const totalDays = allDates.length;
  const dailyNutrition = Array.from(nutritionByDay.values());
  const totalCalories = dailyNutrition.reduce((sum, d) => sum + d.calories, 0);
  const totalProtein = dailyNutrition.reduce((sum, d) => sum + d.protein, 0);
  const totalSugar = dailyNutrition.reduce((sum, d) => sum + d.sugar, 0);

  return {
    rangeStart,
    rangeEnd,
    totalDays,
    dailyNutrition,
    drinkFrequency: Array.from(drinkCounts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count
    ),
    foodFrequency: Array.from(foodCounts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count
    ),
    moodCounts: Array.from(moodTally, ([mood, count]) => ({ mood, count })),
    activeDayCount,
    weightSeries: weightRows
      .map((r) => ({ date: r.date, weightKg: r.weightKg }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    symptomSeries: symptomRows
      .map((r) => ({
        date: r.occurredAt.slice(0, 10),
        bristolScale: r.bristolScale,
        severity: r.severity,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    medicationCounts: Array.from(medicationCounts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count
    ),
    averages: {
      avgCalories: round1(totalCalories / totalDays),
      avgProtein: round1(totalProtein / totalDays),
      avgSugar: round1(totalSugar / totalDays),
      avgDrinksPerDay: round1(drinkEntryCount / totalDays),
      avgFoodPerDay: round1(foodEntryCount / totalDays),
    },
  };
}
