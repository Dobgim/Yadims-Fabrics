import { z } from "zod";

/**
 * Validated environment access.
 *
 * Client-side vars are read from a literal `process.env.X` reference so Next's
 * bundler can statically inline them — never index `process.env` dynamically.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default(""),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().default(""),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default("237677693901"),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    "http://localhost:3000",
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "237677693901",
});

/**
 * True when Supabase credentials are present. The whole site is designed to
 * render from curated fallback content when this is false, so the project can
 * be run, reviewed and deployed before the database is provisioned.
 */
export const isSupabaseConfigured =
  publicEnv.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

export function getServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}
