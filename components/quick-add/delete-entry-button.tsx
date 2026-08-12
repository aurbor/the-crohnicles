"use client";

import { useTransition } from "react";

export function DeleteEntryButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => action())}
      className="text-xs font-medium text-muted hover:text-brand-rose"
      aria-label="Delete entry"
    >
      ✕
    </button>
  );
}
