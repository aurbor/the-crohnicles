import Link from "next/link";
import { desc, gte } from "drizzle-orm";
import { format, parseISO } from "date-fns";
import { db } from "@/lib/db/client";
import { activityEntries, journalEntries } from "@/lib/db/schema";

export async function RecentJournal({ activeDate }: { activeDate: string }) {
  const rows = await db
    .select()
    .from(journalEntries)
    .orderBy(desc(journalEntries.date))
    .limit(14);

  const withContent = rows.filter((r) => r.notes || r.activity);

  if (withContent.length === 0) {
    return <p className="text-sm text-muted">No past entries yet.</p>;
  }

  const earliest = withContent[withContent.length - 1].date;
  const activityRows = await db
    .select({ occurredAt: activityEntries.occurredAt })
    .from(activityEntries)
    .where(gte(activityEntries.occurredAt, `${earliest}T00:00:00`));
  const activeDates = new Set(activityRows.map((r) => r.occurredAt.slice(0, 10)));

  return (
    <div className="flex flex-col gap-2">
      {withContent.map((row) => {
        const active = activeDates.has(row.date) || !!row.activity?.trim();
        return (
          <Link
            key={row.id}
            href={`/journal?date=${row.date}`}
            className={`card block p-3 text-sm transition-colors hover:border-brand-violet/40 ${
              row.date === activeDate ? "border-brand-violet" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{format(parseISO(row.date), "EEE d MMM")}</span>
              {active && (
                <span title={activeDates.has(row.date) ? "Activity logged" : (row.activity ?? "")}>
                  {activeDates.has(row.date) ? "🏃" : "💪"}
                </span>
              )}
            </div>
            {row.notes && <p className="mt-0.5 truncate text-xs text-muted">{row.notes}</p>}
          </Link>
        );
      })}
    </div>
  );
}
