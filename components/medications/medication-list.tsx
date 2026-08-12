"use client";

import { useState, useTransition } from "react";
import { setMedicationArchived, deleteMedication } from "@/lib/medications/actions";
import { MedicationForm } from "./medication-form";

export interface MedicationRow {
  id: number;
  name: string;
  form: string;
  unitsPerDose: number;
  strength: string;
  archived: boolean;
  hasEntries: boolean;
}

export function MedicationList({ medications }: { medications: MedicationRow[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const visible = medications.filter((m) => showArchived || !m.archived);

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm font-medium text-brand-rose">{error}</p>}

      {visible.length === 0 && <p className="text-sm text-muted">No medications yet.</p>}

      {visible.map((med) => {
        if (editingId === med.id) {
          return (
            <div key={med.id} className="card p-4">
              <MedicationForm medication={med} onDone={() => setEditingId(null)} />
            </div>
          );
        }

        return (
          <div
            key={med.id}
            className={`card flex flex-wrap items-center justify-between gap-3 p-4 ${
              med.archived ? "opacity-50" : ""
            }`}
          >
            <div>
              <p className="font-semibold">
                {med.name}
                {med.archived && (
                  <span className="ml-2 rounded-full bg-muted/20 px-2 py-0.5 text-xs font-medium text-muted">
                    archived
                  </span>
                )}
              </p>
              <p className="text-sm text-muted">
                {med.unitsPerDose}x {med.strength} {med.form}
                {med.unitsPerDose !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs" onClick={() => setEditingId(med.id)}>
                Edit
              </button>
              <button
                className="btn-secondary text-xs"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await setMedicationArchived(med.id, !med.archived);
                  })
                }
              >
                {med.archived ? "Restore" : "Archive"}
              </button>
              {!med.hasEntries && (
                <button
                  className="btn-secondary text-xs text-brand-rose"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      setError(null);
                      try {
                        await deleteMedication(med.id);
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
      })}

      <label className="flex w-fit items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
        />
        Show archived medications
      </label>
    </div>
  );
}
