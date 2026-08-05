"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Ruler, Truck } from "lucide-react";

import { cn } from "@/lib/utils";
import { inView, revealUp, slideInLeft, slideInRight } from "@/lib/motion";
import { SafeImage as Image } from "@/components/shared/safe-image";
import { Button } from "@/components/ui/button";
import type { CollectionRow } from "@/types/database";

interface CollectionFeatureProps {
  collection: CollectionRow;
  /** Flips the image to the right, used to alternate down the page. */
  reversed?: boolean;
  eyebrow?: string;
  /** Number of fabrics in the collection — shown in the meta strip. */
  productCount?: number;
  /** Rendered on a dark section, which inverts the text colours. */
  tone?: "light" | "dark";
}

export function CollectionFeature({
  collection,
  reversed,
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
    <div
      className={cn(
        "grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16",
        reversed && "lg:[&>*:first-child]:order-2",
      )}
    >
      {/* ------------------------------------------------ Imagery */}
      <motion.div
        variants={revealUp}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="relative"
      >
        {/*
          A 4:3 frame rather than a tall 4:5 one. The old proportion left a
          column of dead space beside a short block of copy; this keeps the
          two sides close in height at every breakpoint.
        */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-brand-800/40 sm:aspect-[16/10]">
          {collection.cover_image_url ? (
            <Image
              src={collection.cover_image_url}
              alt={collection.name}
              fill
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="object-cover"
            />
          ) : null}
        </div>

        {/* Accent image tucked into the lower corner, tightening the composition */}
        {collection.accent_image_url ? (
          <div
            className={cn(
              "absolute -bottom-6 hidden aspect-square w-32 overflow-hidden rounded-2xl shadow-lift ring-4 lg:block xl:w-36",
              dark ? "ring-brand-900" : "ring-background",
              reversed ? "-left-6" : "-right-6",
            )}
            aria-hidden
          >
            <Image
              src={collection.accent_image_url}
              alt=""
              fill
              sizes="9rem"
              className="object-cover"
            />
          </div>
        ) : null}
      </motion.div>

      {/* --------------------------------------------------- Copy */}
      <motion.div
        variants={reversed ? slideInLeft : slideInRight}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="flex flex-col items-center text-center"
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
            "mt-6 max-w-xl text-balance leading-relaxed",
            dark ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {collection.description}
        </p>

        {/* Meta strip — gives the copy column real substance beside the image */}
        <dl
          className={cn(
            "mt-8 grid w-full max-w-xl grid-cols-1 gap-5 border-t pt-6 sm:grid-cols-3 sm:gap-4",
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
                <span
                  className={cn(
                    "text-sm font-medium",
                    dark ? "text-white" : "text-foreground",
                  )}
                >
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
    </div>
  );
}
