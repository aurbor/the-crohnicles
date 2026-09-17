"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { importAllData, type BackupData } from "./backup";

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

const optionalPositiveInt = z
  .union([z.literal(""), z.coerce.number().int().positive()])
  .transform((v) => (v === "" ? null : v));

const settingsSchema = z.object({
  dietStartDate: z.string().min(1, "Diet start date is required"),
  suggestedCalories: optionalPositiveInt,
  bmr: optionalPositiveInt,
});

export async function updateDietSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    dietStartDate: formData.get("dietStartDate"),
    suggestedCalories: formData.get("suggestedCalories") ?? "",
    bmr: formData.get("bmr") ?? "",
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message === "Diet start date is required"
          ? "Diet start date is required"
          : "Calories and BMR must be whole numbers above 0 (or left blank).",
    };
  }

  const values = {
    dietStartDate: parsed.data.dietStartDate,
    suggestedCalories: parsed.data.suggestedCalories,
    bmr: parsed.data.bmr,
  };

  const [existing] = await db.select().from(settings).limit(1);
  if (existing) {
    await db.update(settings).set(values);
  } else {
    await db.insert(settings).values(values);
  }

  revalidatePath("/settings");
  revalidatePath("/calendar");
  revalidatePath("/reports");
  return { success: true };
}

export async function importBackup(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a backup JSON file first." };
  }

  let data: BackupData;
  try {
    data = JSON.parse(await file.text());
  } catch {
    return { error: "That file isn't valid JSON." };
  }

  try {
    await importAllData(data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Import failed." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
