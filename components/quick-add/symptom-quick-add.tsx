"use client";

import { useActionState, useEffect, useState } from "react";
import { createSymptomEntry, type SymptomEntryFormState } from "@/lib/symptoms/actions";
import { nowForDatetimeLocal } from "@/lib/datetime";
import { BristolPicker } from "./bristol-picker";
import { SeveritySlider } from "./severity-slider";

const initialState: SymptomEntryFormState = {};

export function SymptomQuickAdd() {
  const [occurredAt, setOccurredAt] = useState(nowForDatetimeLocal());
  const [bristol, setBristol] = useState<number | null>(null);
  const [severity, setSeverity] = useState(0);
  const [notes, setNotes] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const [state, formAction, pending] = useActionState(createSymptomEntry, initialState);

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.success) {
      setBristol(null);
      setSeverity(0);
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

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="symptom-occurredAt">
          When
        </label>
        <input
          id="symptom-occurredAt"
          name="occurredAt"
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          required
          className="input-field"
        />
      </div>

      <div>
        <input type="hidden" name="bristolScale" value={bristol ?? ""} />
        <BristolPicker value={bristol} onChange={setBristol} />
      </div>

      <div>
        <input type="hidden" name="severity" value={severity} />
        <SeveritySlider value={severity} onChange={setSeverity} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-muted" htmlFor="symptom-notes">
          Notes <span className="font-normal">(optional)</span>
        </label>
        <textarea
          id="symptom-notes"
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
        {pending ? "Logging…" : justAdded ? "Added! ✅" : "Log symptom"}
      </button>
    </form>
  );
}
