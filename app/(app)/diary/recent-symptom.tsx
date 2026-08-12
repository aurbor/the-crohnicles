import { desc } from "drizzle-orm";
import { format, parseISO } from "date-fns";
import { db } from "@/lib/db/client";
import { symptomEntries } from "@/lib/db/schema";
import { deleteSymptomEntry } from "@/lib/symptoms/actions";
import { DeleteEntryButton } from "@/components/quick-add/delete-entry-button";

const SEVERITY_LABELS = ["None", "Mild", "Noticeable", "Uncomfortable", "Bad", "Severe"];

export async function RecentSymptom() {
  const rows = await db
    .select()
    .from(symptomEntries)
    .orderBy(desc(symptomEntries.occurredAt), desc(symptomEntries.id))
    .limit(10);

  if (rows.length === 0) {
    return <p className="text-sm text-muted">Nothing logged yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-muted">Recently logged</h3>
      {rows.map((row) => (
        <div key={row.id} className="card flex items-start justify-between gap-2 p-3 text-sm">
          <div>
            <p className="font-medium">
              {row.bristolScale && `Type ${row.bristolScale}`}
              {row.bristolScale && row.severity !== null ? " · " : ""}
              {row.severity !== null && SEVERITY_LABELS[row.severity]}
            </p>
            <p className="text-xs text-muted">{format(parseISO(row.occurredAt), "EEE d MMM, HH:mm")}</p>
            {row.notes && <p className="mt-0.5 text-xs italic text-muted">&ldquo;{row.notes}&rdquo;</p>}
          </div>
          <DeleteEntryButton action={deleteSymptomEntry.bind(null, row.id)} />
        </div>
      ))}
    </div>
  );
}
