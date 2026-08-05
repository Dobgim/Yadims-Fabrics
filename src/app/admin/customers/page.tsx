import type { Metadata } from "next";

import { getAdminCustomers, getAdminOrders } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CustomersTable } from "@/components/admin/customers-table";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const [customers, orders] = await Promise.all([getAdminCustomers(), getAdminOrders()]);

  // Order counts and spend are derived here so the table stays presentational.
  const stats = new Map<string, { orders: number; spend: number; currency: string }>();
  for (const order of orders) {
    if (!order.user_id) continue;
    if (order.status === "cancelled" || order.status === "refunded") continue;
    const current = stats.get(order.user_id) ?? { orders: 0, spend: 0, currency: order.currency };
    stats.set(order.user_id, {
      orders: current.orders + 1,
      spend: current.spend + order.total,
      currency: order.currency,
    });
  }

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Customers"
        description="Everyone with an account. Only an admin can change a role, and roles decide who can reach this dashboard."
      />
      <CustomersTable
        customers={customers}
        stats={Object.fromEntries(stats)}
      />
    </div>
  );
}
