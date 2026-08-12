"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";

export function WeightChart({ data }: { data: { date: string; weightKg: number }[] }) {
  if (data.length === 0) {
    return <p className="flex h-full items-center justify-center text-sm text-muted">No weigh-ins logged yet.</p>;
  }

  const chartData = data.map((d) => ({ label: format(parseISO(d.date), "d MMM"), weightKg: d.weightKg }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--card-border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={{ stroke: "var(--card-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          domain={["dataMin - 1", "dataMax + 1"]}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value) => [`${value} kg`, "Weight"]}
        />
        <Line type="monotone" dataKey="weightKg" stroke="var(--brand-violet)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
