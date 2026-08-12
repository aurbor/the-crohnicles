"use client";

import { useActionState, useEffect, useState } from "react";
import { createDiaryEntry, type DiaryEntryFormState } from "@/lib/diary/actions";
import { nowForDatetimeLocal } from "@/lib/datetime";
import { totalNutrition, round1 } from "@/lib/nutrition";
import { QuantityStepper } from "./quantity-stepper";
import { MoodPicker, type Mood } from "./mood-picker";

export interface DiaryItemOption {
  id: number;
  name: string;
  type: "drink" | "food";
  basis: "per_serving" | "per_100g";
  calories: number;
  protein: number;
  sugar: number;
  unitWeightG: number | null;
}

const initialState: DiaryEntryFormState = {};

export function DiaryQuickAdd({ items }: { items: DiaryItemOption[] }) {
  const drinks = items.filter((i) => i.type === "drink");
  const foods = items.filter((i) => i.type === "food");

  const [occurredAt, setOccurredAt] = useState(nowForDatetimeLocal());
  const [itemId, setItemId] = useState<string>(items[0]?.id.toString() ?? "");
  const [quantity, setQuantity] = useState(1);
  const [mood, setMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const [state, formAction, pending] = useActionState(createDiaryEntry, initialState);

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.success) {
      setQuantity(1);
      setMood(null);
      setNotes("");
      setOccurredAt(nowForDatetimeLocal());
      setJustAdded(true);
    }
  }

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(t);
  }, [justAdded]);

  const selectedItem = items.find((i) => i.id.toString() === itemId);
  const preview = selectedItem ? totalNutrition(selectedItem, quantity) : null;

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        No drinks or food set up yet — add some in the Items tab first.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="occurredAt">
          When
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="itemId">
          What
        </label>
        <select
          id="itemId"
          name="itemId"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="input-field"
        >
          {drinks.length > 0 && (
            <optgroup label="Drinks">
              {drinks.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </optgroup>
          )}
          {foods.length > 0 && (
            <optgroup label="Food">
              {foods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted">
          How many {selectedItem?.type === "food" ? "pieces" : ""}
        </label>
        <input type="hidden" name="quantity" value={quantity} />
        <QuantityStepper value={quantity} onChange={setQuantity} step={selectedItem?.type === "food" ? 1 : 0.5} />
      </div>

      {preview && (
        <p className="text-xs text-muted">
          ≈ {round1(preview.calories)} kcal · {round1(preview.protein)}g protein ·{" "}
          {round1(preview.sugar)}g sugar
        </p>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-muted">
          How are you feeling? <span className="font-normal">(optional)</span>
        </label>
        <input type="hidden" name="mood" value={mood ?? ""} />
        <MoodPicker value={mood} onChange={setMood} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="notes">
          Notes <span className="font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Tasted like regret, but the good kind…"
          className="input-field"
        />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brand-rose" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Logging…" : justAdded ? "Added! ✅" : "Log it"}
      </button>
    </form>
  );
}
