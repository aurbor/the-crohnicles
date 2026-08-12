"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import type { Mood } from "@/components/quick-add/mood-picker";

const MOOD_ORDER: { mood: Mood; label: string; color: string }[] = [
  { mood: "unhappy", label: "Rough 😣", color: "var(--brand-rose)" },
  { mood: "content", label: "Okay 😐", color: "var(--brand-amber)" },
  { mood: "happy", label: "Good 😄", color: "var(--brand-teal)" },
];

export function MoodChart({ moodCounts }: { moodCounts: { mood: Mood; count: number }[] }) {
  const data = MOOD_ORDER.map((m) => ({
    label: m.label,
    color: m.color,
    count: moodCounts.find((c) => c.mood === m.mood)?.count ?? 0,
  }));

  if (data.every((d) => d.count === 0)) {
    return <p className="flex h-full items-center justify-center text-sm text-muted">No moods logged yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={{ stroke: "var(--card-border)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.label} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
