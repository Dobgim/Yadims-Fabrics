import "server-only";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type {
  BlogPostRow,
  CategoryRow,
  CollectionRow,
  ContactMessageRow,
  GalleryItemRow,
  NewsletterRow,
  OrderItemRow,
  OrderRow,
  ProductRow,
  ProfileRow,
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

export interface DashboardMetrics {
  revenue: number;
  orderCount: number;
  customerCount: number;
  productCount: number;
  pendingOrders: number;
  unreadMessages: number;
  subscriberCount: number;
  lowStock: ProductRow[];
  recentOrders: AdminOrder[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  statusBreakdown: { status: string; count: number }[];
  currency: string;
}

const EMPTY_METRICS: DashboardMetrics = {
  revenue: 0,
  orderCount: 0,
  customerCount: 0,
  productCount: 0,
  pendingOrders: 0,
  unreadMessages: 0,
  subscriberCount: 0,
  lowStock: [],
  recentOrders: [],
  revenueByMonth: [],
  statusBreakdown: [],
  currency: "XAF",
};

/** Buckets orders into the last 6 calendar months, oldest first. */
function bucketByMonth(orders: OrderRow[]) {
  const months: { month: string; revenue: number; orders: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleDateString("en-GB", { month: "short" });

    const matching = orders.filter((order) => {
      const created = new Date(order.created_at);
      return `${created.getFullYear()}-${created.getMonth()}` === key;
    });

    months.push({
      month: label,
      revenue: matching.reduce((sum, order) => sum + order.total, 0),
      orders: matching.length,
    });
  }

  return months;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const db = await adminDb();
  if (!db) return EMPTY_METRICS;

  const [orders, products, customers, messages, subscribers] = await Promise.all([
    db.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
    db.from("products").select("*"),
    db.from("profiles").select("id, role"),
    db.from("contact_messages").select("id, status"),
    db.from("newsletter_subscribers").select("id, is_active"),
  ]);

  const orderRows = (orders.data as AdminOrder[]) ?? [];
  const productRows = (products.data as ProductRow[]) ?? [];

  const billable = orderRows.filter(
    (order) => order.status !== "cancelled" && order.status !== "refunded",
  );

  const statusCounts = orderRows.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    revenue: billable.reduce((sum, order) => sum + order.total, 0),
    orderCount: orderRows.length,
    customerCount: customers.data?.length ?? 0,
    productCount: productRows.length,
    pendingOrders: orderRows.filter((order) =>
      ["pending", "confirmed", "processing"].includes(order.status),
    ).length,
    unreadMessages: messages.data?.filter((m) => m.status === "new").length ?? 0,
    subscriberCount: subscribers.data?.filter((s) => s.is_active).length ?? 0,
    lowStock: productRows
      .filter((product) => product.status === "active" && product.stock_quantity <= 20)
      .sort((a, b) => a.stock_quantity - b.stock_quantity)
      .slice(0, 6),
    recentOrders: orderRows.slice(0, 6),
    revenueByMonth: bucketByMonth(orderRows),
    statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    currency: orderRows[0]?.currency ?? "XAF",
  };
}

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

export async function getAdminPost(id: string): Promise<BlogPostRow | null> {
  const db = await adminDb();
  if (!db) return null;
  const { data } = await db.from("blog_posts").select("*").eq("id", id).maybeSingle();
  return (data as BlogPostRow | null) ?? null;
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

export async function getAdminCustomers(): Promise<ProfileRow[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db.from("profiles").select("*").order("created_at", { ascending: false });
  return (data as ProfileRow[]) ?? [];
}

export async function getAdminGallery(): Promise<GalleryItemRow[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db.from("gallery_items").select("*").order("position");
  return (data as GalleryItemRow[]) ?? [];
}

export async function getAdminPosts(): Promise<BlogPostRow[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db.from("blog_posts").select("*").order("created_at", { ascending: false });
  return (data as BlogPostRow[]) ?? [];
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

export interface StorageAsset {
  url: string;
  bucket: string;
  path: string;
  name: string;
  size: number;
  createdAt: string;
}

const MEDIA_BUCKETS = ["products", "gallery", "blog"] as const;

/**
 * Everything actually sitting in Supabase Storage, newest first.
 *
 * The uploader files under `<year>/<uuid>.<ext>`, so this walks one level of
 * folders rather than assuming a flat bucket. `list()` returns folders as
 * entries with no `id`, which is how they are told apart from files.
 */
export async function getStorageAssets(): Promise<StorageAsset[]> {
  const db = await adminDb();
  if (!db) return [];

  const assets: StorageAsset[] = [];

  await Promise.all(
    MEDIA_BUCKETS.map(async (bucket) => {
      const store = db.storage.from(bucket);
      const { data: top } = await store.list("", { limit: 100 });
      if (!top) return;

      const prefixes = top.filter((entry) => !entry.id).map((entry) => entry.name);
      const files = top.filter((entry) => entry.id).map((entry) => ({ prefix: "", entry }));

      const nested = await Promise.all(
        prefixes.map(async (prefix) => {
          const { data } = await store.list(prefix, {
            limit: 1000,
            sortBy: { column: "created_at", order: "desc" },
          });
          return (data ?? []).filter((entry) => entry.id).map((entry) => ({ prefix, entry }));
        }),
      );

      for (const { prefix, entry } of [...files, ...nested.flat()]) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;
        assets.push({
          url: store.getPublicUrl(path).data.publicUrl,
          bucket,
          path,
          name: entry.name,
          size: (entry.metadata?.size as number | undefined) ?? 0,
          createdAt: entry.created_at ?? new Date(0).toISOString(),
        });
      }
    }),
  );

  return assets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAdminSubscribers(): Promise<NewsletterRow[]> {
  const db = await adminDb();
  if (!db) return [];
  const { data } = await db
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as NewsletterRow[]) ?? [];
}
