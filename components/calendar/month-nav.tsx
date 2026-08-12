"use client";

import { useRouter } from "next/navigation";
import { addMonths, format, parseISO } from "date-fns";

export function MonthNav({ month, label }: { month: string; label: string }) {
  const router = useRouter();
  const parsed = parseISO(`${month}-01`);

  function goTo(newMonth: string) {
    router.push(`/calendar?month=${newMonth}`);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="btn-secondary h-9 w-9 !p-0"
        onClick={() => goTo(format(addMonths(parsed, -1), "yyyy-MM"))}
        aria-label="Previous month"
      >
        ←
      </button>
      <span className="min-w-32 text-center text-lg font-bold">{label}</span>
      <button
        type="button"
        className="btn-secondary h-9 w-9 !p-0"
        onClick={() => goTo(format(addMonths(parsed, 1), "yyyy-MM"))}
        aria-label="Next month"
      >
        →
      </button>
      <button
        type="button"
        className="btn-secondary text-xs"
        onClick={() => goTo(format(new Date(), "yyyy-MM"))}
      >
        This month
      </button>
    </div>
  );
}
