import { db } from "@/lib/db/client";
import { medications, medicationEntries } from "@/lib/db/schema";
import { AddMedicationPanel } from "@/components/medications/add-medication-panel";
import { MedicationList, type MedicationRow } from "@/components/medications/medication-list";

export default async function MedicationsPage() {
  const [allMeds, entries] = await Promise.all([
    db.select().from(medications),
    db.select({ medicationId: medicationEntries.medicationId }).from(medicationEntries),
  ]);

  const medIdsWithEntries = new Set(entries.map((e) => e.medicationId));

  const rows: MedicationRow[] = allMeds
    .map((med) => ({
      id: med.id,
      name: med.name,
      form: med.form,
      unitsPerDose: med.unitsPerDose,
      strength: med.strength,
      archived: med.archived,
      hasEntries: medIdsWithEntries.has(med.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Medications</h1>
        <p className="text-sm text-muted">
          The other daily ritual. Set a standard dose here and quick-add will
          pre-fill it every time you log one.
        </p>
      </div>

      <AddMedicationPanel />
      <MedicationList medications={rows} />
    </div>
  );
}
