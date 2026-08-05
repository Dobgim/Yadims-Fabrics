"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { GalleryItemRow } from "@/types/database";

export function GalleryManager({ items }: { items: GalleryItemRow[] }) {
  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );
  const [filter, setFilter] = React.useState("All");

  const visible = filter === "All" ? items : items.filter((item) => item.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter gallery">
          {categories.map((category) => (
            <Button
              key={category}
              role="tab"
              aria-selected={filter === category}
              variant={filter === category ? "luxe" : "outline"}
              size="sm"
              onClick={() => setFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <Button variant="luxe" size="sm">
          <Plus /> Upload image
        </Button>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border py-20 text-center">
          <ImageOff className="h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">Nothing in the gallery yet.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => (
            <li
              key={item.id}
              className="group overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
                <span
                  className={cn(
                    "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em]",
                    item.is_published
                      ? "bg-brand-500 text-white"
                      : "bg-white/90 text-muted-foreground backdrop-blur",
                  )}
                >
                  {item.is_published ? "Live" : "Hidden"}
                </span>
              </div>

              <div className="p-5">
                <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.category}
                </p>
                <h3 className="mt-2 truncate font-medium">{item.title}</h3>
                {item.caption ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.caption}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
