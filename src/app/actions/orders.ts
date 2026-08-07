"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { calculateShipping, calculateTotals } from "@/lib/pricing";
import { getProductsByIds } from "@/lib/queries/products";
import { checkoutSchema, type ActionResult } from "@/lib/validations";

export interface CheckoutLineInput {
  productId: string;
  color: string | null;
  quantity: number;
}

export interface PlacedOrder {
  orderNumber: string;
  total: number;
  currency: string;
  email: string;
}

/**
 * Places an order.
 *
 * Prices are re-read from the catalogue server-side and never trusted from the
 * client, so a tampered cart cannot change what is charged.
 */
export async function placeOrder(
  raw: unknown,
  lines: CheckoutLineInput[],
): Promise<ActionResult<PlacedOrder>> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!lines.length) {
    return { ok: false, message: "Your cart is empty." };
  }

  const input = parsed.data;
  const products = await getProductsByIds(lines.map((l) => l.productId));
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = lines.flatMap((line) => {
    const product = byId.get(line.productId);
    if (!product) return [];
    const quantity = Math.max(1, Math.floor(line.quantity));
    return [
      {
        product_id: product.id,
        product_name: product.name,
        product_image_url: product.images[0] ?? null,
        color: line.color,
        unit_price: product.price,
        quantity,
        line_total: product.price * quantity,
      },
    ];
  });

  if (!items.length) {
    return { ok: false, message: "None of those fabrics are available. Please refresh the page." };
  }

  const currency = products[0]?.currency ?? "XAF";
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const shipping = calculateShipping(subtotal, input.city, input.deliveryMethod);
  const totals = calculateTotals(subtotal, shipping);

  const shippingAddress = {
    label: input.label,
    full_name: input.fullName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 || null,
    city: input.city,
    region: input.region || null,
    country: input.country,
    postal_code: input.postalCode || null,
    delivery_method: input.deliveryMethod,
  };

  const supabase = await createClient();

  // Without a database the order cannot be persisted, but the customer still
  // gets a reference so they can follow up on WhatsApp.
  if (!supabase) {
    return {
      ok: true,
      message: "Order received.",
      data: {
        orderNumber: `YF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        total: totals.total,
        currency,
        email: input.email,
      },
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      customer_name: input.fullName,
      customer_email: input.email.toLowerCase(),
      customer_phone: input.phone,
      shipping_address: shippingAddress,
      subtotal: totals.subtotal,
      shipping_fee: totals.shipping,
      discount: totals.discount,
      total: totals.total,
      currency,
      payment_method: input.paymentMethod,
      notes: input.notes || null,
    })
    .select("id, order_number, total, currency")
    .single();

  if (orderError || !order) {
    return { ok: false, message: "We could not place that order. Please try WhatsApp." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    // Roll back the header so we never keep an order with no lines.
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, message: "We could not save your items. Please try again." };
  }

  revalidatePath("/admin/orders");

  return {
    ok: true,
    message: "Order received.",
    data: {
      orderNumber: order.order_number,
      total: order.total,
      currency: order.currency,
      email: input.email,
    },
  };
}
