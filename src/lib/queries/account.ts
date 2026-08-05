import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { AddressRow, OrderItemRow, OrderRow, ProfileRow } from "@/types/database";

export interface SessionContext {
  userId: string;
  email: string;
  profile: ProfileRow | null;
}

/** Current user plus profile row, or `null` when signed out / unconfigured. */
export const getSession = cache(async (): Promise<SessionContext | null> => {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? profile?.email ?? "",
    profile: (profile as ProfileRow) ?? null,
  };
});

export type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };

export async function getMyOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const session = await getSession();
  if (!supabase || !session) return [];

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  return (data as OrderWithItems[]) ?? [];
}

export async function getMyAddresses(): Promise<AddressRow[]> {
  const supabase = await createClient();
  const session = await getSession();
  if (!supabase || !session) return [];

  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", session.userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (data as AddressRow[]) ?? [];
}
