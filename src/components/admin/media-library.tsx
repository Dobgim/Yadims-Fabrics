"use client";

import * as React from "react";
import Image from "next/image";
import { Copy, ImageOff, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export interface MediaAsset {
  url: string;
  bucket: string;
  usedBy: string;
}

export function MediaLibrary({ assets }: { assets: MediaAsset[] }) {
  const buckets = React.useMemo(
    () => ["All", ...Array.from(new Set(assets.map((a) => a.bucket)))],
    [assets],
  );
  const [filter, setFilter] = React.useState("All");

  const visible = filter === "All" ? assets : assets.filter((a) => a.bucket === filter);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Your browser blocked the clipboard. Copy the URL manually.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by bucket">
          {buckets.map((bucket) => (
            <Button
              key={bucket}
              role="tab"
              aria-selected={filter === bucket}
              variant={filter === bucket ? "luxe" : "outline"}
              size="sm"
              onClick={() => setFilter(bucket)}
              className="capitalize"
            >
              {bucket}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{visible.length}</span> assets
          </p>
          <Button variant="luxe" size="sm">
            <Upload /> Upload
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border py-20 text-center">
          <ImageOff className="h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">No media in this bucket yet.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {visible.map((asset) => (
            <li
              key={asset.url}
              className="group overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-square bg-muted">
                <Image
                  src={asset.url}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 15vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => copy(asset.url)}
                  aria-label={`Copy URL for ${asset.usedBy}`}
                  className="absolute inset-0 grid place-items-center bg-brand-900/0 text-white opacity-0 transition-all duration-300 group-hover:bg-brand-900/55 group-hover:opacity-100 focus-visible:bg-brand-900/55 focus-visible:opacity-100"
                >
                  <Copy className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="p-3">
                <p className="truncate text-xs font-medium">{asset.usedBy}</p>
                <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {asset.bucket}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
