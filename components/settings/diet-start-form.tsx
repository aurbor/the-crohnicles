"use client";

import { useActionState } from "react";
import { updateDietStartDate, type SettingsFormState } from "@/lib/settings/actions";

const initialState: SettingsFormState = {};

export function DietStartForm({ currentDate }: { currentDate: string }) {
  const [state, formAction, pending] = useActionState(updateDietStartDate, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted" htmlFor="dietStartDate">
          Diet start date
        </label>
        <input
          id="dietStartDate"
          name="dietStartDate"
          type="date"
          defaultValue={currentDate}
          required
          className="input-field"
        />
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : "Save"}
      </button>
      {state.success && <span className="text-sm font-medium text-brand-teal">Saved ✅</span>}
      {state.error && <span className="text-sm font-medium text-brand-rose">{state.error}</span>}
    </form>
  );
}
