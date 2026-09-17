import { and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activityEntries } from "@/lib/db/schema";
import { deleteActivityEntry, getBodyWeightForDate } from "@/lib/activity/actions";
import { ACTIVITY_EMOJI, ACTIVITY_LABELS } from "@/lib/activity/estimate";
import { ActivityInlineAdd } from "@/components/journal/activity-inline-add";
import { DeleteEntryButton } from "@/components/quick-add/delete-entry-button";

export async function DayActivity({ date }: { date: string }) {
  const [rows, bodyWeightKg] = await Promise.all([
    db
      .select()
      .from(activityEntries)
      .where(
        and(
          gte(activityEntries.occurredAt, `${date}T00:00:00`),
          lte(activityEntries.occurredAt, `${date}T23:59:59`)
        )
      )
      .orderBy(activityEntries.occurredAt),
    getBodyWeightForDate(date),
  ]);

  const totalBurned = rows.reduce((sum, r) => sum + r.caloriesBurned, 0);
  const totalMiles = rows.reduce((sum, r) => sum + r.distanceMiles, 0);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-muted">Activity</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            rows.length > 0 ? "bg-brand-teal/15 text-brand-teal" : "bg-muted/15 text-muted"
          }`}
        >
          {rows.length > 0 ? "🏃 Active day" : "Rest day"}
        </span>
      </div>

      <ActivityInlineAdd date={date} bodyWeightKg={bodyWeightKg} />

      {rows.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-card-border pt-3">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-2 text-sm">
              <span>
                {ACTIVITY_EMOJI[row.type]} {row.distanceMiles} mi{" "}
                {ACTIVITY_LABELS[row.type].toLowerCase()}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-medium text-brand-teal">
                  −{Math.round(row.caloriesBurned)} kcal
                </span>
                <DeleteEntryButton action={deleteActivityEntry.bind(null, row.id)} />
              </span>
            </div>
          ))}
          {rows.length > 1 && (
            <div className="mt-1 flex items-center justify-between border-t border-card-border pt-1.5 text-sm font-semibold">
              <span>{Math.round(totalMiles * 100) / 100} mi total</span>
              <span className="text-brand-teal">−{Math.round(totalBurned)} kcal</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
