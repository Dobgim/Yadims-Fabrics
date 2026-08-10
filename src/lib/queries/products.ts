import "server-only";

import { cache } from "react";

import { paginate } from "@/lib/utils";
import { createStaticClient } from "@/lib/supabase/server";
import type { CategoryRow, CollectionRow, ProductRow } from "@/types/database";

export type SortKey = "newest" | "name-asc";

export interface ProductQuery {
  search?: string;
  categories?: string[];
  collection?: string;
  materials?: string[];
  colors?: string[];
  onlyNew?: boolean;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

/**
 * Reads the live catalogue when Supabase is configured, otherwise the curated
 * fallback. Filtering and sorting are applied identically to both sources so
 * the UI never has to care which one it received.
 *
 * Uses the cookie-free client deliberately. Reading `cookies()` marks a route
 * dynamic, which was quietly defeating the `revalidate` on every storefront
 * page — they declared an hour's caching and were re-rendered per request
 * anyway. Nothing here needs a session: the query already filters to the
 * public rows a logged-out visitor may see.
 */
async function loadProducts(): Promise<ProductRow[]> {
  const supabase = createStaticClient();

  // No database means no catalogue. There is no bundled stand-in any more:
  // showing fabrics the shop does not own, at prices it never set, is worse
  // than showing an empty shop.
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // An empty catalogue is a real answer, not a reason to invent stock.
  // Substituting the demo fabrics here put nine fabrics the shop does not
  // own, at prices it never set, in front of customers.
  if (error) return [];
  return (data as ProductRow[]) ?? [];
}

export const getAllProducts = cache(loadProducts);

export const getCategories = cache(async (): Promise<CategoryRow[]> => {
  const supabase = createStaticClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (error) return [];
  return (data as CategoryRow[]) ?? [];
});

export const getCollections = cache(async (): Promise<CollectionRow[]> => {
  const supabase = createStaticClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("position", { ascending: true });

  if (error) return [];
  return (data as CollectionRow[]) ?? [];
});

const sorters: Record<SortKey, (a: ProductRow, b: ProductRow) => number> = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  "name-asc": (a, b) => a.name.localeCompare(b.name),
};

export async function searchProducts(query: ProductQuery = {}) {
  const {
    search,
    categories: categoryIds,
    collection,
    materials,
    colors,
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

  return {
    materials: Array.from(new Set(all.map((p) => p.material).filter(Boolean) as string[])).sort(),
    colors: Array.from(new Set(all.flatMap((p) => p.colors))).sort(),
  };
}

export interface SearchIndexEntry {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  material: string | null;
  image: string | null;
  haystack: string;
}

/**
 * Lightweight index for the header's type-ahead.
 *
 * The dialog is a client component and used to filter the bundled demo
 * catalogue, so it offered fabrics the shop does not stock. It now searches
 * this, built from the same live data every other page reads.
 */
export async function getSearchIndex(): Promise<SearchIndexEntry[]> {
  const all = await getAllProducts();
  return all.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    currency: p.currency,
    material: p.material,
    image: p.images[0] ?? null,
    haystack: [p.name, p.material ?? "", ...p.tags, ...p.colors].join(" ").toLowerCase(),
  }));
}
