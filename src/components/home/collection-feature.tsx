"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Ruler, Truck } from "lucide-react";

import { cn } from "@/lib/utils";
import { fadeUp, inView } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import type { CollectionRow } from "@/types/database";

interface CollectionFeatureProps {
  collection: CollectionRow;
  eyebrow?: string;
  /** Number of fabrics in the collection — shown in the meta strip. */
  productCount?: number;
  /** Rendered on a dark section, which inverts the text colours. */
  tone?: "light" | "dark";
}

/**
 * The introduction to a collection, above its fabrics.
 *
 * Deliberately text-only and centred on the page. It used to be a two-column
 * layout with the collection's cover photograph beside the copy; the owner
 * asked for the image removed so the collection is announced by its name and
 * description alone, with the fabric grid underneath carrying the imagery.
 *
 * `cover_image_url` and `accent_image_url` are still on the collection record
 * and still used by the collections pages and the dashboard — nothing was
 * deleted, this band simply no longer shows them.
 */
export function CollectionFeature({
  collection,
  eyebrow = "Collection",
  productCount,
  tone = "light",
}: CollectionFeatureProps) {
  const dark = tone === "dark";

  const meta = [
    {
      icon: Layers,
      label: productCount ? `${productCount} fabrics` : "Curated edit",
      hint: "In this collection",
    },
    { icon: Ruler, label: "Weight & width", hint: "Published on every bolt" },
    { icon: Truck, label: "Same-day", hint: "Delivery in Yaoundé" },
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="mx-auto flex max-w-3xl flex-col items-center text-center"
    >
      <p className={cn("eyebrow", dark && "text-gold-400")}>{eyebrow}</p>

      <h3
        className={cn(
          "mt-3 text-display-sm md:text-display-md",
          dark ? "text-white" : "text-foreground",
        )}
      >
        {collection.name}
      </h3>

      {collection.tagline ? (
        <p
          className={cn(
            "mt-2.5 font-display text-lg italic md:text-xl",
            dark ? "text-gold-300" : "text-gold-500",
          )}
        >
          {collection.tagline}
        </p>
      ) : null}

      <span className="rule-gold-center mt-6 block" aria-hidden />

      <p
        className={cn(
          "mt-6 max-w-2xl text-balance leading-relaxed",
          dark ? "text-white/70" : "text-muted-foreground",
        )}
      >
        {collection.description}
      </p>

      <dl
        className={cn(
          "mt-9 grid w-full max-w-2xl grid-cols-1 gap-5 border-t pt-7 sm:grid-cols-3 sm:gap-4",
          dark ? "border-white/15" : "border-border",
        )}
      >
        {meta.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5">
            <dt className="flex items-center gap-2">
              <item.icon
                className={cn("h-3.5 w-3.5 shrink-0", dark ? "text-gold-400" : "text-brand-500")}
                aria-hidden
              />
              <span className={cn("text-sm font-medium", dark ? "text-white" : "text-foreground")}>
                {item.label}
              </span>
            </dt>
            <dd
              className={cn(
                "text-xs leading-snug",
                dark ? "text-white/50" : "text-muted-foreground",
              )}
            >
              {item.hint}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant={dark ? "gold" : "luxe"} size="lg">
          <Link href={`/collections/${collection.slug}`}>
            View the collection <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant={dark ? "glass" : "outline"} size="lg">
          <Link href={`/shop?collection=${collection.slug}`}>Shop with filters</Link>
        </Button>
      </div>
    </motion.div>
  );
}
