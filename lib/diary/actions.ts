"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { diaryEntries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { normalizeOccurredAt } from "@/lib/datetime";

export interface DiaryEntryFormState {
  error?: string;
  success?: boolean;
}

const diaryEntrySchema = z.object({
  occurredAt: z.string().min(1, "Date/time is required"),
  itemId: z.coerce.number().int().positive("Pick something you had"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  mood: z.enum(["unhappy", "content", "happy"]).optional(),
  notes: z.string().trim().optional(),
});

export async function createDiaryEntry(
  _prevState: DiaryEntryFormState,
  formData: FormData
): Promise<DiaryEntryFormState> {
  await requireAdmin();

  const parsed = diaryEntrySchema.safeParse({
    occurredAt: formData.get("occurredAt"),
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
    mood: formData.get("mood") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.insert(diaryEntries).values({
    occurredAt: normalizeOccurredAt(parsed.data.occurredAt),
    itemId: parsed.data.itemId,
    quantity: parsed.data.quantity,
    mood: parsed.data.mood,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/diary");
  revalidatePath("/calendar");
  revalidatePath("/reports");
  return { success: true };
}

export async function deleteDiaryEntry(id: number) {
  await requireAdmin();
  await db.delete(diaryEntries).where(eq(diaryEntries.id, id));
  revalidatePath("/diary");
  revalidatePath("/calendar");
  revalidatePath("/reports");
}
