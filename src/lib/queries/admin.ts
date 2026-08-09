import "server-only";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type {
  CategoryRow,
  CollectionRow,
  ContactMessageRow,
  GalleryItemRow,
  OrderItemRow,
  OrderRow,
  ProductRow,
} from "@/types/database";

/**
 * Admin reads use the service-role client where available so a staff member
 * sees every customer's rows, and fall back to the RLS-scoped client (which
 * staff policies already permit) when no service key is configured.
 */
async function adminDb() {
  return createAdminClient() ?? (await createClient());
}

export type AdminOrder = OrderRow & { order_items: OrderItemRow[] };

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  return (data as AdminOrder[]) ?? [];
}

export async function getAdminProducts(): Promise<ProductRow[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db.from("products").select("*").order("created_at", { ascending: false });
  return (data as ProductRow[]) ?? [];
}

/** A single row by id, for the editors. `null` means "show a 404". */
export async function getAdminProduct(id: string): Promise<ProductRow | null> {
  const db = await adminDb();
  if (!db) return null;
  const { data } = await db.from("products").select("*").eq("id", id).maybeSingle();
  return (data as ProductRow | null) ?? null;
}

export async function getAdminCategories(): Promise<CategoryRow[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db.from("categories").select("*").order("position");
  return (data as CategoryRow[]) ?? [];
}

export async function getAdminCollections(): Promise<CollectionRow[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db.from("collections").select("*").order("position");
  return (data as CollectionRow[]) ?? [];
}

export async function getAdminGallery(): Promise<GalleryItemRow[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db.from("gallery_items").select("*").order("position");
  return (data as GalleryItemRow[]) ?? [];
}

export async function getAdminMessages(): Promise<ContactMessageRow[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as ContactMessageRow[]) ?? [];
}
