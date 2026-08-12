"use client";

import { useState } from "react";
import { ItemForm } from "./item-form";

export function AddItemPanel() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Add item
      </button>
    );
  }

  return (
    <div className="card p-4">
      <h2 className="mb-3 text-lg font-bold">New item</h2>
      <ItemForm onDone={() => setOpen(false)} />
    </div>
  );
}
