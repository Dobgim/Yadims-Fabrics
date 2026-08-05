"use client";

import { createBrowserClient } from "@supabase/ssr";

import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let cached: BrowserClient | null = null;

/**
 * Browser Supabase client. Returns `null` when the project has no credentials
 * yet so UI can degrade gracefully instead of throwing during render.
 */
export function createClient(): BrowserClient | null {
  if (!isSupabaseConfigured) return null;
  if (cached) return cached;

  cached = createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return cached;
}
