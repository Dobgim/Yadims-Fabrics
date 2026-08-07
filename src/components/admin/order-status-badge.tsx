import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

const statusTone: Record<OrderStatus, string> = {
  pending: "bg-secondary text-muted-foreground",
  confirmed: "bg-brand-50 text-brand-700 dark:bg-brand-800/50 dark:text-brand-200",
  processing: "bg-gold-50 text-gold-700 dark:bg-gold-700/25 dark:text-gold-200",
  shipped: "bg-brand-50 text-brand-700 dark:bg-brand-800/50 dark:text-brand-200",
  delivered: "bg-brand-500 text-white",
  cancelled: "bg-secondary text-muted-foreground line-through",
  refunded: "bg-destructive/10 text-destructive",
};

/** The one shared piece of the old customer order list the dashboard still needs. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        statusTone[status],
      )}
    >
      {status}
    </span>
  );
}
