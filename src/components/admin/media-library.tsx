"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, ImageOff, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { deleteMediaAsset } from "@/app/actions/catalogue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploader, type MediaBucket } from "@/components/admin/image-uploader";
import { SelectField } from "@/components/admin/form-kit";

export interface MediaAsset {
  url: string;
  bucket: string;
  path: string;
  name: string;
  size: number;
  createdAt: string;
  /** Where it is referenced, if anywhere. Empty means safe to delete. */
  usedBy: string[];
  /** False for images bundled with the site — those live in the repo. */
  uploaded: boolean;
}

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ assets }: { assets: MediaAsset[] }) {
  const router = useRouter();
  const buckets = React.useMemo(
    () => ["All", ...Array.from(new Set(assets.map((a) => a.bucket)))],
    [assets],
  );
  const [filter, setFilter] = React.useState("All");
  const [copied, setCopied] = React.useState<string | null>(null);
  const [uploadTo, setUploadTo] = React.useState<MediaBucket | null>(null);

  const visible = filter === "All" ? assets : assets.filter((a) => a.bucket === filter);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      toast.success("URL copied to clipboard");
      window.setTimeout(() => setCopied((current) => (current === url ? null : current)), 1600);
    } catch {
      toast.error("Your browser blocked the clipboard. Copy the URL manually.");
    }
  };

  const remove = async (asset: MediaAsset) => {
    if (asset.usedBy.length) {
      toast.error(`In use by ${asset.usedBy[0]}. Remove it there first.`);
      return;
    }
    const result = await deleteMediaAsset(asset.url);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
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
          <Button variant="luxe" size="sm" onClick={() => setUploadTo("products")}>
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

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-brand-900/0 opacity-0 transition-all duration-300 group-hover:bg-brand-900/55 group-hover:opacity-100 focus-within:bg-brand-900/55 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => copy(asset.url)}
                    aria-label={`Copy URL for ${asset.name}`}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/35"
                  >
                    {copied === asset.url ? (
                      <Check className="h-4 w-4" aria-hidden />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden />
                    )}
                  </button>

                  {asset.uploaded ? (
                    <button
                      type="button"
                      onClick={() => remove(asset)}
                      aria-label={`Delete ${asset.name}`}
                      title={
                        asset.usedBy.length
                          ? `In use by ${asset.usedBy[0]}`
                          : "Delete from storage"
                      }
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-full text-white backdrop-blur transition-colors",
                        asset.usedBy.length
                          ? "bg-white/10 opacity-50"
                          : "bg-destructive/80 hover:bg-destructive",
                      )}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="p-3">
                <p className="truncate text-xs font-medium">
                  {asset.usedBy[0] ?? <span className="text-muted-foreground">Unused</span>}
                </p>
                <p className="mt-0.5 flex items-center justify-between gap-2 text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
                  <span>{asset.bucket}</span>
                  <span className="normal-case tracking-normal">{formatBytes(asset.size)}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={uploadTo !== null} onOpenChange={(next) => (next ? null : setUploadTo(null))}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload to storage</DialogTitle>
            <DialogDescription>
              Files land in the bucket you pick and can then be attached to a fabric, a gallery
              entry or an article. Nothing appears on the storefront until you do.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="upload-bucket" className="text-sm font-medium">
                Bucket
              </label>
              <SelectField
                id="upload-bucket"
                value={uploadTo ?? "products"}
                onChange={(event) => setUploadTo(event.target.value as MediaBucket)}
              >
                <option value="products">products — fabric photography</option>
                <option value="gallery">gallery — the store and its customers</option>
                <option value="blog">blog — journal covers</option>
              </SelectField>
            </div>

            {uploadTo ? (
              // Keyed on the bucket so switching it starts a clean uploader
              // rather than carrying the previous bucket's uploads across.
              <ImageUploader
                key={uploadTo}
                name="media"
                bucket={uploadTo}
                multiple
                max={12}
                label="Files"
              />
            ) : null}

            <div className="flex justify-end">
              <Button
                variant="luxe"
                onClick={() => {
                  setUploadTo(null);
                  router.refresh();
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
