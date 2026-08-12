"use server";

import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { medications, medicationEntries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export interface MedicationFormState {
  error?: string;
  success?: boolean;
}

const medicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  form: z.string().trim().min(1, "Form is required"),
  unitsPerDose: z.coerce.number().positive("Quantity must be greater than 0"),
  strength: z.string().trim().min(1, "Strength is required"),
});

function parseMedicationForm(formData: FormData) {
  const parsed = medicationSchema.safeParse({
    name: formData.get("name"),
    form: formData.get("form"),
    unitsPerDose: formData.get("unitsPerDose"),
    strength: formData.get("strength"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" } as const;
  }
  return { data: parsed.data } as const;
}

export async function createMedication(
  _prevState: MedicationFormState,
  formData: FormData
): Promise<MedicationFormState> {
  await requireAdmin();
  const parsed = parseMedicationForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db.insert(medications).values({
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/medications");
  return { success: true };
}

export async function updateMedication(
  id: number,
  _prevState: MedicationFormState,
  formData: FormData
): Promise<MedicationFormState> {
  await requireAdmin();
  const parsed = parseMedicationForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db
    .update(medications)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(eq(medications.id, id));

  revalidatePath("/medications");
  return { success: true };
}

export async function setMedicationArchived(id: number, archived: boolean) {
  await requireAdmin();
  await db
    .update(medications)
    .set({ archived, updatedAt: new Date().toISOString() })
    .where(eq(medications.id, id));
  revalidatePath("/medications");
}

export async function deleteMedication(id: number) {
  await requireAdmin();
  const [{ value }] = await db
    .select({ value: count() })
    .from(medicationEntries)
    .where(eq(medicationEntries.medicationId, id));

  if (value > 0) {
    throw new Error(
      "This medication has doses logged against it and can't be deleted — archive it instead."
    );
  }

  await db.delete(medications).where(eq(medications.id, id));
  revalidatePath("/medications");
}
