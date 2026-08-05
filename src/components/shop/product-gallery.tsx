"use client";

import * as React from "react";
import { SafeImage as Image } from "@/components/shared/safe-image";
import { AnimatePresence, motion } from "framer-motion";
import { ZoomIn } from "lucide-react";

import { cn } from "@/lib/utils";
import { luxeEase } from "@/lib/motion";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

/**
 * Main image with thumbnail rail. Hovering the main image magnifies it by
 * moving `transform-origin` to the cursor — no library, no layout shift.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = React.useState(0);
  const [zooming, setZooming] = React.useState(false);
  const [origin, setOrigin] = React.useState("50% 50%");
  const frameRef = React.useRef<HTMLDivElement>(null);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  if (!images.length) {
    return <div className="aspect-[4/5] w-full rounded-[2rem] bg-muted" />;
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {images.length > 1 ? (
        <div
          className="flex gap-3 overflow-x-auto no-scrollbar lg:flex-col lg:overflow-visible"
          role="tablist"
          aria-label="Product images"
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`View image ${i + 1} of ${images.length}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted transition-all duration-500 ease-luxe lg:h-24 lg:w-20",
                i === active
                  ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <div
        ref={frameRef}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={onMove}
        className="group relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-[2rem] bg-muted"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: luxeEase }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={`${alt} — image ${active + 1}`}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-500 ease-luxe"
              style={{
                transformOrigin: origin,
                transform: zooming ? "scale(1.9)" : "scale(1)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full glass px-3.5 py-2 text-xs text-brand-900 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden /> Hover to zoom
        </span>
      </div>
    </div>
  );
}
