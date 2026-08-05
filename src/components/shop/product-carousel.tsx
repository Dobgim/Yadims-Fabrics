"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shop/product-card";
import type { ProductRow } from "@/types/database";

interface ProductCarouselProps {
  products: ProductRow[];
  showControls?: boolean;
  /** Milliseconds between slides. Set `autoplay={false}` to hold still. */
  autoplay?: boolean;
  delay?: number;
}

/**
 * Horizontal rail used on the home page where a full grid would overwhelm.
 *
 * Autoplay pauses on hover and on keyboard focus, and stops permanently once
 * the visitor drags or uses the arrows — an auto-advancing carousel that
 * fights the person operating it is worse than one that never moves.
 */
export function ProductCarousel({
  products,
  showControls = true,
  autoplay = true,
  delay = 3200,
}: ProductCarouselProps) {
  const plugin = React.useRef(
    Autoplay({
      delay,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    }),
  );

  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSelected(api.selectedScrollSnap());
      setSnapCount(api.scrollSnapList().length);
    };
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => {
      api.off("select", sync).off("reInit", sync);
    };
  }, [api]);

  if (!products.length) return null;

  return (
    <Carousel
      setApi={setApi}
      plugins={autoplay ? [plugin.current] : []}
      opts={{ align: "start", loop: autoplay, containScroll: "trimSnaps" }}
      aria-label="Featured fabrics"
      aria-roledescription="carousel"
    >
      <CarouselContent className="-ml-5">
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="basis-[78%] pl-5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls ? (
        <div className="mt-10 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>

          {snapCount > 1 ? (
            <div className="flex gap-2" role="tablist" aria-label="Carousel slides">
              {Array.from({ length: snapCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === selected}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 ease-luxe",
                    i === selected ? "w-8 bg-brand-500" : "w-1.5 bg-border hover:bg-brand-200",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </Carousel>
  );
}
