"use client";

import * as React from "react";
import { toast } from "sonner";

import { formatDate, formatPrice, initialsOf } from "@/lib/utils";
import { updateCustomerRole } from "@/app/actions/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/admin/data-table";
import type { ProfileRow, UserRole } from "@/types/database";

interface CustomerStat {
  orders: number;
  spend: number;
  currency: string;
}

interface CustomersTableProps {
  customers: ProfileRow[];
  stats: Record<string, CustomerStat>;
}

export function CustomersTable({ customers, stats }: CustomersTableProps) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const changeRole = async (userId: string, role: UserRole) => {
    setPendingId(userId);
    const result = await updateCustomerRole(userId, role);
    setPendingId(null);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  const columns: Column<ProfileRow>[] = [
    {
      key: "name",
      header: "Customer",
      value: (c) => `${c.full_name ?? ""} ${c.email}`,
      cell: (c) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={c.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="bg-brand-700 text-xs text-white">
              {initialsOf(c.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{c.full_name ?? "—"}</p>
            <p className="truncate text-xs text-muted-foreground">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", value: (c) => c.phone ?? "—" },
    {
      key: "orders",
      header: "Orders",
      align: "right",
      value: (c) => stats[c.id]?.orders ?? 0,
    },
    {
      key: "spend",
      header: "Spend",
      align: "right",
      value: (c) => stats[c.id]?.spend ?? 0,
      cell: (c) => {
        const stat = stats[c.id];
        return (
          <span className="tabular-nums">
            {stat ? formatPrice(stat.spend, stat.currency) : "—"}
          </span>
        );
      },
    },
    {
      key: "joined",
      header: "Joined",
      value: (c) => c.created_at,
      cell: (c) => (
        <span className="text-sm text-muted-foreground">{formatDate(c.created_at)}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      value: (c) => c.role,
      cell: (c) => (
        <Select
          value={c.role}
          disabled={pendingId === c.id}
          onValueChange={(value) => changeRole(c.id, value as UserRole)}
        >
          <SelectTrigger
            className="h-9 w-32"
            aria-label={`Role for ${c.full_name ?? c.email}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <DataTable
      rows={customers}
      columns={columns}
      rowKey={(c) => c.id}
      searchPlaceholder="Search name, email, phone"
      emptyMessage="No customer accounts yet."
    />
  );
}
