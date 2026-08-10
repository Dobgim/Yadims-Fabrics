"use client";

import * as React from "react";
import { FileVideo, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// 50 MB. A short phone clip of a fabric falls well under this; anything larger
// should really be trimmed or posted to social and linked instead.
const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPTED = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];

interface VideoUploaderProps {
  /** Form field name, repeated once per uploaded clip. */
  name: string;
  defaultValue?: string[];
  max?: number;
  label?: string;
  hint?: string;
}

/**
 * Uploads short product videos straight from the browser to Supabase Storage,
 * then carries the resulting public URLs into the surrounding form via hidden
 * inputs — the same pattern as the image uploader, and for the same reason: a
 * video is far too large to pass through a Server Action body.
 *
 * Clips go into the existing `products` bucket under a `videos/` prefix, so no
 * new storage bucket or RLS policy is needed — `media_staff_write` already
 * covers writes to `products`.
 */
export function VideoUploader({
  name,
  defaultValue = [],
  max = 6,
  label,
  hint,
}: VideoUploaderProps) {
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

      if (chosen.length > remaining && remaining === 0) {
        toast.error(`You already have the maximum of ${max} videos.`);
        return;
      }

      const batch = chosen.slice(0, Math.max(0, remaining));
      setBusy((n) => n + batch.length);

      const uploaded: string[] = [];

      for (const file of batch) {
        if (!ACCEPTED.includes(file.type)) {
          toast.error(`${file.name} is not an MP4, WebM, MOV or OGG video.`);
          setBusy((n) => n - 1);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is over 50 MB. Please trim it, or post it online and link instead.`);
          setBusy((n) => n - 1);
          continue;
        }

        const extension = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
        const path = `videos/${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;

        const { error } = await supabase.storage.from("products").upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });

        setBusy((n) => n - 1);

        if (error) {
          toast.error(`${file.name} did not upload. ${error.message}`);
          continue;
        }

        uploaded.push(supabase.storage.from("products").getPublicUrl(path).data.publicUrl);
      }

      if (uploaded.length) {
        setUrls((current) => [...current, ...uploaded].slice(0, max));
        toast.success(uploaded.length === 1 ? "Video uploaded." : `${uploaded.length} videos uploaded.`);
      }
    },
    [supabase, remaining, max],
  );

  const remove = (index: number) => setUrls((current) => current.filter((_, i) => i !== index));

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

      {/* What the Server Action reads. */}
      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} readOnly />
      ))}

      {urls.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {urls.map((url, index) => (
            <li key={url} className="group relative overflow-hidden rounded-2xl border border-border bg-black">
              <video
                src={url}
                controls
                preload="metadata"
                className="aspect-video w-full bg-black object-contain"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remove video"
                title="Remove video"
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-destructive/80 text-white backdrop-blur transition-colors hover:bg-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
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
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void upload(event.target.files);
              event.target.value = "";
            }}
          />

          {busy > 0 ? (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Uploading {busy} {busy === 1 ? "video" : "videos"}…
            </p>
          ) : (
            <>
              <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm text-muted-foreground">Drag a video here, or</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => inputRef.current?.click()}
              >
                <FileVideo /> Choose a video
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                {hint ?? "MP4, WebM, MOV or OGG · up to 50 MB each · film in landscape if you can"}
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
