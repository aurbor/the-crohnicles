import { desc } from "drizzle-orm";
import { format, parseISO } from "date-fns";
import { db } from "@/lib/db/client";
import { weightEntries } from "@/lib/db/schema";
import { deleteWeightEntry } from "@/lib/weight/actions";
import { DeleteEntryButton } from "@/components/quick-add/delete-entry-button";

export async function RecentWeight() {
  const rows = await db.select().from(weightEntries).orderBy(desc(weightEntries.date), desc(weightEntries.id)).limit(8);

  if (rows.length === 0) {
    return <p className="text-sm text-muted">No weigh-ins logged yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.id} className="card flex items-center justify-between gap-2 p-3 text-sm">
          <div>
            <span className="font-semibold">{row.weightKg} kg</span>{" "}
            <span className="text-muted">· {format(parseISO(row.date), "EEE d MMM")}</span>
            {row.notes && <p className="text-xs italic text-muted">&ldquo;{row.notes}&rdquo;</p>}
          </div>
          <DeleteEntryButton action={deleteWeightEntry.bind(null, row.id)} />
        </div>
      ))}
    </div>
  );
}
