import "server-only";

import { cache } from "react";

import { galleryItems } from "@/data/content";
import { createStaticClient } from "@/lib/supabase/server";
import type { GalleryItemRow } from "@/types/database";

/**
 * Published gallery photographs.
 *
 * Cookie-free on purpose. Reading `cookies()` marks a route dynamic, which was
 * quietly defeating the `revalidate` on every page that shows the gallery —
 * they declared an hour of caching and were re-rendered on every request
 * anyway. Only published rows are selected, which is exactly what a logged-out
 * visitor may see, so a session would add nothing.
 */
export const getGalleryItems = cache(async (): Promise<GalleryItemRow[]> => {
  const supabase = createStaticClient();
  if (!supabase) return galleryItems;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("is_published", true)
    .order("position", { ascending: true });

  if (error || !data?.length) return galleryItems;
  return data as GalleryItemRow[];
});
