import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { journalEntries } from "@/lib/db/schema";
import { todayForDateInput } from "@/lib/datetime";
import { DateNav } from "@/components/journal/date-nav";
import { JournalEditor } from "@/components/journal/journal-editor";
import { WeightQuickAdd } from "@/components/weight/weight-quick-add";
import { RecentJournal } from "./recent-journal";
import { RecentWeight } from "./recent-weight";

export default async function JournalPage({ searchParams }: PageProps<"/journal">) {
  const params = await searchParams;
  const dateParam = params.date;
  const date = typeof dateParam === "string" ? dateParam : todayForDateInput();

  const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.date, date));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Daily Journal</h1>
          <p className="text-sm text-muted">
            The unfiltered director&rsquo;s commentary track for your gut.
          </p>
        </div>
        <DateNav date={date} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card p-4">
          <JournalEditor date={date} notes={entry?.notes ?? ""} activity={entry?.activity ?? ""} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <h2 className="mb-2 text-sm font-bold text-muted">Weigh-ins</h2>
            <WeightQuickAdd />
          </div>
          <RecentWeight />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-bold">Past entries</h2>
        <RecentJournal activeDate={date} />
      </div>
    </div>
  );
}
