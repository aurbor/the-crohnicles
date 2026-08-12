"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { journalEntries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export interface JournalFormState {
  error?: string;
  success?: boolean;
}

const journalSchema = z.object({
  date: z.string().min(1, "Date is required"),
  notes: z.string().trim().optional(),
  activity: z.string().trim().optional(),
});

export async function saveJournalEntry(
  _prevState: JournalFormState,
  formData: FormData
): Promise<JournalFormState> {
  await requireAdmin();

  const parsed = journalSchema.safeParse({
    date: formData.get("date"),
    notes: formData.get("notes") || undefined,
    activity: formData.get("activity") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { date, notes, activity } = parsed.data;
  const now = new Date().toISOString();

  await db
    .insert(journalEntries)
    .values({
      date,
      notes: notes || "",
      activity: activity || null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: journalEntries.date,
      set: { notes: notes || "", activity: activity || null, updatedAt: now },
    });

  revalidatePath("/journal");
  revalidatePath("/calendar");
  return { success: true };
}

export async function deleteJournalEntry(id: number) {
  await requireAdmin();
  await db.delete(journalEntries).where(eq(journalEntries.id, id));
  revalidatePath("/journal");
  revalidatePath("/calendar");
}
