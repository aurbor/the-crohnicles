"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createActivityEntry, type ActivityFormState } from "@/lib/activity/actions";
import {
  ACTIVITY_LABELS,
  ACTIVITY_TYPES,
  estimateCaloriesBurned,
  type ActivityType,
} from "@/lib/activity/estimate";

const initialState: ActivityFormState = {};

export function ActivityInlineAdd({
  date,
  bodyWeightKg,
}: {
  date: string;
  bodyWeightKg: number | null;
}) {
  const [type, setType] = useState<ActivityType>("walking");
  const [distance, setDistance] = useState("");
  const [state, formAction, pending] = useActionState(createActivityEntry, initialState);

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.success) setDistance("");
  }

  const miles = Number(distance);
  const estimate =
    distance !== "" && Number.isFinite(miles) && miles > 0
      ? estimateCaloriesBurned(type, miles, bodyWeightKg)
      : null;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="date" value={date} />
      {/* Stacked rather than one row: this sits in a narrow sidebar column, and
          `.input-field` forces width:100%, so three controls abreast overflow. */}
      <select
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value as ActivityType)}
        aria-label="Activity type"
        className="input-field"
      >
        {ACTIVITY_TYPES.map((option) => (
          <option key={option} value={option}>
            {ACTIVITY_LABELS[option]}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          name="distanceMiles"
          type="number"
          step="any"
          min="0.01"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          required
          aria-label="Distance in miles"
          placeholder="Miles, e.g. 3.1"
          className="input-field"
        />
        <button type="submit" disabled={pending} className="btn-primary shrink-0 !px-5">
          {pending ? "…" : "Add"}
        </button>
      </div>

      {estimate !== null && (
        <p className="text-xs text-muted">
          ≈ <span className="font-semibold text-brand-teal">{estimate} kcal</span> burned
          {bodyWeightKg ? ` at ${bodyWeightKg} kg` : " — log a weigh-in for a better estimate"}
        </p>
      )}
      {state.error && (
        <p className="text-xs font-medium text-brand-rose" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
