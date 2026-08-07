import Link from "next/link";
import { ArrowRight, PackageX } from "lucide-react";

import { formatDate, formatPrice } from "@/lib/utils";
import { getDashboardMetrics } from "@/lib/queries/admin";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart, StatusBreakdown } from "@/components/admin/revenue-chart";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatPrice(metrics.revenue, metrics.currency)}
          icon="Wallet"
          hint="Excluding cancelled and refunded"
        />
        <StatCard
          label="Orders"
          value={String(metrics.orderCount)}
          icon="ShoppingBag"
          hint={`${metrics.pendingOrders} awaiting action`}
        />
        <StatCard
          label="Customers"
          value={String(metrics.customerCount)}
          icon="Users"
          tone="gold"
        />
        <StatCard
          label="Active products"
          value={String(metrics.productCount)}
          icon="Package"
          hint={`${metrics.lowStock.length} running low`}
          tone={metrics.lowStock.length ? "warning" : "brand"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <RevenueChart data={metrics.revenueByMonth} currency={metrics.currency} />
        <StatusBreakdown data={metrics.statusBreakdown} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent orders */}
        <div className="rounded-3xl border border-border bg-card p-7">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl">Recent orders</h2>
            <Button asChild variant="link">
              <Link href="/admin/orders">
                All orders <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {metrics.recentOrders.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              No orders yet. They will appear here the moment one is placed.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-border">
              {metrics.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.order_number} · {formatDate(order.created_at)} ·{" "}
                      {order.order_items.length}{" "}
                      {order.order_items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                  <span className="w-24 shrink-0 text-right text-sm tabular-nums">
                    {formatPrice(order.total, order.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-3xl border border-border bg-card p-7">
          <h2 className="font-display text-xl">Running low</h2>
          <p className="mt-1 text-sm text-muted-foreground">20 units or fewer on the bolt</p>

          {metrics.lowStock.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-3 py-6 text-center">
              <PackageX className="h-7 w-7 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">Every active line is well stocked.</p>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {metrics.lowStock.map((product) => (
                <li key={product.id} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products?q=${encodeURIComponent(product.name)}`}
                      className="block truncate text-sm font-medium hover:text-brand-600"
                    >
                      {product.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground">{product.material}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium tabular-nums text-destructive">
                    {product.stock_quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Unread messages"
          value={String(metrics.unreadMessages)}
          icon="MessageSquare"
          tone={metrics.unreadMessages ? "warning" : "default"}
        />
        <StatCard
          label="Subscribers"
          value={String(metrics.subscriberCount)}
          icon="Mail"
          tone="gold"
        />
        <StatCard
          label="Awaiting dispatch"
          value={String(metrics.pendingOrders)}
          icon="Truck"
        />
        <StatCard
          label="Average order"
          value={formatPrice(
            metrics.orderCount ? Math.round(metrics.revenue / metrics.orderCount) : 0,
            metrics.currency,
          )}
          icon="TrendingUp"
        />
      </section>
    </div>
  );
}
