import * as Icons from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  hint?: string;
  /** Percentage change vs. the previous period, if known. */
  delta?: number;
  tone?: "default" | "brand" | "gold" | "warning";
}

const toneClass = {
  default: "bg-secondary text-muted-foreground",
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-800/60 dark:text-brand-200",
  gold: "bg-gold-50 text-gold-600 dark:bg-gold-700/25 dark:text-gold-200",
  warning: "bg-destructive/10 text-destructive",
} as const;

export function StatCard({ label, value, icon, hint, delta, tone = "brand" }: StatCardProps) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[icon] ?? Icons.Circle;
  const positive = (delta ?? 0) >= 0;

  return (
    <article className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-2xl", toneClass[tone])}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>

      <p className="mt-4 font-display text-3xl tabular-nums">{value}</p>

      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta !== undefined ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
              positive
                ? "bg-brand-50 text-brand-700 dark:bg-brand-800/60 dark:text-brand-200"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? (
              <Icons.TrendingUp className="h-3 w-3" aria-hidden />
            ) : (
              <Icons.TrendingDown className="h-3 w-3" aria-hidden />
            )}
            {positive ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        ) : null}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </article>
  );
}
