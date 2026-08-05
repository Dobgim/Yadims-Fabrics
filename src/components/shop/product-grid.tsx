"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { inView, stagger } from "@/lib/motion";
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
    <motion.div
      variants={stagger(0, 0.07)}
      initial="hidden"
      whileInView="show"
      viewport={inView}
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
