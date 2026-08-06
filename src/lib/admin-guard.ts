import "server-only";

import { createAdminClient, createClient } from "@/lib/supabase/server";

export const NOT_CONFIGURED = "Connect Supabase to make changes.";
export const FORBIDDEN = "You do not have permission to do that.";

/**
 * Confirms the caller is staff before any privileged write, and hands back a
 * client to write with.
 *
 * The proxy already guards the `/admin` route, but a Server Action is a POST to
 * whatever route hosts it — it can be invoked directly, without ever loading an
 * admin page. So the role is checked again here, against the session rather
 * than the request path.
 *
 * The service-role client is preferred for the write itself so cross-customer
 * rows are reachable; it falls back to the caller's own RLS-scoped client,
 * which the staff policies already permit.
 */
export async function requireStaff() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) return null;

  return createAdminClient() ?? supabase;
}

/** As `requireStaff`, but rejects the `staff` role. Use for destructive writes. */
export async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return null;

  return createAdminClient() ?? supabase;
}

/**
 * Turns a Postgres error into something a shopkeeper can act on.
 * 23505 is a unique violation — in this schema that is almost always the slug
 * or the SKU, both of which the editor exposes as editable fields.
 */
export function describeDbError(
  error: { code?: string; message?: string } | null,
  fallback: string,
): { message: string; fieldErrors?: Record<string, string[]> } {
  if (!error) return { message: fallback };

  if (error.code === "23505") {
    const field = error.message?.includes("sku") ? "sku" : "slug";
    return {
      message:
        field === "sku"
          ? "That SKU is already used by another product."
          : "That URL slug is already taken. Try a different one.",
      fieldErrors: { [field]: ["Already in use"] },
    };
  }

  if (error.code === "23503") {
    return { message: "That category or collection no longer exists. Pick another." };
  }

  return { message: fallback };
}
