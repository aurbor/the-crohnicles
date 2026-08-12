"use client";

import { useRouter } from "next/navigation";
import { addDays, format, parseISO } from "date-fns";

export function DateNav({ date }: { date: string }) {
  const router = useRouter();

  function goTo(newDate: string) {
    router.push(`/journal?date=${newDate}`);
  }

  const parsed = parseISO(date);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="btn-secondary h-9 w-9 !p-0"
        onClick={() => goTo(format(addDays(parsed, -1), "yyyy-MM-dd"))}
        aria-label="Previous day"
      >
        ←
      </button>
      <input
        type="date"
        value={date}
        onChange={(e) => e.target.value && goTo(e.target.value)}
        className="input-field"
      />
      <button
        type="button"
        className="btn-secondary h-9 w-9 !p-0"
        onClick={() => goTo(format(addDays(parsed, 1), "yyyy-MM-dd"))}
        aria-label="Next day"
      >
        →
      </button>
      <button type="button" className="btn-secondary text-xs" onClick={() => goTo(format(new Date(), "yyyy-MM-dd"))}>
        Today
      </button>
    </div>
  );
}
