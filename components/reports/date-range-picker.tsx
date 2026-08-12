"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DateRangePicker({
  start,
  end,
  fullRangeStart,
  fullRangeEnd,
}: {
  start: string;
  end: string;
  fullRangeStart: string;
  fullRangeEnd: string;
}) {
  const router = useRouter();
  const [localStart, setLocalStart] = useState(start);
  const [localEnd, setLocalEnd] = useState(end);

  function apply(newStart: string, newEnd: string) {
    router.push(`/reports?start=${newStart}&end=${newEnd}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted" htmlFor="range-start">
          From
        </label>
        <input
          id="range-start"
          type="date"
          value={localStart}
          onChange={(e) => setLocalStart(e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted" htmlFor="range-end">
          To
        </label>
        <input
          id="range-end"
          type="date"
          value={localEnd}
          onChange={(e) => setLocalEnd(e.target.value)}
          className="input-field"
        />
      </div>
      <button className="btn-primary" onClick={() => apply(localStart, localEnd)}>
        Update
      </button>
      <button
        className="btn-secondary text-xs"
        onClick={() => {
          setLocalStart(fullRangeStart);
          setLocalEnd(fullRangeEnd);
          apply(fullRangeStart, fullRangeEnd);
        }}
      >
        Full 8 weeks
      </button>
    </div>
  );
}
