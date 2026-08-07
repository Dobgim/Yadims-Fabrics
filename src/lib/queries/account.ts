import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

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
