"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { cn, formatDate } from "@/lib/utils";
import { setSubscriberActive } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataTable, type Column } from "@/components/admin/data-table";
import type { NewsletterRow } from "@/types/database";

export function SubscribersTable({ subscribers }: { subscribers: NewsletterRow[] }) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const toggle = async (id: string, isActive: boolean) => {
    setPendingId(id);
    const result = await setSubscriberActive(id, isActive);
    setPendingId(null);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  /** Exports active subscribers as CSV, entirely client-side. */
  const exportCsv = () => {
    const active = subscribers.filter((s) => s.is_active);
    if (!active.length) {
      toast.error("No active subscribers to export.");
      return;
    }

    const rows = [
      ["email", "source", "subscribed_at"],
      ...active.map((s) => [s.email, s.source, s.created_at]),
    ];
    // Quote every field so commas inside a value cannot break the columns.
    const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `yadims-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${active.length} subscribers.`);
  };

  const columns: Column<NewsletterRow>[] = [
    { key: "email", header: "Email", value: (s) => s.email },
    {
      key: "source",
      header: "Source",
      value: (s) => s.source,
      cell: (s) => (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
          {s.source}
        </span>
      ),
    },
    {
      key: "created",
      header: "Subscribed",
      value: (s) => s.created_at,
      cell: (s) => (
        <span className="text-sm text-muted-foreground">{formatDate(s.created_at)}</span>
      ),
    },
    {
      key: "active",
      header: "Active",
      align: "right",
      value: (s) => (s.is_active ? 1 : 0),
      cell: (s) => (
        <Switch
          checked={s.is_active}
          disabled={pendingId === s.id}
          onCheckedChange={(value) => toggle(s.id, value)}
          aria-label={`Subscription status for ${s.email}`}
          className={cn(!s.is_active && "opacity-60")}
        />
      ),
    },
  ];

  return (
    <DataTable
      rows={subscribers}
      columns={columns}
      rowKey={(s) => s.id}
      searchPlaceholder="Search email or source"
      emptyMessage="No subscribers yet."
      toolbar={
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download /> Export CSV
        </Button>
      }
    />
  );
}
