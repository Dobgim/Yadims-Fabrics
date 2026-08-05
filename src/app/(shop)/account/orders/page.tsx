import type { Metadata } from "next";

import { getMyOrders } from "@/lib/queries/account";
import { OrderList } from "@/components/account/order-list";

export const metadata: Metadata = {
  title: "Order History",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  const orders = await getMyOrders();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl">Order history</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every order you have placed with us, newest first. Statuses update as we cut, pack and
          dispatch.
        </p>
      </div>

      <OrderList orders={orders} />
    </div>
  );
}
