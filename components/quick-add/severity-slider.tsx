"use client";

import * as Slider from "@radix-ui/react-slider";

const LABELS = ["None", "Mild", "Noticeable", "Uncomfortable", "Bad", "Severe"];

export function SeveritySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-muted">Pain / bloating</span>
        <span className="font-semibold text-brand-violet">{LABELS[value]}</span>
      </div>
      <Slider.Root
        className="relative flex h-5 w-full touch-none items-center"
        min={0}
        max={5}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-brand-violet/15">
          <Slider.Range className="brand-gradient absolute h-full rounded-full" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-brand-violet bg-card shadow focus:outline-none" />
      </Slider.Root>
    </div>
  );
}
