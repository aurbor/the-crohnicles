"use client";

import { motion } from "framer-motion";

const MOODS = [
  { value: "unhappy", emoji: "😣", label: "Rough" },
  { value: "content", emoji: "😐", label: "Okay" },
  { value: "happy", emoji: "😄", label: "Good" },
] as const;

export type Mood = (typeof MOODS)[number]["value"];

export function MoodPicker({
  value,
  onChange,
}: {
  value: Mood | null;
  onChange: (value: Mood | null) => void;
}) {
  return (
    <div className="flex gap-2">
      {MOODS.map((mood) => {
        const selected = value === mood.value;
        return (
          <motion.button
            key={mood.value}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(selected ? null : mood.value)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5 transition-colors ${
              selected
                ? "border-brand-violet bg-brand-violet/15"
                : "border-card-border bg-card hover:bg-brand-violet/5"
            }`}
          >
            <motion.span
              className="text-2xl"
              animate={selected ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {mood.emoji}
            </motion.span>
            <span className="text-xs font-medium text-muted">{mood.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
