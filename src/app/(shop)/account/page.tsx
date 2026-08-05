import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Package, Wallet } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { getMyAddresses, getMyOrders, getSession } from "@/lib/queries/account";
import { Button } from "@/components/ui/button";
import { OrderList } from "@/components/account/order-list";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default async function AccountOverviewPage() {
  const [session, orders, addresses] = await Promise.all([
    getSession(),
    getMyOrders(),
    getMyAddresses(),
  ]);

  const lifetimeSpend = orders
    .filter((order) => order.status !== "cancelled" && order.status !== "refunded")
    .reduce((sum, order) => sum + order.total, 0);

  const currency = orders[0]?.currency ?? "XAF";
  const openOrders = orders.filter(
    (order) => !["delivered", "cancelled", "refunded"].includes(order.status),
  ).length;

  const stats = [
    { icon: Package, label: "Orders placed", value: String(orders.length) },
    { icon: Wallet, label: "Lifetime spend", value: formatPrice(lifetimeSpend, currency) },
    { icon: MapPin, label: "Saved addresses", value: String(addresses.length) },
    { icon: Heart, label: "Open orders", value: String(openOrders) },
  ];

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-display text-2xl">
          Welcome back{session?.profile?.full_name ? `, ${session.profile.full_name.split(" ")[0]}` : ""}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything about your orders, addresses and preferences lives here.
        </p>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-border/70 bg-card p-6">
              <dt className="flex items-center gap-2.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <stat.icon className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                {stat.label}
              </dt>
              <dd className="mt-3 font-display text-2xl tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Recent orders</h2>
          {orders.length > 3 ? (
            <Button asChild variant="link">
              <Link href="/account/orders">
                All orders <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : null}
        </div>
        <OrderList orders={orders.slice(0, 3)} />
      </section>

      <section className="rounded-4xl bg-secondary/60 p-8">
        <h2 className="font-display text-xl">Need something we do not stock?</h2>
        <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
          We buy directly from mills in five countries. Send a photograph and we will tell you
          honestly whether we can find it, what it will cost, and how long it will take.
        </p>
        <Button asChild variant="luxe" className="mt-6">
          <Link href="/contact">Ask us to source it</Link>
        </Button>
      </section>
    </div>
  );
}
