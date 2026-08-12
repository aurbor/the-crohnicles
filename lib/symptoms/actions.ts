"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { symptomEntries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { normalizeOccurredAt } from "@/lib/datetime";

export interface SymptomEntryFormState {
  error?: string;
  success?: boolean;
}

const symptomEntrySchema = z.object({
  occurredAt: z.string().min(1, "Date/time is required"),
  bristolScale: z.coerce.number().int().min(1).max(7).optional(),
  severity: z.coerce.number().int().min(0).max(5).optional(),
  notes: z.string().trim().optional(),
});

export async function createSymptomEntry(
  _prevState: SymptomEntryFormState,
  formData: FormData
): Promise<SymptomEntryFormState> {
  await requireAdmin();

  const bristolRaw = formData.get("bristolScale");
  const severityRaw = formData.get("severity");

  const parsed = symptomEntrySchema.safeParse({
    occurredAt: formData.get("occurredAt"),
    bristolScale: bristolRaw || undefined,
    severity: severityRaw === null || severityRaw === "" ? undefined : severityRaw,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.bristolScale === undefined && parsed.data.severity === undefined && !parsed.data.notes) {
    return { error: "Log at least a Bristol score, severity, or note." };
  }

  await db.insert(symptomEntries).values({
    occurredAt: normalizeOccurredAt(parsed.data.occurredAt),
    bristolScale: parsed.data.bristolScale ?? null,
    severity: parsed.data.severity ?? null,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/diary");
  revalidatePath("/calendar");
  revalidatePath("/reports");
  return { success: true };
}

export async function deleteSymptomEntry(id: number) {
  await requireAdmin();
  await db.delete(symptomEntries).where(eq(symptomEntries.id, id));
  revalidatePath("/diary");
  revalidatePath("/calendar");
  revalidatePath("/reports");
}
