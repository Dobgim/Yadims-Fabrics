"use client";

import * as React from "react";
import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/providers/store-provider";
import { QuickViewDialog } from "@/components/shop/quick-view-dialog";
import type { ProductRow } from "@/types/database";

interface ProductCardProps {
  product: ProductRow;
  view?: "grid" | "list";
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, view = "grid", priority, className }: ProductCardProps) {
  const { toggleWishlist, isWishlisted, hydrated } = useStore();
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  const saved = hydrated && isWishlisted(product.id);
  const cover = product.images[0] ?? null;
  const hoverImage = product.images[1] ?? null;

  if (view === "list") {
    return (
      <>
        <motion.article
          variants={fadeUp}
          className={cn(
            "group grid gap-6 rounded-4xl border border-border/60 bg-card p-4 transition-shadow duration-500 ease-luxe hover:shadow-lift sm:grid-cols-[minmax(0,220px)_1fr] sm:p-5",
            className,
          )}
        >
          <Link
            href={`/shop/${product.slug}`}
            className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted sm:aspect-square"
          >
            {cover ? (
              <Image
                src={cover}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 220px, 100vw"
                className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
              />
            ) : null}
          </Link>

          <div className="flex flex-col justify-between gap-4 py-1 pr-1">
            <div className="space-y-2">
              <p className="eyebrow">{product.material}</p>
              <h3 className="font-display text-xl">
                <Link href={`/shop/${product.slug}`} className="link-underline">
                  {product.name}
                </Link>
              </h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {product.short_description}
              </p>
              <ColorDots colors={product.colors} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuickViewOpen(true)}>
                Quick view
              </Button>
              <Button asChild size="sm">
                <Link href={`/shop/${product.slug}`}>View fabric</Link>
              </Button>
            </div>
          </div>
        </motion.article>

        <QuickViewDialog product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
      </>
    );
  }

  return (
    <>
      <motion.article variants={fadeUp} className={cn("group flex flex-col", className)}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-4xl bg-muted">
          <Link href={`/shop/${product.slug}`} className="absolute inset-0 z-10">
            <span className="sr-only">View {product.name}</span>
          </Link>

          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
              className={cn(
                "object-cover transition-all duration-1000 ease-luxe",
                hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105",
              )}
            />
          ) : null}

          {hoverImage ? (
            <Image
              src={hoverImage}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
              className="scale-105 object-cover opacity-0 transition-opacity duration-1000 ease-luxe group-hover:opacity-100"
            />
          ) : null}

          {/* Badges */}
          <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-col items-start gap-2">
            {product.is_new_arrival ? <Badge>New</Badge> : null}
            {product.stock_quantity === 0 ? <Badge tone="muted">Out of stock</Badge> : null}
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={() => toggleWishlist(product.id, product.name)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full glass text-brand-800 shadow-soft transition-transform duration-500 ease-luxe hover:scale-110"
          >
            <Heart
              className={cn("h-4 w-4 transition-colors", saved && "fill-brand-500 text-brand-500")}
            />
          </button>

          {/* Hover actions */}
          <div className="absolute inset-x-3 bottom-3 z-20 flex translate-y-3 opacity-0 transition-all duration-500 ease-luxe group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
            <Button
              variant="glass"
              size="sm"
              className="w-full"
              onClick={() => setQuickViewOpen(true)}
            >
              <Eye /> Quick view
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 px-1 pt-5">
          <p className="eyebrow">{product.material}</p>
          <h3 className="font-display text-lg leading-snug">
            <Link href={`/shop/${product.slug}`} className="link-underline">
              {product.name}
            </Link>
          </h3>
          <ColorDots colors={product.colors} />
          {product.short_description ? (
            <p className="mt-auto line-clamp-2 pt-2 text-sm leading-relaxed text-muted-foreground">
              {product.short_description}
            </p>
          ) : null}
        </div>
      </motion.article>

      <QuickViewDialog product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </>
  );
}

function Badge({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "gold" | "muted" }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] shadow-soft",
        tone === "brand" && "bg-brand-700 text-white",
        tone === "gold" && "bg-gold-400 text-brand-900",
        tone === "muted" && "bg-white/85 text-brand-900 backdrop-blur",
      )}
    >
      {children}
    </span>
  );
}


function ColorDots({ colors }: { colors: string[] }) {
  if (!colors.length) return null;
  return (
    <ul className="flex items-center gap-1.5" aria-label="Available colours">
      {colors.slice(0, 5).map((color) => (
        <li
          key={color}
          title={color}
          className="h-3 w-3 rounded-full border border-border shadow-inner"
          style={{ backgroundColor: colorToCss(color) }}
        />
      ))}
      {colors.length > 5 ? (
        <li className="text-xs text-muted-foreground">+{colors.length - 5}</li>
      ) : null}
    </ul>
  );
}

/**
 * Maps house colour names to a swatch value. Names outside the map fall back
 * to the CSS colour of the same name, then to a neutral.
 */
const COLOR_MAP: Record<string, string> = {
  Ivory: "#F5F0E4",
  "Pure White": "#FFFFFF",
  "Diamond White": "#FBFBF8",
  White: "#FFFFFF",
  Champagne: "#E5D3B3",
  "Antique Gold": "#C6A24A",
  "Rose Gold": "#D8A38C",
  "Emerald Gold": "#8A8C46",
  "Gold Multi": "#D4AF37",
  "Royal Multi": "#3B5BA5",
  "Earth Multi": "#9C6B44",
  Gold: "#D4AF37",
  Blush: "#EBC7C2",
  "Soft Blush": "#F2D8D4",
  "Dusty Rose": "#C89A97",
  Nude: "#DEC3AC",
  Oyster: "#DCD3C4",
  Pearl: "#EFEAE1",
  "Iridescent Pearl": "#E7E9EC",
  Silver: "#C7CAD1",
  "Powder Blue": "#BFD3E3",
  Sky: "#A8C8E1",
  "Sea Glass": "#AFCDC4",
  Mint: "#B9DCC6",
  Sage: "#9FAE94",
  Emerald: "#0E6B43",
  "Emerald Multi": "#0E6B43",
  Natural: "#D8CFBE",
  Chalk: "#EDEAE2",
  Butter: "#F2E6BE",
  Ecru: "#DED8C8",
  Terracotta: "#B4633F",
  Ochre: "#C08A2E",
  Crimson: "#9B1B2E",
  Ruby: "#8E1B33",
  Wine: "#5C1A2B",
  Bordeaux: "#5B1522",
  Mauve: "#A98098",
  Lilac: "#C4B3D6",
  Amethyst: "#6B4B8A",
  Sapphire: "#1B3A73",
  Cobalt: "#1F45A0",
  Navy: "#16233F",
  "Deep Navy": "#121C33",
  Indigo: "#22314F",
  Midnight: "#101B2B",
  Slate: "#5A6472",
  Charcoal: "#3B3F44",
  Onyx: "#15181B",
  Black: "#000000",
  "Black White": "#4A4A4A",
  "Blush Silver": "#D9C6C4",
  "Cream Gold": "#E4D6B4",
  Espresso: "#3A2A21",
  Ink: "#1E2530",
  "Stripe Navy": "#2C3E63",
  Obsidian: "#12161A",
};

function colorToCss(name: string) {
  return COLOR_MAP[name] ?? name.toLowerCase().replace(/\s+/g, "");
}

export { colorToCss };
