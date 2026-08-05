import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getServiceRoleKey, isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Request-scoped Supabase client for Server Components, Route Handlers and
 * Server Actions. Returns `null` when credentials are absent.
 *
 * Cookie writes throw inside Server Components (they are read-only there);
 * that case is swallowed because `middleware.ts` already refreshes the session.
 */
export async function createClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware owns the refresh.
          }
        },
      },
    },
  );
}

/**
 * Service-role client. Bypasses RLS — server-only, never pass to the client.
 * Used by admin flows that must read across every customer's rows.
 */
export function createAdminClient() {
  const serviceKey = getServiceRoleKey();
  if (!isSupabaseConfigured || !serviceKey) return null;

  return createSupabaseClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
