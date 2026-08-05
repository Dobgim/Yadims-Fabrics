"use client";

import * as React from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ShopPagination } from "@/components/shop/shop-pagination";
import type { ProductRow } from "@/types/database";

interface ShopResultsProps {
  products: ProductRow[];
  total: number;
  page: number;
  pageCount: number;
  /** Rendered inside the toolbar — the mobile filter trigger. */
  filterTrigger?: React.ReactNode;
}

export function ShopResults({
  products,
  total,
  page,
  pageCount,
  filterTrigger,
}: ShopResultsProps) {
  const [view, setView] = React.useState<"grid" | "list">("grid");

  return (
    <div className="min-w-0 flex-1 space-y-10">
      <ShopToolbar total={total} view={view} onViewChange={setView}>
        {filterTrigger}
      </ShopToolbar>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-5 rounded-4xl border border-dashed border-border py-24 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
            <PackageSearch className="h-7 w-7 text-brand-500" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="font-display text-2xl">Nothing matches those filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try widening the price range or clearing a colour. If you know what you need and
              cannot find it, message us — we source specially.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/shop">Clear filters</Link>
            </Button>
            <Button asChild variant="luxe">
              <Link href="/contact">Ask us to source it</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ProductGrid
            key={`${view}-${page}`}
            products={products}
            view={view}
            columns={3}
            priorityCount={3}
          />
          <ShopPagination page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}
