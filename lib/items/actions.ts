"use server";

import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { items, diaryEntries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export interface ItemFormState {
  error?: string;
  success?: boolean;
}

const itemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(["drink", "food"]),
  calories: z.coerce.number().min(0, "Calories can't be negative"),
  protein: z.coerce.number().min(0, "Protein can't be negative"),
  sugar: z.coerce.number().min(0, "Sugar can't be negative"),
  unitWeightG: z.coerce.number().min(0.1).optional(),
});

function parseItemForm(formData: FormData) {
  const type = formData.get("type");
  const raw = {
    name: formData.get("name"),
    type,
    calories: formData.get("calories"),
    protein: formData.get("protein"),
    sugar: formData.get("sugar"),
    unitWeightG:
      type === "food" ? formData.get("unitWeightG") || undefined : undefined,
  };
  const parsed = itemSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" } as const;
  }
  if (parsed.data.type === "food" && !parsed.data.unitWeightG) {
    return { error: "Weight per piece (g) is required for food items" } as const;
  }
  return { data: parsed.data } as const;
}

export async function createItem(
  _prevState: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  await requireAdmin();
  const parsed = parseItemForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data } = parsed;
  await db.insert(items).values({
    name: data.name,
    type: data.type,
    basis: data.type === "drink" ? "per_serving" : "per_100g",
    calories: data.calories,
    protein: data.protein,
    sugar: data.sugar,
    unitWeightG: data.type === "food" ? data.unitWeightG ?? null : null,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/items");
  return { success: true };
}

export async function updateItem(
  id: number,
  _prevState: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  await requireAdmin();
  const parsed = parseItemForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data } = parsed;
  await db
    .update(items)
    .set({
      name: data.name,
      type: data.type,
      basis: data.type === "drink" ? "per_serving" : "per_100g",
      calories: data.calories,
      protein: data.protein,
      sugar: data.sugar,
      unitWeightG: data.type === "food" ? data.unitWeightG ?? null : null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(items.id, id));

  revalidatePath("/items");
  return { success: true };
}

export async function setItemArchived(id: number, archived: boolean) {
  await requireAdmin();
  await db
    .update(items)
    .set({ archived, updatedAt: new Date().toISOString() })
    .where(eq(items.id, id));
  revalidatePath("/items");
}

export async function deleteItem(id: number) {
  await requireAdmin();
  const [{ value }] = await db
    .select({ value: count() })
    .from(diaryEntries)
    .where(eq(diaryEntries.itemId, id));

  if (value > 0) {
    throw new Error(
      "This item has diary entries logged against it and can't be deleted — archive it instead."
    );
  }

  await db.delete(items).where(eq(items.id, id));
  revalidatePath("/items");
}
