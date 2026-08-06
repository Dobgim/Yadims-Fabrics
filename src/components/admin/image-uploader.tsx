"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export type MediaBucket = "products" | "gallery" | "blog";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

interface ImageUploaderProps {
  /** Form field name. Repeated once per image when `multiple`. */
  name: string;
  bucket: MediaBucket;
  /** Existing URLs — a fresh editor passes nothing. */
  defaultValue?: string[];
  multiple?: boolean;
  max?: number;
  label?: string;
  hint?: string;
}

/**
 * Uploads straight from the browser to Supabase Storage, then carries the
 * resulting public URLs into the surrounding form through hidden inputs.
 *
 * Going direct rather than through the Server Action matters: a Server Action
 * body is capped (1 MB by default), and a phone photograph of a bolt of cloth
 * will exceed that on its own. This way the file never touches the Next server,
 * and the action only ever receives a short URL string.
 *
 * The `media_staff_write` storage policy is what authorises the upload, so an
 * ordinary customer holding a valid session still cannot write here.
 */
export function ImageUploader({
  name,
  bucket,
  defaultValue = [],
  multiple = false,
  max = multiple ? 8 : 1,
  label,
  hint,
}: ImageUploaderProps) {
  const [urls, setUrls] = React.useState<string[]>(defaultValue);
  const [busy, setBusy] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const remaining = max - urls.length;

  const upload = React.useCallback(
    async (files: FileList | File[]) => {
      if (!supabase) {
        toast.error("Storage is unavailable — Supabase is not configured.");
        return;
      }

      const chosen = Array.from(files);
      if (chosen.length === 0) return;

      if (chosen.length > remaining) {
        toast.error(
          remaining === 0
            ? `You already have the maximum of ${max} ${max === 1 ? "image" : "images"}.`
            : `Only ${remaining} more ${remaining === 1 ? "image" : "images"} will fit here.`,
        );
        if (remaining === 0) return;
      }

      const batch = chosen.slice(0, Math.max(0, remaining));
      setBusy((n) => n + batch.length);

      const uploaded: string[] = [];

      for (const file of batch) {
        if (!ACCEPTED.includes(file.type)) {
          toast.error(`${file.name} is not a JPEG, PNG, WebP or AVIF.`);
          setBusy((n) => n - 1);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is over 8 MB. Please resize it first.`);
          setBusy((n) => n - 1);
          continue;
        }

        // Year-foldered, random filename: two photographs called IMG_0042.jpg
        // must never overwrite one another.
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;

        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
        });

        setBusy((n) => n - 1);

        if (error) {
          toast.error(`${file.name} did not upload. ${error.message}`);
          continue;
        }

        uploaded.push(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
      }

      if (uploaded.length) {
        setUrls((current) => [...current, ...uploaded].slice(0, max));
        toast.success(
          uploaded.length === 1 ? "Image uploaded." : `${uploaded.length} images uploaded.`,
        );
      }
    },
    [supabase, bucket, remaining, max],
  );

  const move = (index: number, direction: -1 | 1) =>
    setUrls((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const remove = (index: number) =>
    setUrls((current) => current.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {label ? (
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {urls.length}/{max}
          </p>
        </div>
      ) : null}

      {/* What the Server Action actually reads. Order here is display order. */}
      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} readOnly />
      ))}

      {urls.length > 0 ? (
        <ul
          className={cn(
            "grid gap-3",
            multiple ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:max-w-xs",
          )}
        >
          {urls.map((url, index) => (
            <li
              key={url}
              className="group relative overflow-hidden rounded-2xl border border-border bg-muted"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="220px"
                  // Editing previews skip the optimizer: these are transient and
                  // it saves a round trip on every freshly uploaded file.
                  unoptimized
                  className="object-cover"
                />
              </div>

              {multiple && index === 0 ? (
                <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-400 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-brand-900">
                  <Star className="h-2.5 w-2.5 fill-current" aria-hidden /> Main
                </span>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                {multiple ? (
                  <div className="flex gap-1">
                    <IconAction
                      label="Move earlier"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </IconAction>
                    <IconAction
                      label="Move later"
                      onClick={() => move(index, 1)}
                      disabled={index === urls.length - 1}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </IconAction>
                  </div>
                ) : (
                  <span />
                )}

                <IconAction label="Remove image" onClick={() => remove(index)} destructive>
                  <Trash2 className="h-3.5 w-3.5" />
                </IconAction>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {remaining > 0 ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void upload(event.dataTransfer.files);
          }}
          className={cn(
            "rounded-2xl border border-dashed p-6 text-center transition-colors",
            dragging ? "border-brand-500 bg-brand-50/60" : "border-border bg-secondary/30",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple={multiple}
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void upload(event.target.files);
              // Reset so re-picking the same file fires `change` again.
              event.target.value = "";
            }}
          />

          {busy > 0 ? (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Uploading {busy} {busy === 1 ? "file" : "files"}…
            </p>
          ) : (
            <>
              <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm text-muted-foreground">
                Drag {multiple ? "photographs" : "a photograph"} here, or
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus /> Choose {multiple ? "files" : "a file"}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                {hint ?? "JPEG, PNG, WebP or AVIF · up to 8 MB each"}
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full text-white backdrop-blur transition-colors disabled:opacity-30",
        destructive ? "bg-destructive/80 hover:bg-destructive" : "bg-white/20 hover:bg-white/35",
      )}
    >
      {children}
    </button>
  );
}
