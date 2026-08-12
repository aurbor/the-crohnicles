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

export async function updateDietStartDate(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  const parsed = z.string().min(1, "Date is required").safeParse(formData.get("dietStartDate"));
  if (!parsed.success) {
    return { error: "Invalid date" };
  }

  const [existing] = await db.select().from(settings).limit(1);
  if (existing) {
    await db.update(settings).set({ dietStartDate: parsed.data });
  } else {
    await db.insert(settings).values({ dietStartDate: parsed.data });
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
