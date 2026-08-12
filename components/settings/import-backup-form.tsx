"use client";

import { useActionState, useRef } from "react";
import { importBackup, type SettingsFormState } from "@/lib/settings/actions";

const initialState: SettingsFormState = {};

export function ImportBackupForm() {
  const [state, formAction, pending] = useActionState(importBackup, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            "This replaces ALL current data with the contents of the backup file. This can't be undone. Continue?"
          )
        ) {
          e.preventDefault();
        }
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-muted" htmlFor="file">
          Backup JSON file
        </label>
        <input id="file" name="file" type="file" accept="application/json" required className="input-field" />
      </div>
      <button type="submit" disabled={pending} className="btn-secondary text-brand-rose">
        {pending ? "Importing…" : "Import & replace all data"}
      </button>
      {state.success && <span className="text-sm font-medium text-brand-teal">Imported ✅</span>}
      {state.error && <span className="text-sm font-medium text-brand-rose">{state.error}</span>}
    </form>
  );
}
