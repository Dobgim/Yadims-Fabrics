"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { colorToCss } from "@/components/shop/product-card";

interface ColorPickerProps {
  colors: string[];
  value: string | null;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ colors, value, onChange, label = "Colour" }: ColorPickerProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="flex w-full items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </legend>

      <div className="flex flex-wrap gap-2.5">
        {colors.map((color) => {
          const selected = color === value;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              title={color}
              aria-label={color}
              aria-pressed={selected}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 ease-luxe",
                "hover:scale-110",
                selected
                  ? "border-brand-500 ring-2 ring-brand-500 ring-offset-2 ring-offset-background"
                  : "border-border",
              )}
              style={{ backgroundColor: colorToCss(color) }}
            >
              {selected ? (
                <Check className="h-4 w-4 mix-blend-difference text-white" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
