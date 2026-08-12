"use client";

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import type { SymptomPoint } from "@/lib/reports/aggregate";

export function SymptomChart({
  data,
  field,
  domain,
  color,
}: {
  data: SymptomPoint[];
  field: "bristolScale" | "severity";
  domain: [number, number];
  color: string;
}) {
  const points = data
    .filter((d) => d[field] !== null)
    .map((d) => ({ label: format(parseISO(d.date), "d MMM"), value: d[field] }));

  if (points.length === 0) {
    return <p className="flex h-full items-center justify-center text-sm text-muted">Nothing logged yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="var(--card-border)" />
        <XAxis
          dataKey="label"
          type="category"
          allowDuplicatedCategory={false}
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={{ stroke: "var(--card-border)" }}
          tickLine={false}
        />
        <YAxis
          dataKey="value"
          type="number"
          domain={domain}
          allowDecimals={false}
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Scatter data={points} fill={color} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
