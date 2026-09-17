"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { DrinkTimelinePoint } from "@/lib/reports/aggregate";

/** Fixed slot order — a drink keeps its colour regardless of how many are shown. */
const SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

export function DrinkTimelineChart({
  data,
  drinkNames,
}: {
  data: DrinkTimelinePoint[];
  drinkNames: string[];
}) {
  if (drinkNames.length === 0) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted">
        No drinks logged yet.
      </p>
    );
  }

  // Past eight distinct drinks, colours would have to repeat — fold the
  // long tail into one "Other" line rather than reusing a hue.
  const named = drinkNames.slice(0, SERIES_COLORS.length);
  const overflow = drinkNames.slice(SERIES_COLORS.length);

  const chartData = data.map((point) => {
    const row: Record<string, string | number> = {
      label: format(parseISO(point.date as string), "d MMM"),
    };
    for (const name of named) row[name] = Number(point[name] ?? 0);
    if (overflow.length > 0) {
      row.Other = overflow.reduce((sum, name) => sum + Number(point[name] ?? 0), 0);
    }
    return row;
  });

  const series = [
    ...named.map((name, i) => ({ name, color: SERIES_COLORS[i] })),
    ...(overflow.length > 0 ? [{ name: "Other", color: "var(--muted)" }] : []),
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          itemSorter={(item) => -Number(item.value ?? 0)}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
