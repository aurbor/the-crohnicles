import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";
import { getMonthData } from "@/lib/calendar/month-data";
import { getDietProgress } from "@/lib/diet-period";
import { MonthNav } from "@/components/calendar/month-nav";
import { CalendarGrid } from "@/components/calendar/calendar-grid";

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const params = await searchParams;
  const monthParam = params.month;
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const month = typeof monthParam === "string" ? monthParam : todayStr.slice(0, 7);

  const monthDate = parseISO(`${month}-01`);
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd }).map((d) =>
    format(d, "yyyy-MM-dd")
  );

  const weeks: string[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const gridEndExclusive = format(addDays(gridEnd, 1), "yyyy-MM-dd");
  const daysMap = await getMonthData(allDays[0], gridEndExclusive);
  const daysData = Object.fromEntries(daysMap);

  const [settingsRow] = await db.select().from(settings).limit(1);
  const progress = settingsRow ? getDietProgress(settingsRow.dietStartDate) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted">The helicopter view of your gut&rsquo;s journey.</p>
        </div>
        <MonthNav month={month} label={format(monthDate, "MMMM yyyy")} />
      </div>

      {progress && !progress.isBeforeStart && (
        <div className="card flex items-center gap-4 p-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-brand-violet/10">
            <div
              className="brand-gradient h-full rounded-full transition-all"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
          <span className="shrink-0 text-sm font-semibold text-muted">
            {progress.isComplete ? "Day 56 of 56 — you did it! 🎉" : `Day ${progress.dayNumber} of 56`}
          </span>
        </div>
      )}

      <CalendarGrid weeks={weeks} daysData={daysData} currentMonth={month} todayStr={todayStr} />

      <p className="text-xs text-muted">
        🥤 drinks/food logged · 😄 mood · 💪 active day · 💊 medication · 🚽 symptom logged. Tap any
        day for the full breakdown.
      </p>
    </div>
  );
}
