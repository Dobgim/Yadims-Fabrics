"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  unit,
  className,
}: QuantityStepperProps) {
  const clamp = (next: number) => Math.min(Math.max(next, min), max);

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-full border border-border bg-background",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="grid h-11 w-10 place-items-center rounded-l-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        aria-label={unit ? `Quantity in ${unit}s` : "Quantity"}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (!Number.isNaN(next)) onChange(clamp(next));
        }}
        className="w-10 border-0 bg-transparent p-0 text-center text-sm font-medium tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="grid h-11 w-10 place-items-center rounded-r-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
