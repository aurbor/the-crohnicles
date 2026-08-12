"use client";

import { useState, useTransition } from "react";
import { setItemArchived, deleteItem } from "@/lib/items/actions";
import { ItemForm } from "./item-form";

export interface ItemRow {
  id: number;
  name: string;
  type: "drink" | "food";
  calories: number;
  protein: number;
  sugar: number;
  unitWeightG: number | null;
  archived: boolean;
  hasEntries: boolean;
}

export function ItemList({ items }: { items: ItemRow[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const visible = items.filter((i) => showArchived || !i.archived);
  const drinks = visible.filter((i) => i.type === "drink");
  const foods = visible.filter((i) => i.type === "food");

  function renderRow(item: ItemRow) {
    if (editingId === item.id) {
      return (
        <div key={item.id} className="card p-4">
          <ItemForm item={item} onDone={() => setEditingId(null)} />
        </div>
      );
    }

    const isFood = item.type === "food";
    return (
      <div
        key={item.id}
        className={`card flex flex-wrap items-center justify-between gap-3 p-4 ${
          item.archived ? "opacity-50" : ""
        }`}
      >
        <div>
          <p className="font-semibold">
            {item.name}
            {item.archived && (
              <span className="ml-2 rounded-full bg-muted/20 px-2 py-0.5 text-xs font-medium text-muted">
                archived
              </span>
            )}
          </p>
          <p className="text-sm text-muted">
            {item.calories} kcal · {item.protein}g protein · {item.sugar}g sugar{" "}
            {isFood ? `per 100g (${item.unitWeightG}g/piece)` : "per serving"}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs" onClick={() => setEditingId(item.id)}>
            Edit
          </button>
          <button
            className="btn-secondary text-xs"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setItemArchived(item.id, !item.archived);
              })
            }
          >
            {item.archived ? "Restore" : "Archive"}
          </button>
          {!item.hasEntries && (
            <button
              className="btn-secondary text-xs text-brand-rose"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  try {
                    await deleteItem(item.id);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Failed to delete");
                  }
                })
              }
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm font-medium text-brand-rose">{error}</p>}

      <div>
        <h2 className="mb-2 text-lg font-bold">🥤 Drinks</h2>
        <div className="flex flex-col gap-2">
          {drinks.length === 0 && <p className="text-sm text-muted">No drinks yet.</p>}
          {drinks.map(renderRow)}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-bold">🍬 Food</h2>
        <div className="flex flex-col gap-2">
          {foods.length === 0 && <p className="text-sm text-muted">No food items yet.</p>}
          {foods.map(renderRow)}
        </div>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
        />
        Show archived items
      </label>
    </div>
  );
}
