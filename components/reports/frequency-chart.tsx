"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { NameCount } from "@/lib/reports/aggregate";

export function FrequencyChart({ data, color }: { data: NameCount[]; color: string }) {
  if (data.length === 0) {
    return <p className="flex h-full items-center justify-center text-sm text-muted">Nothing logged yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--card-border)" />
        <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
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
        <Bar dataKey="count" fill={color} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
