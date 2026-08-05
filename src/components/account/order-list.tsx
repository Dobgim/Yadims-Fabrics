import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";

import { cn, formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderStatus } from "@/types/database";
import type { OrderWithItems } from "@/lib/queries/account";

const statusTone: Record<OrderStatus, string> = {
  pending: "bg-secondary text-muted-foreground",
  confirmed: "bg-brand-50 text-brand-700 dark:bg-brand-800/50 dark:text-brand-200",
  processing: "bg-gold-50 text-gold-700 dark:bg-gold-700/25 dark:text-gold-200",
  shipped: "bg-brand-50 text-brand-700 dark:bg-brand-800/50 dark:text-brand-200",
  delivered: "bg-brand-500 text-white",
  cancelled: "bg-secondary text-muted-foreground line-through",
  refunded: "bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium capitalize",
        statusTone[status] ?? statusTone.pending,
      )}
    >
      {status}
    </span>
  );
}

export function OrderList({ orders }: { orders: OrderWithItems[] }) {
  if (!orders.length) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-4xl border border-dashed border-border py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
          <Package className="h-7 w-7 text-brand-500" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="font-display text-2xl">No orders yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When you place an order it appears here with its status and everything we cut for you.
          </p>
        </div>
        <Button asChild variant="luxe">
          <Link href="/shop">Browse fabrics</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-5">
      {orders.map((order) => (
        <li key={order.id} className="rounded-4xl border border-border/70 bg-card p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-xl">{order.order_number}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(order.created_at)} · {order.order_items.length}{" "}
                {order.order_items.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="font-display text-xl tabular-nums">
                {formatPrice(order.total, order.currency)}
              </span>
            </div>
          </div>

          <Separator className="my-5" />

          <ul className="space-y-3">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex items-center gap-4">
                <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {item.product_image_url ? (
                    <Image
                      src={item.product_image_url}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.product_name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.color ? `${item.color} · ` : ""}
                    {item.quantity} × {formatPrice(item.unit_price, order.currency)}
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  {formatPrice(item.line_total, order.currency)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
            <span className="capitalize">
              Payment: {order.payment_method.replace(/_/g, " ")} · {order.payment_status}
            </span>
            <span>
              Delivery {order.shipping_fee === 0 ? "free" : formatPrice(order.shipping_fee, order.currency)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
