"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  resetRequestSchema,
  signInSchema,
  type ActionResult,
} from "@/lib/validations";

const NO_DB =
  "Authentication is not configured yet. Add your Supabase keys to .env.local to enable accounts.";

export async function signIn(
  _prev: ActionResult<{ next: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ next: string }>> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check your details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: NO_DB };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Deliberately vague: never reveal whether an address is registered.
    return { ok: false, message: "That email and password do not match an account." };
  }

  const next = String(formData.get("next") || "/admin");

  // The signed-in header and the dashboard both read the session, so the
  // cached layout has to go.
  revalidatePath("/", "layout");

  // Deliberately not `redirect()` here. Redirecting out of a Server Action
  // that has just written the auth cookie proved unreliable: the browser was
  // left on the sign-in page, and in some orderings the cookie did not stick
  // at all — a shopkeeper typing the right password and seeing nothing happen.
  // Returning the destination and navigating on the client is one plain step
  // and always lands.
  return { ok: true, message: "Signed in.", data: { next } };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter a valid email address.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: NO_DB };

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/admin`,
  });

  // Always report success — otherwise this becomes an account-existence oracle.
  return {
    ok: true,
    message: "If that address has an account, a reset link is on its way.",
  };
}
