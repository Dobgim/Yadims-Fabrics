import "server-only";

import { cache } from "react";

import { galleryItems } from "@/data/content";
import { createClient } from "@/lib/supabase/server";
import type { GalleryItemRow, ReviewRow } from "@/types/database";

export const getGalleryItems = cache(async (): Promise<GalleryItemRow[]> => {
  const supabase = await createClient();
  if (!supabase) return galleryItems;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("is_published", true)
    .order("position", { ascending: true });

  if (error || !data?.length) return galleryItems;
  return data as GalleryItemRow[];
});

export async function getProductReviews(productId: string): Promise<ReviewRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as ReviewRow[];
}
