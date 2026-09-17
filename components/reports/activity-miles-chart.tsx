"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { DailyActivityPoint } from "@/lib/reports/aggregate";

export function ActivityMilesChart({ data }: { data: DailyActivityPoint[] }) {
  if (data.every((d) => d.miles === 0)) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted">
        No activity logged yet.
      </p>
    );
  }

  const chartData = data.map((d) => ({ ...d, label: format(parseISO(d.date), "d MMM") }));

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
        <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [`${Number(value)} miles`, "Distance"]}
        />
        <Line
          type="monotone"
          dataKey="miles"
          stroke="var(--brand-teal)"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
