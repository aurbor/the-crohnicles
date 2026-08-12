"use client";

import { useActionState, useState } from "react";
import { createItem, updateItem, type ItemFormState } from "@/lib/items/actions";

interface ItemFormProps {
  item?: {
    id: number;
    name: string;
    type: "drink" | "food";
    calories: number;
    protein: number;
    sugar: number;
    unitWeightG: number | null;
  };
  onDone?: () => void;
}

const initialState: ItemFormState = {};

export function ItemForm({ item, onDone }: ItemFormProps) {
  const [type, setType] = useState<"drink" | "food">(item?.type ?? "drink");
  const action = item ? updateItem.bind(null, item.id) : createItem;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isFood = type === "food";

  return (
    <form
      action={async (formData) => {
        await formAction(formData);
        onDone?.();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-muted" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={item?.name}
            required
            placeholder="e.g. Ensure Plus - Vanilla, Winegums"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted" htmlFor="type">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "drink" | "food")}
            className="input-field"
          >
            <option value="drink">Drink (whole-serving values)</option>
            <option value="food">Food (per 100g values)</option>
          </select>
        </div>

        {isFood && (
          <div>
            <label className="mb-1 block text-sm font-medium text-muted" htmlFor="unitWeightG">
              Weight per piece (g)
            </label>
            <input
              id="unitWeightG"
              name="unitWeightG"
              type="number"
              step="0.1"
              min="0.1"
              defaultValue={item?.unitWeightG ?? undefined}
              required
              placeholder="e.g. 5.9"
              className="input-field"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-muted" htmlFor="calories">
            Calories {isFood ? "(per 100g)" : "(per serving)"}
          </label>
          <input
            id="calories"
            name="calories"
            type="number"
            step="0.1"
            min="0"
            defaultValue={item?.calories}
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted" htmlFor="protein">
            Protein g {isFood ? "(per 100g)" : "(per serving)"}
          </label>
          <input
            id="protein"
            name="protein"
            type="number"
            step="0.1"
            min="0"
            defaultValue={item?.protein}
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted" htmlFor="sugar">
            Sugar g {isFood ? "(per 100g)" : "(per serving)"}
          </label>
          <input
            id="sugar"
            name="sugar"
            type="number"
            step="0.1"
            min="0"
            defaultValue={item?.sugar}
            required
            className="input-field"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brand-rose" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : item ? "Save changes" : "Add item"}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
