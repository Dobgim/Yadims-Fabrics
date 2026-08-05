import type { Metadata } from "next";

import { getAdminOrders } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Orders"
        description="Change a status and the customer sees it in their account immediately. Confirm by WhatsApp before you cut."
      />
      <OrdersTable orders={orders} />
    </div>
  );
}
