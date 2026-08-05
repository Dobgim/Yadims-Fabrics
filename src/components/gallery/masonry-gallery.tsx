"use client";

import * as React from "react";
import { SafeImage as Image } from "@/components/shared/safe-image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { luxeEase } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { GalleryItemRow } from "@/types/database";

const aspectClass = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
} as const;

interface MasonryGalleryProps {
  items: GalleryItemRow[];
  categories: readonly string[];
}

export function MasonryGallery({ items, categories }: MasonryGalleryProps) {
  const [filter, setFilter] = React.useState<string>("All");
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  const visible = React.useMemo(
    () => (filter === "All" ? items : items.filter((item) => item.category === filter)),
    [items, filter],
  );

  const step = React.useCallback(
    (delta: number) =>
      setLightbox((current) =>
        current === null ? null : (current + delta + visible.length) % visible.length,
      ),
    [visible.length],
  );

  // Arrow-key navigation while the lightbox is open.
  React.useEffect(() => {
    if (lightbox === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, step]);

  const active = lightbox !== null ? visible[lightbox] : null;

  return (
    <>
      <div className="mb-12 flex flex-wrap gap-2" role="tablist" aria-label="Filter gallery">
        {categories.map((category) => (
          <Button
            key={category}
            role="tab"
            aria-selected={filter === category}
            variant={filter === category ? "luxe" : "outline"}
            size="sm"
            onClick={() => {
              setFilter(category);
              setLightbox(null);
            }}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* CSS columns give a true masonry flow without JS measurement */}
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        <AnimatePresence mode="popLayout">
          {visible.map((item, index) => (
            <motion.figure
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: luxeEase }}
              className="group relative block break-inside-avoid overflow-hidden rounded-3xl bg-muted"
            >
              <button
                type="button"
                onClick={() => setLightbox(index)}
                className="block w-full text-left"
                aria-label={`Open ${item.title}`}
              >
                <div className={cn("relative w-full", aspectClass[item.aspect])}>
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 92vw"
                    className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.06]"
                  />
                </div>

                <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-900/90 via-brand-900/10 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="text-eyebrow font-medium uppercase text-gold-400">
                    {item.category}
                  </span>
                  <span className="mt-2 font-display text-xl text-white">{item.title}</span>
                  {item.caption ? (
                    <span className="mt-1 text-sm text-white/70">{item.caption}</span>
                  ) : null}
                </figcaption>

                <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full glass text-brand-900 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <Expand className="h-4 w-4" aria-hidden />
                </span>
              </button>
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={lightbox !== null} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent
          className="max-w-5xl border-0 bg-transparent p-0 shadow-none [&>button]:hidden"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">{active?.title ?? "Gallery image"}</DialogTitle>

          {active ? (
            <figure className="relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-brand-900">
                <Image
                  src={active.image_url}
                  alt={active.title}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>

              <figcaption className="mt-5 flex items-end justify-between gap-6 text-white">
                <div>
                  <p className="text-eyebrow font-medium uppercase text-gold-400">
                    {active.category}
                  </p>
                  <p className="mt-1.5 font-display text-2xl">{active.title}</p>
                  {active.caption ? (
                    <p className="mt-1 text-sm text-white/65">{active.caption}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm tabular-nums text-white/50">
                  {(lightbox ?? 0) + 1} / {visible.length}
                </p>
              </figcaption>

              <Button
                variant="glass"
                size="icon"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="glass"
                size="icon"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <ChevronRight />
              </Button>
              <Button
                variant="glass"
                size="icon"
                onClick={() => setLightbox(null)}
                aria-label="Close"
                className="absolute right-4 top-4"
              >
                <X />
              </Button>
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
