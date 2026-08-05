"use client";

import * as React from "react";
import { toast } from "sonner";

import { formatDate, formatPrice } from "@/lib/utils";
import { updateOrderStatus } from "@/app/actions/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/admin/data-table";
import { OrderStatusBadge } from "@/components/account/order-list";
import type { AdminOrder } from "@/lib/queries/admin";
import type { OrderStatus } from "@/types/database";

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const changeStatus = async (orderId: string, status: OrderStatus) => {
    setPendingId(orderId);
    const result = await updateOrderStatus(orderId, status);
    setPendingId(null);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  const columns: Column<AdminOrder>[] = [
    {
      key: "order",
      header: "Order",
      value: (o) => o.order_number,
      cell: (o) => (
        <div>
          <p className="font-medium">{o.order_number}</p>
          <p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      value: (o) => `${o.customer_name} ${o.customer_email}`,
      cell: (o) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{o.customer_name}</p>
          <p className="truncate text-xs text-muted-foreground">{o.customer_email}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      align: "right",
      value: (o) => o.order_items.length,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      value: (o) => o.total,
      cell: (o) => (
        <span className="font-medium tabular-nums">{formatPrice(o.total, o.currency)}</span>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      value: (o) => o.payment_status,
      cell: (o) => (
        <span className="text-xs capitalize text-muted-foreground">
          {o.payment_method.replace(/_/g, " ")} · {o.payment_status}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      value: (o) => o.status,
      cell: (o) => (
        <Select
          value={o.status}
          disabled={pendingId === o.id}
          onValueChange={(value) => changeStatus(o.id, value as OrderStatus)}
        >
          <SelectTrigger className="h-9 w-[9.5rem]" aria-label={`Status for ${o.order_number}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <DataTable
      rows={orders}
      columns={columns}
      rowKey={(o) => o.id}
      searchPlaceholder="Search order number, customer, email"
      emptyMessage="No orders yet."
    />
  );
}

export { OrderStatusBadge };
