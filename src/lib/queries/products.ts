import "server-only";

import { cache } from "react";

import { categories, collections, facets, products } from "@/data/catalogue";
import { paginate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { CategoryRow, CollectionRow, ProductRow } from "@/types/database";

export type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc" | "rating";

export interface ProductQuery {
  search?: string;
  categories?: string[];
  collection?: string;
  materials?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  onlyNew?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

/**
 * Reads the live catalogue when Supabase is configured, otherwise the curated
 * fallback. Filtering and sorting are applied identically to both sources so
 * the UI never has to care which one it received.
 */
async function loadProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  if (!supabase) return products;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error || !data?.length) return products;
  return data as ProductRow[];
}

export const getAllProducts = cache(loadProducts);

export const getCategories = cache(async (): Promise<CategoryRow[]> => {
  const supabase = await createClient();
  if (!supabase) return categories;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (error || !data?.length) return categories;
  return data as CategoryRow[];
});

export const getCollections = cache(async (): Promise<CollectionRow[]> => {
  const supabase = await createClient();
  if (!supabase) return collections;

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("position", { ascending: true });

  if (error || !data?.length) return collections;
  return data as CollectionRow[];
});

const sorters: Record<SortKey, (a: ProductRow, b: ProductRow) => number> = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  rating: (a, b) => b.rating_average - a.rating_average || b.rating_count - a.rating_count,
};

export async function searchProducts(query: ProductQuery = {}) {
  const {
    search,
    categories: categoryIds,
    collection,
    materials,
    colors,
    minPrice,
    maxPrice,
    onlyNew,
    sort = "newest",
    page = 1,
    perPage = 9,
  } = query;

  const all = await getAllProducts();
  const term = search?.trim().toLowerCase();

  const filtered = all.filter((product) => {
    if (term) {
      const haystack = [
        product.name,
        product.short_description ?? "",
        product.material ?? "",
        ...product.tags,
        ...product.colors,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (categoryIds?.length && !categoryIds.includes(product.category_id ?? "")) return false;
    if (collection && product.collection_id !== collection) return false;
    if (materials?.length && !materials.includes(product.material ?? "")) return false;
    if (colors?.length && !colors.some((c) => product.colors.includes(c))) return false;
    if (minPrice !== undefined && product.price < minPrice) return false;
    if (maxPrice !== undefined && product.price > maxPrice) return false;
    if (onlyNew && !product.is_new_arrival) return false;
    return true;
  });

  filtered.sort(sorters[sort] ?? sorters.newest);

  return paginate(filtered, page, perPage);
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 8) {
  const all = await getAllProducts();
  const featured = all.filter((p) => p.is_featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getNewArrivals(limit = 8) {
  const all = await getAllProducts();
  const fresh = all.filter((p) => p.is_new_arrival);
  return (fresh.length ? fresh : all).slice(0, limit);
}

export async function getProductsByCollectionSlug(slug: string, limit?: number) {
  const [all, cols] = await Promise.all([getAllProducts(), getCollections()]);
  const target = cols.find((c) => c.slug === slug);
  if (!target) return [];
  const matched = all.filter((p) => p.collection_id === target.id);
  return limit ? matched.slice(0, limit) : matched;
}

/** Same collection first, then same category, excluding the product itself. */
export async function getRelatedProducts(product: ProductRow, limit = 4) {
  const all = await getAllProducts();
  const pool = all.filter((p) => p.id !== product.id);
  const score = (p: ProductRow) =>
    (p.collection_id === product.collection_id ? 2 : 0) +
    (p.category_id === product.category_id ? 1 : 0);
  return pool
    .filter((p) => score(p) > 0)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const all = await getAllProducts();
  const byId = new Map(all.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is ProductRow => Boolean(p));
}

export async function getFacets() {
  const all = await getAllProducts();
  if (all === products) return facets;

  return {
    materials: Array.from(new Set(all.map((p) => p.material).filter(Boolean) as string[])).sort(),
    colors: Array.from(new Set(all.flatMap((p) => p.colors))).sort(),
    priceRange: {
      min: Math.min(...all.map((p) => p.price)),
      max: Math.max(...all.map((p) => p.price)),
    },
  };
}
