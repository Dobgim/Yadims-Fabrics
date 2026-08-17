"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { deleteProduct } from "@/app/actions/catalogue";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/form-kit";
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
        // The whole cell is the edit affordance — it is the widest target in
        // the row and the only thing anyone reaches for.
        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 group">
          <span className="relative h-11 w-10 shrink-0 overflow-hidden rounded-xl bg-muted">
            {p.images[0] ? (
              <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="flex max-w-[16rem] items-center gap-1.5 truncate font-medium group-hover:text-brand-600">
              <span className="truncate">{p.name}</span>
              {p.is_preorder ? (
                <span className="shrink-0 rounded-full bg-gold-100 px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide text-gold-700 dark:bg-gold-700/25 dark:text-gold-200">
                  Pre-order
                </span>
              ) : null}
            </span>
            <span className="block text-xs text-muted-foreground">{p.sku ?? "No SKU"}</span>
          </span>
        </Link>
      ),
    },
    { key: "material", header: "Material", value: (p) => p.material ?? "" },
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
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${p.name}`}>
            <Link href={`/admin/products/${p.id}`}>
              <Pencil />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${p.name} on the site`}>
            <Link href={`/shop/${p.slug}`} target="_blank">
              <ExternalLink />
            </Link>
          </Button>
          <DeleteButton
            action={deleteProduct}
            id={p.id}
            entity="fabric"
            name={p.name}
            size="icon-sm"
          >
            <Trash2 />
          </DeleteButton>
        </div>
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
        <Button asChild variant="luxe" size="sm">
          <Link href="/admin/products/new">
            <Plus /> New product
          </Link>
        </Button>
      }
    />
  );
}
