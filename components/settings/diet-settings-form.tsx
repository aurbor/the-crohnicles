"use client";

import { useActionState } from "react";
import { updateDietSettings, type SettingsFormState } from "@/lib/settings/actions";

const initialState: SettingsFormState = {};

export function DietSettingsForm({
  currentDate,
  suggestedCalories,
  bmr,
}: {
  currentDate: string;
  suggestedCalories: number | null;
  bmr: number | null;
}) {
  const [state, formAction, pending] = useActionState(updateDietSettings, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
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
        <div>
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor="suggestedCalories">
            Suggested calories / day
          </label>
          <input
            id="suggestedCalories"
            name="suggestedCalories"
            type="number"
            min="1"
            step="1"
            defaultValue={suggestedCalories ?? ""}
            placeholder="e.g. 2000"
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor="bmr">
            BMR (kcal / day)
          </label>
          <input
            id="bmr"
            name="bmr"
            type="number"
            min="1"
            step="1"
            defaultValue={bmr ?? ""}
            placeholder="e.g. 1750"
            className="input-field"
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        Your <strong>target</strong> is what you&rsquo;re aiming to eat — the app warns you once
        you&rsquo;re within 10% of it. <strong>BMR</strong> is what you burn just existing, and is
        used with your logged activity to work out each day&rsquo;s deficit. Leave either blank to
        hide it.
      </p>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary w-fit">
          {pending ? "Saving…" : "Save"}
        </button>
        {state.success && <span className="text-sm font-medium text-brand-teal">Saved ✅</span>}
        {state.error && <span className="text-sm font-medium text-brand-rose">{state.error}</span>}
      </div>
    </form>
  );
}
