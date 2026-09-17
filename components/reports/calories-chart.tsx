"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { DailyNutrition } from "@/lib/reports/aggregate";
import type { CalorieTargets } from "@/lib/calorie-targets";

export function CaloriesChart({
  data,
  average,
  targets,
}: {
  data: DailyNutrition[];
  average: number;
  targets: CalorieTargets;
}) {
  const chartData = data.map((d) => {
    // One bar per day, split in two: the part of the day's intake that activity
    // cancelled out, and the part that stuck. Together they add up to what was
    // eaten, so bar height still reads as intake. A day where activity burned
    // more than was eaten is clamped so the stack can't exceed the bar — the
    // true figures are still reported in the tooltip.
    const offset = Math.min(d.burned, d.calories);
    return {
      ...d,
      label: format(parseISO(d.date), "d MMM"),
      kept: Math.max(d.calories - d.burned, 0),
      offset,
    };
  });

  const hasBurn = data.some((d) => d.burned > 0);

  // The Y axis scales to the data by default, which would push a target or BMR
  // line above the top of the chart and quietly hide it — on this diet intake
  // sits well below both. Grow the domain so they're always in frame.
  const referenceMax = Math.max(targets.suggestedCalories ?? 0, targets.bmr ?? 0);
  const yDomain: [number, (dataMax: number) => number] = [
    0,
    (dataMax: number) => Math.ceil(Math.max(dataMax, referenceMax * 1.08) / 100) * 100,
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--card-border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          interval="preserveStartEnd"
          axisLine={{ stroke: "var(--card-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          domain={yDomain}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value, name, item) => {
            const row = item?.payload as (typeof chartData)[number] | undefined;
            if (!row) return [`${Math.round(Number(value))} kcal`, String(name)];
            if (name === "Burned off") {
              return [`${Math.round(row.burned)} kcal`, "Burned off by activity"];
            }
            return [`${Math.round(row.calories)} kcal eaten · ${Math.round(row.net)} net`, "Intake"];
          }}
        />
        {hasBurn && <Legend wrapperStyle={{ fontSize: 11 }} />}

        {targets.suggestedCalories !== null && (
          <ReferenceLine
            y={targets.suggestedCalories}
            stroke="var(--brand-teal)"
            strokeDasharray="6 3"
            label={{
              value: `target ${targets.suggestedCalories}`,
              position: "insideTopLeft",
              fontSize: 10,
              fill: "var(--brand-teal)",
            }}
          />
        )}
        {targets.bmr !== null && (
          <ReferenceLine
            y={targets.bmr}
            stroke="var(--brand-rose)"
            strokeDasharray="2 3"
            label={{
              value: `BMR ${targets.bmr}`,
              position: "insideBottomRight",
              fontSize: 10,
              fill: "var(--brand-rose)",
            }}
          />
        )}
        <ReferenceLine
          y={average}
          stroke="var(--brand-orange)"
          strokeDasharray="4 4"
          label={{
            value: `avg ${Math.round(average)}`,
            position: "insideTopRight",
            fontSize: 10,
            fill: "var(--brand-orange)",
          }}
        />

        {/* No corner radius: on days without activity the top segment has zero
            height, so rounding it would leave the visible bar flat-topped. */}
        <Bar dataKey="kept" name="Net" stackId="calories" fill="var(--brand-violet)" />
        <Bar dataKey="offset" name="Burned off" stackId="calories" fill="var(--brand-teal)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
