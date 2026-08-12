"use client";

export function QuantityStepper({
  value,
  onChange,
  step = 1,
  min = 0.5,
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, round(value - step)))}
        className="btn-secondary h-10 w-10 !p-0 text-lg leading-none"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input-field w-20 text-center"
      />
      <button
        type="button"
        onClick={() => onChange(round(value + step))}
        className="btn-secondary h-10 w-10 !p-0 text-lg leading-none"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
