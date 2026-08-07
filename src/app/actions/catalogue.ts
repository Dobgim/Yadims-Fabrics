"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import { FORBIDDEN, NOT_CONFIGURED, describeDbError, requireStaff } from "@/lib/admin-guard";
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

// ---------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------

export async function saveProduct(_prev: SaveResult | null, formData: FormData): Promise<SaveResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const parsed = readForm(productSchema, formData);
  if (!parsed.success) return invalid(parsed.error);

  const { id, ...values } = parsed.data;

  const { data, error } = id
    ? await db.from("products").update(values).eq("id", id).select("id, slug").single()
    : await db.from("products").insert(values).select("id, slug").single();

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

function revalidateProduct(slug?: string | null) {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath("/");
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

  const { data, error } = id
    ? await db.from("categories").update(values).eq("id", id).select("id").single()
    : await db.from("categories").insert(values).select("id").single();

  if (error || !data) {
    return { ok: false, ...describeDbError(error, "Could not save that category.") };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
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
  revalidatePath("/shop");
  revalidatePath("/");
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

  const { data, error } = id
    ? await db.from("collections").update(values).eq("id", id).select("id, slug").single()
    : await db.from("collections").insert(values).select("id, slug").single();

  if (error || !data) {
    return { ok: false, ...describeDbError(error, "Could not save that collection.") };
  }

  revalidatePath("/admin/collections");
  revalidatePath("/collections");
  revalidatePath(`/collections/${data.slug}`);
  revalidatePath("/");
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
  revalidatePath("/collections");
  revalidatePath("/");
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
