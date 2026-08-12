"use client";

import { useActionState } from "react";
import {
  createMedication,
  updateMedication,
  type MedicationFormState,
} from "@/lib/medications/actions";

interface MedicationFormProps {
  medication?: {
    id: number;
    name: string;
    form: string;
    unitsPerDose: number;
    strength: string;
  };
  onDone?: () => void;
}

const initialState: MedicationFormState = {};
const COMMON_FORMS = ["tablet", "capsule", "liquid", "injection", "other"];

export function MedicationForm({ medication, onDone }: MedicationFormProps) {
  const action = medication
    ? updateMedication.bind(null, medication.id)
    : createMedication;
  const [state, formAction, pending] = useActionState(action, initialState);

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
            defaultValue={medication?.name}
            required
            placeholder="e.g. Azathioprine"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted" htmlFor="form">
            Form
          </label>
          <input
            id="form"
            name="form"
            list="medication-forms"
            defaultValue={medication?.form}
            required
            placeholder="tablet"
            className="input-field"
          />
          <datalist id="medication-forms">
            {COMMON_FORMS.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted" htmlFor="strength">
            Strength
          </label>
          <input
            id="strength"
            name="strength"
            defaultValue={medication?.strength}
            required
            placeholder="e.g. 50mg"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted" htmlFor="unitsPerDose">
            Standard dose quantity
          </label>
          <input
            id="unitsPerDose"
            name="unitsPerDose"
            type="number"
            step="0.5"
            min="0.5"
            defaultValue={medication?.unitsPerDose}
            required
            placeholder="e.g. 4"
            className="input-field"
          />
          <p className="mt-1 text-xs text-muted">
            e.g. 4 for &ldquo;4x 50mg tablets&rdquo; — this pre-fills the quick-add quantity.
          </p>
        </div>
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brand-rose" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : medication ? "Save changes" : "Add medication"}
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
