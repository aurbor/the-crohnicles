"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { weightEntries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export interface WeightFormState {
  error?: string;
  success?: boolean;
}

const weightSchema = z.object({
  date: z.string().min(1, "Date is required"),
  weightKg: z.coerce.number().positive("Weight must be greater than 0"),
  notes: z.string().trim().optional(),
});

export async function createWeightEntry(
  _prevState: WeightFormState,
  formData: FormData
): Promise<WeightFormState> {
  await requireAdmin();

  const parsed = weightSchema.safeParse({
    date: formData.get("date"),
    weightKg: formData.get("weightKg"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.insert(weightEntries).values({
    date: parsed.data.date,
    weightKg: parsed.data.weightKg,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/journal");
  revalidatePath("/reports");
  return { success: true };
}

export async function deleteWeightEntry(id: number) {
  await requireAdmin();
  await db.delete(weightEntries).where(eq(weightEntries.id, id));
  revalidatePath("/journal");
  revalidatePath("/reports");
}
