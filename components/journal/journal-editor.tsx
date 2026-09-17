"use client";

import { useActionState } from "react";
import { saveJournalEntry, type JournalFormState } from "@/lib/journal/actions";

interface JournalEditorProps {
  date: string;
  notes: string;
}

const initialState: JournalFormState = {};

export function JournalEditor({ date, notes }: JournalEditorProps) {
  const [state, formAction, pending] = useActionState(saveJournalEntry, initialState);

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
          key={date}
          defaultValue={notes}
          rows={8}
          placeholder="Shakes were tolerable, mood was fine, bowels had opinions…"
          className="input-field"
        />
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
