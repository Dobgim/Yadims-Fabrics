"use server";

import { revalidatePath } from "next/cache";

import { FORBIDDEN, NOT_CONFIGURED, requireStaff } from "@/lib/admin-guard";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/validations";
import type { MessageStatus, OrderStatus } from "@/types/database";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const { error } = await db.from("orders").update({ status }).eq("id", orderId);
  if (error) return { ok: false, message: "Could not update that order." };

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/account/orders");
  return { ok: true, message: `Order marked ${status}.` };
}

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus,
): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const { error } = await db.from("contact_messages").update({ status }).eq("id", messageId);
  if (error) return { ok: false, message: "Could not update that message." };

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true, message: `Message marked ${status}.` };
}

export async function toggleProductStatus(
  productId: string,
  status: "draft" | "active" | "archived",
): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const { error } = await db.from("products").update({ status }).eq("id", productId);
  if (error) return { ok: false, message: "Could not update that product." };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true, message: `Product set to ${status}.` };
}

export async function togglePostStatus(
  postId: string,
  status: "draft" | "published",
): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const { error } = await db
    .from("blog_posts")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", postId);

  if (error) return { ok: false, message: "Could not update that article." };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { ok: true, message: status === "published" ? "Article published." : "Moved to drafts." };
}

export async function setSubscriberActive(
  subscriberId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const db = await requireStaff();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const { error } = await db
    .from("newsletter_subscribers")
    .update({ is_active: isActive })
    .eq("id", subscriberId);

  if (error) return { ok: false, message: "Could not update that subscriber." };

  revalidatePath("/admin/newsletter");
  return { ok: true, message: isActive ? "Subscriber reactivated." : "Subscriber unsubscribed." };
}

export async function updateCustomerRole(
  userId: string,
  role: "customer" | "staff" | "admin",
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: FORBIDDEN };

  // Role changes are admin-only — staff must not be able to promote themselves.
  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (me?.role !== "admin") return { ok: false, message: FORBIDDEN };

  const db = createAdminClient() ?? supabase;
  const { error } = await db.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, message: "Could not change that role." };

  revalidatePath("/admin/customers");
  return { ok: true, message: `Role set to ${role}.` };
}
