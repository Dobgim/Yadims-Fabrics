import "server-only";

import { cache } from "react";

import { blogPosts, galleryItems } from "@/data/content";
import { createClient } from "@/lib/supabase/server";
import type { BlogPostRow, GalleryItemRow, ReviewRow } from "@/types/database";

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

export const getBlogPosts = cache(async (): Promise<BlogPostRow[]> => {
  const supabase = await createClient();
  if (!supabase) return blogPosts;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data?.length) return blogPosts;
  return data as BlogPostRow[];
});

export async function getPostBySlug(slug: string) {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedPosts(post: BlogPostRow, limit = 3) {
  const posts = await getBlogPosts();
  const sameCategory = posts.filter((p) => p.id !== post.id && p.category === post.category);
  const rest = posts.filter((p) => p.id !== post.id && p.category !== post.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function searchPosts(term?: string, category?: string) {
  const posts = await getBlogPosts();
  const q = term?.trim().toLowerCase();

  return posts.filter((post) => {
    if (category && category !== "All" && post.category !== category) return false;
    if (!q) return true;
    return [post.title, post.excerpt ?? "", ...post.tags]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

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
