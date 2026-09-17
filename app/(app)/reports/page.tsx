import { format } from "date-fns";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";
import { getDietProgress, DIET_LENGTH_DAYS } from "@/lib/diet-period";
import { getReportsData } from "@/lib/reports/aggregate";
import type { CalorieTargets } from "@/lib/calorie-targets";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { StatTiles } from "@/components/reports/stat-tiles";
import { ChartCard } from "@/components/reports/chart-card";
import { CaloriesChart } from "@/components/reports/calories-chart";
import { NutrientTrendChart } from "@/components/reports/nutrient-trend-chart";
import { FrequencyChart } from "@/components/reports/frequency-chart";
import { DrinkTimelineChart } from "@/components/reports/drink-timeline-chart";
import { ActivityMilesChart } from "@/components/reports/activity-miles-chart";
import { MoodChart } from "@/components/reports/mood-chart";
import { SymptomChart } from "@/components/reports/symptom-chart";
import { WeightChart } from "@/components/reports/weight-chart";

export default async function ReportsPage({ searchParams }: PageProps<"/reports">) {
  const params = await searchParams;
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const [settingsRow] = await db.select().from(settings).limit(1);
  const dietStart = settingsRow?.dietStartDate ?? todayStr;
  const progress = getDietProgress(dietStart);

  const fullRangeStart = dietStart;
  const fullRangeEnd = progress.endDate;
  const defaultEnd = progress.isComplete ? fullRangeEnd : todayStr;

  const start = typeof params.start === "string" ? params.start : fullRangeStart;
  const end = typeof params.end === "string" ? params.end : defaultEnd;

  const data = await getReportsData(start, end);

  const targets: CalorieTargets = {
    suggestedCalories: settingsRow?.suggestedCalories ?? null,
    bmr: settingsRow?.bmr ?? null,
  };
  const avgDeficit =
    targets.bmr === null
      ? null
      : Math.round(targets.bmr + data.averages.avgBurned - data.averages.avgCalories);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Reports</h1>
          <p className="text-sm text-muted">
            Everything a consultant could want, minus the waiting-room magazines.
          </p>
        </div>
        <a href={`/reports/pdf?start=${start}&end=${end}`} className="btn-primary">
          ⬇ Export PDF
        </a>
      </div>

      <DateRangePicker start={start} end={end} fullRangeStart={fullRangeStart} fullRangeEnd={fullRangeEnd} />

      <StatTiles
        tiles={[
          { label: "Calories / day", value: `${data.averages.avgCalories}` },
          { label: "Burned / day", value: `${data.averages.avgBurned}` },
          { label: "Net / day", value: `${data.averages.avgNet}` },
          ...(avgDeficit !== null
            ? [
                {
                  label: avgDeficit >= 0 ? "Avg deficit / day" : "Avg surplus / day",
                  value: `${Math.abs(avgDeficit)}`,
                },
              ]
            : []),
          { label: "Protein / day", value: `${data.averages.avgProtein}g` },
          { label: "Sugar / day", value: `${data.averages.avgSugar}g` },
          { label: "Drinks / day", value: `${data.averages.avgDrinksPerDay}` },
          { label: "Food pieces / day", value: `${data.averages.avgFoodPerDay}` },
          { label: "Miles logged", value: `${data.activity.totalMiles}` },
          { label: "Active days", value: `${data.activeDayCount}/${data.totalDays}` },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Daily calories"
          wide
          subtitle={
            targets.bmr !== null || targets.suggestedCalories !== null
              ? "Each bar is that day's intake — teal is the slice cancelled out by activity. Dashed lines are your average, target and BMR."
              : "Each bar is that day's intake — teal is the slice cancelled out by activity. Set a target and BMR in Settings to see them here too."
          }
        >
          <CaloriesChart
            data={data.dailyNutrition}
            average={data.averages.avgCalories}
            targets={targets}
          />
        </ChartCard>
        <ChartCard title="Protein & sugar" subtitle="Daily totals, in grams.">
          <NutrientTrendChart data={data.dailyNutrition} />
        </ChartCard>
        <ChartCard title="Drink preference" subtitle="Which shake you actually reach for.">
          <FrequencyChart data={data.drinkFrequency} color="var(--brand-violet)" />
        </ChartCard>
        <ChartCard
          title="Drinks over time"
          wide
          subtitle="How often each flavour turns up, day by day."
        >
          <DrinkTimelineChart data={data.drinkTimeline} drinkNames={data.drinkNames} />
        </ChartCard>
        <ChartCard title="Activity" subtitle="Miles covered per day, running and walking combined.">
          <ActivityMilesChart data={data.dailyActivity} />
        </ChartCard>
        <ChartCard title="Food consumed" subtitle="Sweets and other permitted contraband.">
          <FrequencyChart data={data.foodFrequency} color="var(--brand-fuchsia)" />
        </ChartCard>
        <ChartCard title="Mood" subtitle="How the 3-face check-ins add up.">
          <MoodChart moodCounts={data.moodCounts} />
        </ChartCard>
        <ChartCard title="Weight" subtitle="Trend over the selected period.">
          <WeightChart data={data.weightSeries} />
        </ChartCard>
        <ChartCard title="Bristol Stool Scale" subtitle="Type 1 (hard) to Type 7 (liquid).">
          <SymptomChart data={data.symptomSeries} field="bristolScale" domain={[1, 7]} color="var(--brand-violet)" />
        </ChartCard>
        <ChartCard title="Pain / bloating severity" subtitle="0 (none) to 5 (severe).">
          <SymptomChart data={data.symptomSeries} field="severity" domain={[0, 5]} color="var(--brand-rose)" />
        </ChartCard>
      </div>

      <p className="text-xs text-muted">
        8-week diet window: {fullRangeStart} to {fullRangeEnd} ({DIET_LENGTH_DAYS} days).
      </p>
    </div>
  );
}
