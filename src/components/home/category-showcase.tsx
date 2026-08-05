"use client";

import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { fadeUp, inView, stagger } from "@/lib/motion";
import type { CategoryRow } from "@/types/database";

/**
 * Editorial category mosaic. The first tile spans two rows on large screens,
 * which gives the grid a deliberate rhythm rather than a uniform block.
 */
export function CategoryShowcase({ categories }: { categories: CategoryRow[] }) {
  const tiles = categories.slice(0, 5);

  return (
    <motion.div
      variants={stagger(0, 0.08)}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2"
    >
      {tiles.map((category, i) => (
        <motion.article
          key={category.id}
          variants={fadeUp}
          className={cn(
            "group relative isolate overflow-hidden rounded-4xl bg-brand-900",
            i === 0 ? "lg:col-span-2 lg:row-span-2" : "",
          )}
        >
          <Link href={`/shop?category=${category.slug}`} className="block">
            <div className={cn("relative", i === 0 ? "aspect-[4/5] lg:aspect-auto lg:h-full" : "aspect-[4/3]")}>
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt=""
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-110"
                />
              ) : null}
              <div
                className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/25 to-transparent transition-opacity duration-700 group-hover:from-brand-900/95"
                aria-hidden
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 lg:p-7">
              <div>
                <h3
                  className={cn(
                    "font-display text-white",
                    i === 0 ? "text-3xl lg:text-4xl" : "text-xl",
                  )}
                >
                  {category.name}
                </h3>
                {i === 0 && category.description ? (
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                    {category.description}
                  </p>
                ) : null}
              </div>

              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/30 text-white transition-all duration-500 ease-luxe group-hover:border-gold-400 group-hover:bg-gold-400 group-hover:text-brand-900">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>
        </motion.article>
      ))}
    </motion.div>
  );
}
