"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import { FORBIDDEN, NOT_CONFIGURED, describeDbError, requireStaff } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";
import {
  categorySchema,
  collectionSchema,
  galleryItemSchema,
  productSchema,
  type ActionResult,
} from "@/lib/validations";

/**
 * Catalogue authoring. Every entity the shop owner maintains — fabrics,
 * categories, collections, gallery photographs, journal articles — is created
 * and edited through the actions below.
 *
 * All of them share one shape:
 *   1. check the caller is staff (never trust the route guard alone),
 *   2. parse `FormData` through the matching Zod schema,
 *   3. insert or update depending on whether an `id` came through,
 *   4. revalidate both the dashboard list and the storefront pages that read it.
 *
 * Images are *not* handled here. They are uploaded straight from the browser to
 * Supabase Storage (the `media_staff_write` policy permits it), and only the
 * resulting public URLs reach these actions. That keeps large files off the
 * Server Action request body, which has a size limit.
 */

type SaveResult = ActionResult<{ id: string }>;

/**
 * Pulls a schema's fields out of FormData, keeping repeated keys as arrays.
 *
 * A field submitted once arrives as a bare string even when it is conceptually
 * a list — one uploaded photograph, one colour. The list schemas in
 * `validations.ts` accept both shapes, so nothing needs special-casing here.
 */
function readForm<S extends z.ZodTypeAny>(schema: S, formData: FormData) {
  const raw: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};

  for (const key of new Set(formData.keys())) {
    const values = formData.getAll(key);
    raw[key] = values.length > 1 ? values : values[0];
  }

  return schema.safeParse(raw);
}

function invalid(error: z.ZodError): ActionResult<never> {
  return {
    ok: false,
    message: "Please correct the highlighted fields.",
    fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
  };
}

/** Tables whose rows are addressed by a slug. */
type SluggedTable = "products" | "categories" | "collections";

/**
 * Works out the URL slug for a row.
 *
 * The slug field in the editor is optional: left blank it is built from the
 * name, so adding a bolt of cloth never requires inventing a URL. Whichever
 * way it arrives, it then has to be unique — the column carries a unique
 * constraint, and two fabrics called "Ivory Lace" is an ordinary thing to
 * want. A collision appends -2, -3 and so on rather than rejecting the save.
 *
 * On an edit, the row's own slug is excluded from the check, or re-saving a
 * product without touching the name would rename it to `-2` every time.
 */
async function resolveSlug(
  db: NonNullable<Awaited<ReturnType<typeof requireStaff>>>,
  table: SluggedTable,
  typed: string | undefined,
  name: string,
  currentId?: string,
): Promise<string | null> {
  const base = slugify(typed?.trim() ? typed : name);
  if (!base) return null;

  const { data } = await db.from(table).select("id, slug").like("slug", `${base}%`);

  const taken = new Set(
    (data ?? [])
      .filter((row) => row.id !== currentId)
      .map((row) => row.slug as string),
  );

  if (!taken.has(base)) return base;

  for (let n = 2; n < 500; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }

  // 500 fabrics sharing one name is not a real case, but the save should
  // still succeed rather than loop or throw.
  return `${base}-${Date.now().toString(36)}`;
}

// ---------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------

export async function saveProduct(_prev: SaveResult | null, formData: FormData): Promise<SaveResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const parsed = readForm(productSchema, formData);
  if (!parsed.success) return invalid(parsed.error);

  const { id, ...values } = parsed.data;

  const slug = await resolveSlug(db, "products", values.slug, values.name, id || undefined);
  if (!slug) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: { name: ["A name with at least one letter or number is required"] },
    };
  }

  const row = { ...values, slug };

  const write = (payload: typeof row | Omit<typeof row, "videos">) =>
    id
      ? db.from("products").update(payload).eq("id", id).select("id, slug").single()
      : db.from("products").insert(payload).select("id, slug").single();

  let { data, error } = await write(row);

  // The `videos` column is added by a separate migration. If a deploy lands
  // before that migration is run, Postgres rejects the unknown column
  // (42703 / PostgREST PGRST204). Rather than block the shopkeeper, retry the
  // save without videos so the rest of the fabric still saves.
  if (error && (error.code === "42703" || error.code === "PGRST204")) {
    const { videos: _dropped, ...withoutVideos } = row;
    void _dropped;
    ({ data, error } = await write(withoutVideos));
  }

  if (error || !data) {
    return { ok: false, ...describeDbError(error, "Could not save that fabric.") };
  }

  revalidateProduct(data.slug);
  return {
    ok: true,
    message: id ? "Fabric updated." : "Fabric added to the catalogue.",
    data: { id: data.id },
  };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const { data: existing } = await db
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  const { error } = await db.from("products").delete().eq("id", productId);
  if (error) {
    // A product that has been ordered cannot be removed without destroying the
    // order history, so archiving is offered as the honest alternative.
    return {
      ok: false,
      message:
        error.code === "23503"
          ? "This fabric appears on an order, so it cannot be deleted. Archive it instead."
          : "Could not delete that fabric.",
    };
  }

  revalidateProduct(existing?.slug);
  return { ok: true, message: "Fabric deleted." };
}

/**
 * The storefront pages are cached, so an edit is invisible until they are
 * invalidated. Listing paths one by one missed things — the home page and the
 * individual `/collections/<slug>` pages in particular, which is why a newly
 * added fabric did not show up straight away.
 *
 * `revalidatePath("/", "layout")` purges every page under the root layout —
 * the entire storefront — in one call. For a shop this size that is the right
 * trade: a new or edited fabric appears everywhere immediately, and the pages
 * simply re-render on their next visit.
 */
function revalidateProduct(slug?: string | null) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/shop/${slug}`);
}

// ---------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------

export async function saveCategory(
  _prev: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const parsed = readForm(categorySchema, formData);
  if (!parsed.success) return invalid(parsed.error);

  const { id, ...values } = parsed.data;

  const slug = await resolveSlug(db, "categories", values.slug, values.name, id || undefined);
  if (!slug) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: { name: ["A name with at least one letter or number is required"] },
    };
  }

  const row = { ...values, slug };

  const { data, error } = id
    ? await db.from("categories").update(row).eq("id", id).select("id").single()
    : await db.from("categories").insert(row).select("id").single();

  if (error || !data) {
    return { ok: false, ...describeDbError(error, "Could not save that category.") };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Category updated." : "Category created.", data: { id: data.id } };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const { error } = await db.from("categories").delete().eq("id", categoryId);
  if (error) return { ok: false, message: "Could not delete that category." };

  // `category_id` is ON DELETE SET NULL, so the fabrics survive uncategorised.
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true, message: "Category deleted. Its fabrics are now uncategorised." };
}

// ---------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------

export async function saveCollection(
  _prev: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const parsed = readForm(collectionSchema, formData);
  if (!parsed.success) return invalid(parsed.error);

  const { id, ...values } = parsed.data;

  const slug = await resolveSlug(db, "collections", values.slug, values.name, id || undefined);
  if (!slug) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: { name: ["A name with at least one letter or number is required"] },
    };
  }

  const row = { ...values, slug };

  const { data, error } = id
    ? await db.from("collections").update(row).eq("id", id).select("id, slug").single()
    : await db.from("collections").insert(row).select("id, slug").single();

  if (error || !data) {
    return { ok: false, ...describeDbError(error, "Could not save that collection.") };
  }

  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: id ? "Collection updated." : "Collection created.",
    data: { id: data.id },
  };
}

export async function deleteCollection(collectionId: string): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const { error } = await db.from("collections").delete().eq("id", collectionId);
  if (error) return { ok: false, message: "Could not delete that collection." };

  revalidatePath("/admin/collections");
  revalidatePath("/", "layout");
  return { ok: true, message: "Collection deleted." };
}

// ---------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------

export async function saveGalleryItem(
  _prev: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const parsed = readForm(galleryItemSchema, formData);
  if (!parsed.success) return invalid(parsed.error);

  const { id, ...values } = parsed.data;

  const { data, error } = id
    ? await db.from("gallery_items").update(values).eq("id", id).select("id").single()
    : await db.from("gallery_items").insert(values).select("id").single();

  if (error || !data) {
    return { ok: false, ...describeDbError(error, "Could not save that photograph.") };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true, message: id ? "Photograph updated." : "Photograph added.", data: { id: data.id } };
}

export async function deleteGalleryItem(itemId: string): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const { error } = await db.from("gallery_items").delete().eq("id", itemId);
  if (error) return { ok: false, message: "Could not delete that photograph." };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true, message: "Photograph removed from the gallery." };
}

// ---------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------

const BUCKETS = ["products", "gallery", "blog"] as const;
type Bucket = (typeof BUCKETS)[number];

/**
 * Removes a file from Storage given its public URL.
 *
 * The browser could call `storage.remove()` directly, but it would only see
 * files its own RLS grant covers and would fail silently otherwise. Doing it
 * here means one consistent answer, and one place that refuses to touch
 * anything outside the three media buckets.
 */
export async function deleteMediaAsset(publicUrl: string): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const match = publicUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) {
    return { ok: false, message: "That image is bundled with the site, not uploaded — it cannot be deleted here." };
  }

  const [, bucket, path] = match;
  if (!BUCKETS.includes(bucket as Bucket)) return { ok: false, message: FORBIDDEN };

  const { error } = await db.storage.from(bucket).remove([decodeURIComponent(path)]);
  if (error) return { ok: false, message: "Could not delete that file." };

  revalidatePath("/admin/media");
  return { ok: true, message: "File deleted from storage." };
}
