"use client";

import { useActionState, useState } from "react";
import { saveJournalEntry, type JournalFormState } from "@/lib/journal/actions";

interface JournalEditorProps {
  date: string;
  notes: string;
  activity: string;
}

const initialState: JournalFormState = {};

export function JournalEditor({ date, notes, activity }: JournalEditorProps) {
  const [activityValue, setActivityValue] = useState(activity);
  const [state, formAction, pending] = useActionState(saveJournalEntry, initialState);
  const isActiveDay = activityValue.trim().length > 0;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="date" value={date} />

      <div>
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="notes">
          How was today?
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={notes}
          rows={5}
          placeholder="Shakes were tolerable, mood was fine, bowels had opinions…"
          className="input-field"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-muted" htmlFor="activity">
            Activity / exercise
          </label>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
              isActiveDay
                ? "bg-brand-teal/15 text-brand-teal"
                : "bg-muted/15 text-muted"
            }`}
          >
            {isActiveDay ? "💪 Active day" : "Rest day"}
          </span>
        </div>
        <input
          id="activity"
          name="activity"
          value={activityValue}
          onChange={(e) => setActivityValue(e.target.value)}
          placeholder="e.g. 20 min walk, light yoga"
          className="input-field"
        />
        <p className="mt-1 text-xs text-muted">
          Fill this in and the day automatically gets flagged as active — no separate switch to
          forget about.
        </p>
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brand-rose" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-fit">
        {pending ? "Saving…" : "Save journal entry"}
      </button>
    </form>
  );
}
