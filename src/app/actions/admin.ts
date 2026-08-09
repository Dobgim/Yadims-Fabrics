"use server";

import { revalidatePath } from "next/cache";

import { NOT_CONFIGURED, requireStaff } from "@/lib/admin-guard";
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

  // Draft or archived takes it off the shop, active puts it back.
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true, message: `Product set to ${status}.` };
}
