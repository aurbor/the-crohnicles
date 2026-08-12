"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { DailyNutrition } from "@/lib/reports/aggregate";

export function CaloriesChart({ data, average }: { data: DailyNutrition[]; average: number }) {
  const chartData = data.map((d) => ({ ...d, label: format(parseISO(d.date), "d MMM") }));

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
        <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [`${Math.round(Number(value))} kcal`, "Calories"]}
        />
        <ReferenceLine
          y={average}
          stroke="var(--brand-orange)"
          strokeDasharray="4 4"
          label={{ value: `avg ${Math.round(average)}`, position: "insideTopRight", fontSize: 10, fill: "var(--brand-orange)" }}
        />
        <Bar dataKey="calories" fill="var(--brand-violet)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
