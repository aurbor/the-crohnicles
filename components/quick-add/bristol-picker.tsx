"use client";

const BRISTOL_TYPES = [
  { value: 1, label: "Hard lumps" },
  { value: 2, label: "Lumpy sausage" },
  { value: 3, label: "Cracked sausage" },
  { value: 4, label: "Smooth sausage" },
  { value: 5, label: "Soft blobs" },
  { value: 6, label: "Mushy" },
  { value: 7, label: "Liquid" },
] as const;

export function BristolPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {BRISTOL_TYPES.map((type) => {
        const selected = value === type.value;
        return (
          <button
            key={type.value}
            type="button"
            title={type.label}
            onClick={() => onChange(selected ? null : type.value)}
            className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs transition-colors ${
              selected
                ? "border-brand-violet bg-brand-violet/15 font-bold text-brand-violet"
                : "border-card-border bg-card text-muted hover:bg-brand-violet/5"
            }`}
          >
            <span className="text-base font-bold">{type.value}</span>
          </button>
        );
      })}
      <p className="col-span-7 mt-0.5 text-center text-xs text-muted">
        {value ? BRISTOL_TYPES.find((t) => t.value === value)?.label : "Bristol Stool Scale (optional)"}
      </p>
    </div>
  );
}
