"use client";

import { useActionState, useState } from "react";
import { createWeightEntry, type WeightFormState } from "@/lib/weight/actions";
import { todayForDateInput } from "@/lib/datetime";

const initialState: WeightFormState = {};

export function WeightQuickAdd() {
  const [date, setDate] = useState(todayForDateInput());
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [state, formAction, pending] = useActionState(createWeightEntry, initialState);

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.success) {
      setWeight("");
      setNotes("");
      setDate(todayForDateInput());
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor="weight-date">
            Date
          </label>
          <input
            id="weight-date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor="weightKg">
            Weight (kg)
          </label>
          <input
            id="weightKg"
            name="weightKg"
            type="number"
            step="0.1"
            min="1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            placeholder="e.g. 72.4"
            className="input-field"
          />
        </div>
      </div>
      <input
        name="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="input-field"
      />
      {state.error && (
        <p className="text-sm font-medium text-brand-rose" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-fit">
        {pending ? "Saving…" : "Log weight"}
      </button>
    </form>
  );
}
