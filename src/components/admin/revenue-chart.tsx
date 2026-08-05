import { formatPrice } from "@/lib/utils";

interface RevenueChartProps {
  data: { month: string; revenue: number; orders: number }[];
  currency: string;
}

/**
 * Six-month revenue bars, drawn with plain CSS rather than a charting library
 * — the shape is simple enough that a dependency would cost more than it earns.
 */
export function RevenueChart({ data, currency }: RevenueChartProps) {
  const peak = Math.max(...data.map((d) => d.revenue), 1);
  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <section className="rounded-3xl border border-border bg-card p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Revenue</h2>
          <p className="mt-1 text-sm text-muted-foreground">Last six months</p>
        </div>
        <p className="font-display text-2xl tabular-nums">{formatPrice(total, currency)}</p>
      </div>

      <div className="mt-9 flex h-52 items-end gap-3" role="img" aria-label="Monthly revenue chart">
        {data.map((month) => {
          const height = Math.max(2, (month.revenue / peak) * 100);
          return (
            <div key={month.month} className="group flex flex-1 flex-col items-center gap-3">
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-xl bg-brand-500/85 transition-all duration-700 ease-luxe group-hover:bg-brand-500"
                  style={{ height: `${height}%` }}
                />
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-900 px-2.5 py-1.5 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {formatPrice(month.revenue, currency)} · {month.orders}{" "}
                  {month.orders === 1 ? "order" : "orders"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{month.month}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function StatusBreakdown({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0) || 1;

  return (
    <section className="rounded-3xl border border-border bg-card p-7">
      <h2 className="font-display text-xl">Orders by status</h2>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="mt-7 space-y-4">
          {data.map((entry) => (
            <li key={entry.status}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="capitalize">{entry.status}</span>
                <span className="tabular-nums text-muted-foreground">{entry.count}</span>
              </div>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-secondary">
                <span
                  className="block h-full rounded-full bg-gold-400"
                  style={{ width: `${(entry.count / total) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
