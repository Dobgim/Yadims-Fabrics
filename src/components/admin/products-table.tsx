"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/data-table";
import type { ProductRow, ProductStatus } from "@/types/database";

const statusTone: Record<ProductStatus, string> = {
  active: "bg-brand-50 text-brand-700 dark:bg-brand-800/60 dark:text-brand-200",
  draft: "bg-secondary text-muted-foreground",
  archived: "bg-destructive/10 text-destructive",
};

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const columns: Column<ProductRow>[] = [
    {
      key: "name",
      header: "Product",
      value: (p) => p.name,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <span className="relative h-11 w-10 shrink-0 overflow-hidden rounded-xl bg-muted">
            {p.images[0] ? (
              <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block max-w-[16rem] truncate font-medium">{p.name}</span>
            <span className="block text-xs text-muted-foreground">{p.sku}</span>
          </span>
        </div>
      ),
    },
    { key: "material", header: "Material", value: (p) => p.material ?? "" },
    {
      key: "price",
      header: "Price",
      align: "right",
      value: (p) => p.price,
      cell: (p) => (
        <span className="tabular-nums">{formatPrice(p.price, p.currency)}</span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      value: (p) => p.stock_quantity,
      cell: (p) => (
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
            p.stock_quantity === 0
              ? "bg-destructive/10 text-destructive"
              : p.stock_quantity <= 20
                ? "bg-gold-50 text-gold-700 dark:bg-gold-700/25 dark:text-gold-200"
                : "bg-secondary text-muted-foreground",
          )}
        >
          {p.stock_quantity}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      value: (p) => p.status,
      cell: (p) => (
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
            statusTone[p.status],
          )}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (p) => (
        <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${p.name} on the site`}>
          <Link href={`/shop/${p.slug}`} target="_blank">
            <ExternalLink />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      rows={products}
      columns={columns}
      rowKey={(p) => p.id}
      searchPlaceholder="Search products, SKU, material"
      emptyMessage="No products yet. Add your first bolt to get started."
      toolbar={
        <Button variant="luxe" size="sm">
          <Plus /> New product
        </Button>
      }
    />
  );
}
