import { db } from "@/lib/db/client";
import {
  items,
  diaryEntries,
  medications,
  medicationEntries,
  symptomEntries,
  journalEntries,
  weightEntries,
  settings,
} from "@/lib/db/schema";

export interface BackupData {
  exportedAt: string;
  version: 1;
  items: (typeof items.$inferSelect)[];
  diaryEntries: (typeof diaryEntries.$inferSelect)[];
  medications: (typeof medications.$inferSelect)[];
  medicationEntries: (typeof medicationEntries.$inferSelect)[];
  symptomEntries: (typeof symptomEntries.$inferSelect)[];
  journalEntries: (typeof journalEntries.$inferSelect)[];
  weightEntries: (typeof weightEntries.$inferSelect)[];
  settings: (typeof settings.$inferSelect)[];
}

export async function exportAllData(): Promise<BackupData> {
  const [
    itemsRows,
    diaryRows,
    medicationRows,
    medicationEntryRows,
    symptomRows,
    journalRows,
    weightRows,
    settingsRows,
  ] = await Promise.all([
    db.select().from(items),
    db.select().from(diaryEntries),
    db.select().from(medications),
    db.select().from(medicationEntries),
    db.select().from(symptomEntries),
    db.select().from(journalEntries),
    db.select().from(weightEntries),
    db.select().from(settings),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    items: itemsRows,
    diaryEntries: diaryRows,
    medications: medicationRows,
    medicationEntries: medicationEntryRows,
    symptomEntries: symptomRows,
    journalEntries: journalRows,
    weightEntries: weightRows,
    settings: settingsRows,
  };
}

export async function importAllData(data: BackupData): Promise<void> {
  if (data.version !== 1) {
    throw new Error("Unrecognized backup version.");
  }

  db.transaction((tx) => {
    tx.delete(medicationEntries).run();
    tx.delete(diaryEntries).run();
    tx.delete(symptomEntries).run();
    tx.delete(journalEntries).run();
    tx.delete(weightEntries).run();
    tx.delete(medications).run();
    tx.delete(items).run();
    tx.delete(settings).run();

    if (data.items.length) tx.insert(items).values(data.items).run();
    if (data.medications.length) tx.insert(medications).values(data.medications).run();
    if (data.diaryEntries.length) tx.insert(diaryEntries).values(data.diaryEntries).run();
    if (data.medicationEntries.length)
      tx.insert(medicationEntries).values(data.medicationEntries).run();
    if (data.symptomEntries.length) tx.insert(symptomEntries).values(data.symptomEntries).run();
    if (data.journalEntries.length) tx.insert(journalEntries).values(data.journalEntries).run();
    if (data.weightEntries.length) tx.insert(weightEntries).values(data.weightEntries).run();
    if (data.settings.length) tx.insert(settings).values(data.settings).run();
  });
}
