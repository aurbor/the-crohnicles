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
import type { DailyNutrition } from "@/lib/reports/aggregate";

export function NutrientTrendChart({ data }: { data: DailyNutrition[] }) {
  const chartData = data.map((d) => ({ ...d, label: format(parseISO(d.date), "d MMM") }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
          label={{ value: "grams", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--muted)" }}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="protein" name="Protein" stroke="var(--brand-teal)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="sugar" name="Sugar" stroke="var(--brand-amber)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
