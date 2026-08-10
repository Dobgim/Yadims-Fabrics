"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGrid } from "@/components/shop/product-grid";
import { useStore } from "@/components/providers/store-provider";
import type { ProductRow } from "@/types/database";

export function WishlistView({ products }: { products: ProductRow[] }) {
  const { wishlist, hydrated } = useStore();

  if (!hydrated) {
    return (
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full rounded-4xl" />
        ))}
      </div>
    );
  }

  const saved = products.filter((product) => wishlist.includes(product.id));

  if (!saved.length) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-4xl border border-dashed border-border py-24 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary">
          <Heart className="h-8 w-8 text-brand-500" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="font-display text-2xl">Nothing saved yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tap the heart on any fabric to keep it here while you decide. Your list stays on this
            device.
          </p>
        </div>
        <Button asChild variant="luxe">
          <Link href="/shop">Browse fabrics</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{saved.length}</span>{" "}
          {saved.length === 1 ? "fabric" : "fabrics"} saved. Open any one to enquire on WhatsApp.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/shop">Browse more</Link>
        </Button>
      </div>

      <ProductGrid products={saved} columns={3} priorityCount={3} />
    </div>
  );
}
