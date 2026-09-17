"use server";

import { z } from "zod";
import { desc, eq, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { activityEntries, weightEntries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { ACTIVITY_TYPES, estimateCaloriesBurned } from "./estimate";

export interface ActivityFormState {
  error?: string;
  success?: boolean;
}

const activitySchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(ACTIVITY_TYPES),
  distanceMiles: z.coerce.number().positive("Distance must be greater than 0"),
});

/**
 * Activity is logged from the journal, which is a whole-day view, so there's no
 * time field to fill in. Use the current time when logging today (the usual
 * case) and midday for a day being filled in after the fact.
 */
function occurredAtForDate(date: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (date !== today) return `${date}T12:00:00`;
  return `${date}T${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
}

/**
 * Bodyweight as of the activity date — the closest weigh-in on or before it,
 * falling back to the earliest recorded weight if the activity predates any.
 */
export async function getBodyWeightForDate(date: string): Promise<number | null> {
  const [onOrBefore] = await db
    .select({ weightKg: weightEntries.weightKg })
    .from(weightEntries)
    .where(lte(weightEntries.date, date))
    .orderBy(desc(weightEntries.date))
    .limit(1);
  if (onOrBefore) return onOrBefore.weightKg;

  const [earliest] = await db
    .select({ weightKg: weightEntries.weightKg })
    .from(weightEntries)
    .orderBy(weightEntries.date)
    .limit(1);
  return earliest?.weightKg ?? null;
}

export async function createActivityEntry(
  _prevState: ActivityFormState,
  formData: FormData
): Promise<ActivityFormState> {
  await requireAdmin();

  const parsed = activitySchema.safeParse({
    date: formData.get("date"),
    type: formData.get("type"),
    distanceMiles: formData.get("distanceMiles"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const occurredAt = occurredAtForDate(parsed.data.date);
  const bodyWeightKg = await getBodyWeightForDate(parsed.data.date);
  const caloriesBurned = estimateCaloriesBurned(
    parsed.data.type,
    parsed.data.distanceMiles,
    bodyWeightKg
  );

  await db.insert(activityEntries).values({
    occurredAt,
    type: parsed.data.type,
    distanceMiles: parsed.data.distanceMiles,
    caloriesBurned,
    notes: null,
  });

  revalidatePath("/diary");
  revalidatePath("/journal");
  revalidatePath("/calendar");
  revalidatePath("/reports");
  return { success: true };
}

export async function deleteActivityEntry(id: number) {
  await requireAdmin();
  await db.delete(activityEntries).where(eq(activityEntries.id, id));
  revalidatePath("/diary");
  revalidatePath("/journal");
  revalidatePath("/calendar");
  revalidatePath("/reports");
}
