import type { Metadata } from "next";

import { formatPrice } from "@/lib/utils";
import { getAdminOrders, getAdminProducts, getDashboardMetrics } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart, StatusBreakdown } from "@/components/admin/revenue-chart";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const [metrics, orders, products] = await Promise.all([
    getDashboardMetrics(),
    getAdminOrders(),
    getAdminProducts(),
  ]);

  // Units sold per product, aggregated across every non-cancelled order.
  const unitsByProduct = new Map<string, { name: string; units: number; revenue: number }>();
  for (const order of orders) {
    if (order.status === "cancelled" || order.status === "refunded") continue;
    for (const item of order.order_items) {
      const key = item.product_id ?? item.product_name;
      const current = unitsByProduct.get(key) ?? { name: item.product_name, units: 0, revenue: 0 };
      unitsByProduct.set(key, {
        name: item.product_name,
        units: current.units + item.quantity,
        revenue: current.revenue + item.line_total,
      });
    }
  }

  const topProducts = [...unitsByProduct.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const billable = orders.filter(
    (o) => o.status !== "cancelled" && o.status !== "refunded",
  );
  const averageOrder = billable.length
    ? Math.round(billable.reduce((sum, o) => sum + o.total, 0) / billable.length)
    : 0;

  const stockValue = products.reduce((sum, p) => sum + p.price * p.stock_quantity, 0);

  const conversionNote =
    orders.length === 0
      ? "No orders yet"
      : `${((billable.length / orders.length) * 100).toFixed(0)}% of orders completed`;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analytics"
        description="Everything here is computed from your own order records — no third-party tracking is used anywhere on this site."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatPrice(metrics.revenue, metrics.currency)}
          icon="Wallet"
        />
        <StatCard
          label="Average order"
          value={formatPrice(averageOrder, metrics.currency)}
          icon="Receipt"
          tone="gold"
        />
        <StatCard
          label="Stock at retail"
          value={formatPrice(stockValue, metrics.currency)}
          icon="Boxes"
          hint="Across every active bolt"
        />
        <StatCard
          label="Completion"
          value={`${billable.length}/${orders.length}`}
          icon="CircleCheck"
          hint={conversionNote}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <RevenueChart data={metrics.revenueByMonth} currency={metrics.currency} />
        <StatusBreakdown data={metrics.statusBreakdown} />
      </section>

      <section className="rounded-3xl border border-border bg-card p-7">
        <h2 className="font-display text-xl">Fabrics by revenue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Which bolts actually pay for the shelf they sit on.
        </p>

        {topProducts.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            No sales recorded yet. This fills in as orders come through.
          </p>
        ) : (
          <ol className="mt-7 space-y-5">
            {topProducts.map((product, i) => {
              const peak = topProducts[0].revenue || 1;
              return (
                <li key={product.name}>
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="mr-3 tabular-nums text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {product.name}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatPrice(product.revenue, metrics.currency)}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {product.units} units
                      </span>
                    </span>
                  </div>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full bg-brand-500"
                      style={{ width: `${(product.revenue / peak) * 100}%` }}
                    />
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
