"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Quote, Star } from "lucide-react";

import { testimonials } from "@/data/content";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function Testimonials() {
  // Lazy initialiser, not a ref: the instance is read during render below,
  // and ref access during render is unsafe under the React Compiler.
  const [autoplay] = React.useState(() => Autoplay({ delay: 6000, stopOnInteraction: true }));
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      plugins={[autoplay]}
      opts={{ align: "start", loop: true }}
      aria-label="Customer testimonials"
    >
      <CarouselContent className="-ml-5">
        {testimonials.map((item) => (
          <CarouselItem key={item.id} className="pl-5 md:basis-1/2 lg:basis-1/3">
            <figure className="flex h-full flex-col gap-6 rounded-4xl border border-border/70 bg-card p-8 transition-shadow duration-500 ease-luxe hover:shadow-lift">
              <Quote className="h-7 w-7 shrink-0 text-gold-400" aria-hidden />

              <blockquote className="flex-1 font-display text-lg leading-relaxed text-foreground">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <div className="flex gap-0.5" aria-label={`${item.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < item.rating ? "fill-gold-400 text-gold-400" : "text-border",
                    )}
                    aria-hidden
                  />
                ))}
              </div>

              <figcaption className="border-t border-border pt-5">
                <span className="block font-medium">{item.author}</span>
                <span className="block text-sm text-muted-foreground">{item.role}</span>
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="mt-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>

        <div className="flex gap-2" role="tablist" aria-label="Testimonial slides">
          {testimonials.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === selected}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 ease-luxe",
                i === selected ? "w-8 bg-brand-500" : "w-1.5 bg-border hover:bg-brand-200",
              )}
            />
          ))}
        </div>
      </div>
    </Carousel>
  );
}
