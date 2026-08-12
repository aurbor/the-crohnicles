import { desc, eq } from "drizzle-orm";
import { format, parseISO } from "date-fns";
import { db } from "@/lib/db/client";
import { medicationEntries, medications } from "@/lib/db/schema";
import { deleteMedicationEntry } from "@/lib/medication-entries/actions";
import { DeleteEntryButton } from "@/components/quick-add/delete-entry-button";

export async function RecentMedication() {
  const rows = await db
    .select({
      id: medicationEntries.id,
      occurredAt: medicationEntries.occurredAt,
      quantity: medicationEntries.quantity,
      notes: medicationEntries.notes,
      medicationName: medications.name,
      strength: medications.strength,
      form: medications.form,
    })
    .from(medicationEntries)
    .innerJoin(medications, eq(medicationEntries.medicationId, medications.id))
    .orderBy(desc(medicationEntries.occurredAt), desc(medicationEntries.id))
    .limit(10);

  if (rows.length === 0) {
    return <p className="text-sm text-muted">No doses logged yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-muted">Recently logged</h3>
      {rows.map((row) => (
        <div key={row.id} className="card flex items-start justify-between gap-2 p-3 text-sm">
          <div>
            <p className="font-medium">
              {row.quantity}× {row.medicationName} ({row.strength} {row.form})
            </p>
            <p className="text-xs text-muted">{format(parseISO(row.occurredAt), "EEE d MMM, HH:mm")}</p>
            {row.notes && <p className="mt-0.5 text-xs italic text-muted">&ldquo;{row.notes}&rdquo;</p>}
          </div>
          <DeleteEntryButton action={deleteMedicationEntry.bind(null, row.id)} />
        </div>
      ))}
    </div>
  );
}
