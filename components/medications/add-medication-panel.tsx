"use client";

import { useState } from "react";
import { MedicationForm } from "./medication-form";

export function AddMedicationPanel() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Add medication
      </button>
    );
  }

  return (
    <div className="card p-4">
      <h2 className="mb-3 text-lg font-bold">New medication</h2>
      <MedicationForm onDone={() => setOpen(false)} />
    </div>
  );
}
