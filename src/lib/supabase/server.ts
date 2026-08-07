import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getServiceRoleKey, isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Anonymous, session-less client. No cookies, so it can be used where there is
 * no request at all — `generateStaticParams` runs at build time and calling
 * `cookies()` there is a hard error.
 *
 * It sees exactly what a logged-out visitor sees. Every storefront query
 * already filters to public rows itself (`status = 'active'`,
 * `is_published = true`), so build-time reads return the same catalogue a
 * request-time read would.
 */
export function createStaticClient() {
  if (!isSupabaseConfigured) return null;

  return createSupabaseClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/**
 * Request-scoped Supabase client for Server Components, Route Handlers and
 * Server Actions. Returns `null` when credentials are absent.
 *
 * Cookie writes throw inside Server Components (they are read-only there);
 * that case is swallowed because `proxy.ts` already refreshes the session.
 *
 * When there is no request to read cookies from — build-time static param
 * collection — it degrades to the anonymous client rather than throwing. The
 * queries that reach here in that situation are public catalogue reads, so the
 * absent session costs nothing.
 */
export async function createClient() {
  if (!isSupabaseConfigured) return null;

  let cookieStore: Awaited<ReturnType<typeof cookies>>;
  try {
    cookieStore = await cookies();
  } catch {
    return createStaticClient();
  }

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
