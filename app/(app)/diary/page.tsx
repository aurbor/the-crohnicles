import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { items, medications } from "@/lib/db/schema";
import { QuickAddTabs } from "@/components/quick-add/quick-add-tabs";
import { DiaryQuickAdd } from "@/components/quick-add/diary-quick-add";
import { MedicationQuickAdd } from "@/components/quick-add/medication-quick-add";
import { SymptomQuickAdd } from "@/components/quick-add/symptom-quick-add";
import { RecentDiary } from "./recent-diary";
import { RecentMedication } from "./recent-medication";
import { RecentSymptom } from "./recent-symptom";

export default async function DiaryPage() {
  const [activeItems, activeMedications] = await Promise.all([
    db.select().from(items).where(eq(items.archived, false)),
    db.select().from(medications).where(eq(medications.archived, false)),
  ]);

  const sortedItems = [...activeItems].sort((a, b) => a.name.localeCompare(b.name));
  const sortedMedications = [...activeMedications].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Quick Add</h1>
        <p className="text-sm text-muted">
          Log it now, before you forget (or before it becomes a distant, regrettable memory).
        </p>
      </div>

      <QuickAddTabs
        foodTab={
          <>
            <div className="card p-4">
              <DiaryQuickAdd items={sortedItems} />
            </div>
            <RecentDiary />
          </>
        }
        medicationTab={
          <>
            <div className="card p-4">
              <MedicationQuickAdd medications={sortedMedications} />
            </div>
            <RecentMedication />
          </>
        }
        symptomTab={
          <>
            <div className="card p-4">
              <SymptomQuickAdd />
            </div>
            <RecentSymptom />
          </>
        }
      />
    </div>
  );
}
