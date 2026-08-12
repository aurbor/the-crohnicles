"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { medicationEntries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { normalizeOccurredAt } from "@/lib/datetime";

export interface MedicationEntryFormState {
  error?: string;
  success?: boolean;
}

const medicationEntrySchema = z.object({
  occurredAt: z.string().min(1, "Date/time is required"),
  medicationId: z.coerce.number().int().positive("Pick a medication"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  notes: z.string().trim().optional(),
});

export async function createMedicationEntry(
  _prevState: MedicationEntryFormState,
  formData: FormData
): Promise<MedicationEntryFormState> {
  await requireAdmin();

  const parsed = medicationEntrySchema.safeParse({
    occurredAt: formData.get("occurredAt"),
    medicationId: formData.get("medicationId"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.insert(medicationEntries).values({
    occurredAt: normalizeOccurredAt(parsed.data.occurredAt),
    medicationId: parsed.data.medicationId,
    quantity: parsed.data.quantity,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/diary");
  revalidatePath("/calendar");
  revalidatePath("/reports");
  return { success: true };
}

export async function deleteMedicationEntry(id: number) {
  await requireAdmin();
  await db.delete(medicationEntries).where(eq(medicationEntries.id, id));
  revalidatePath("/diary");
  revalidatePath("/calendar");
  revalidatePath("/reports");
}
