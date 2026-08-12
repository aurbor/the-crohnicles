"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createMedicationEntry,
  type MedicationEntryFormState,
} from "@/lib/medication-entries/actions";
import { nowForDatetimeLocal } from "@/lib/datetime";
import { QuantityStepper } from "./quantity-stepper";

export interface MedicationOption {
  id: number;
  name: string;
  form: string;
  strength: string;
  unitsPerDose: number;
}

const initialState: MedicationEntryFormState = {};

export function MedicationQuickAdd({ medications }: { medications: MedicationOption[] }) {
  const [occurredAt, setOccurredAt] = useState(nowForDatetimeLocal());
  const [medicationId, setMedicationId] = useState<string>(
    medications[0]?.id.toString() ?? ""
  );
  const [quantity, setQuantity] = useState(medications[0]?.unitsPerDose ?? 1);
  const [notes, setNotes] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const [state, formAction, pending] = useActionState(createMedicationEntry, initialState);

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.success) {
      setNotes("");
      setOccurredAt(nowForDatetimeLocal());
      const med = medications.find((m) => m.id.toString() === medicationId);
      setQuantity(med?.unitsPerDose ?? 1);
      setJustAdded(true);
    }
  }

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(t);
  }, [justAdded]);

  function handleMedicationChange(id: string) {
    setMedicationId(id);
    const med = medications.find((m) => m.id.toString() === id);
    if (med) setQuantity(med.unitsPerDose);
  }

  if (medications.length === 0) {
    return (
      <p className="text-sm text-muted">
        No medications set up yet — add some in the Meds tab first.
      </p>
    );
  }

  const selectedMedication = medications.find((m) => m.id.toString() === medicationId);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="med-occurredAt">
          When
        </label>
        <input
          id="med-occurredAt"
          name="occurredAt"
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="medicationId">
          Which medication
        </label>
        <select
          id="medicationId"
          name="medicationId"
          value={medicationId}
          onChange={(e) => handleMedicationChange(e.target.value)}
          className="input-field"
        >
          {medications.map((med) => (
            <option key={med.id} value={med.id}>
              {med.name} ({med.strength} {med.form})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted">
          Quantity {selectedMedication ? `(usually ${selectedMedication.unitsPerDose})` : ""}
        </label>
        <input type="hidden" name="quantity" value={quantity} />
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="med-notes">
          Notes <span className="font-normal">(optional)</span>
        </label>
        <textarea
          id="med-notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="input-field"
        />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brand-rose" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Logging…" : justAdded ? "Added! ✅" : "Log dose"}
      </button>
    </form>
  );
}
