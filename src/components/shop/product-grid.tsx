"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { stagger } from "@/lib/motion";
import { ProductCard } from "@/components/shop/product-card";
import type { ProductRow } from "@/types/database";

interface ProductGridProps {
  products: ProductRow[];
  view?: "grid" | "list";
  columns?: 2 | 3 | 4;
  className?: string;
  priorityCount?: number;
}

const columnClass = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function ProductGrid({
  products,
  view = "grid",
  columns = 3,
  className,
  priorityCount = 0,
}: ProductGridProps) {
  return (
    // Revealed on mount, NOT on scroll. A `whileInView` reveal gated on a
    // fraction of the grid being visible can never fire on mobile, where a
    // tall grid (many cards in one column) is several screens high and never
    // shows enough of itself at once — leaving every card stuck at opacity 0
    // and the shop looking empty. Products are the whole point of the page,
    // so their visibility must not depend on a scroll threshold.
    <motion.div
      variants={stagger(0, 0.07)}
      initial="hidden"
      animate="show"
      className={cn(
        "grid gap-x-6 gap-y-12",
        view === "grid" ? columnClass[columns] : "grid-cols-1 gap-y-5",
        className,
      )}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          view={view}
          priority={i < priorityCount}
        />
      ))}
    </motion.div>
  );
}
