"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  addressSchema,
  profileSchema,
  resetRequestSchema,
  signInSchema,
  signUpSchema,
  type ActionResult,
} from "@/lib/validations";

const NO_DB =
  "Authentication is not configured yet. Add your Supabase keys to .env.local to enable accounts.";

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
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

  const next = String(formData.get("next") || "/account");
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    marketingOptIn: formData.get("marketingOptIn") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: NO_DB };

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (parsed.data.marketingOptIn) {
    await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.email.toLowerCase(), source: "signup" });
  }

  return {
    ok: true,
    message: "Check your email to confirm your address, then sign in.",
  };
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
    redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/account/settings`,
  });

  // Always report success — otherwise this becomes an account-existence oracle.
  return {
    ok: true,
    message: "If that address has an account, a reset link is on its way.",
  };
}

export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
    marketingOptIn: formData.get("marketingOptIn") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: NO_DB };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You are not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      marketing_opt_in: parsed.data.marketingOptIn,
    })
    .eq("id", user.id);

  if (error) return { ok: false, message: "We could not save those changes." };

  revalidatePath("/account", "layout");
  return { ok: true, message: "Profile updated." };
}

export async function saveAddress(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = addressSchema.safeParse({
    label: formData.get("label") || "Home",
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2") ?? "",
    city: formData.get("city"),
    region: formData.get("region") ?? "",
    country: formData.get("country") || "Cameroon",
    postalCode: formData.get("postalCode") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: NO_DB };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You are not signed in." };

  const makeDefault = formData.get("isDefault") === "on";
  const addressId = formData.get("addressId");

  // Only one default per customer.
  if (makeDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const payload = {
    user_id: user.id,
    label: parsed.data.label,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || null,
    city: parsed.data.city,
    region: parsed.data.region || null,
    country: parsed.data.country,
    postal_code: parsed.data.postalCode || null,
    is_default: makeDefault,
  };

  const { error } = addressId
    ? await supabase.from("addresses").update(payload).eq("id", String(addressId))
    : await supabase.from("addresses").insert(payload);

  if (error) return { ok: false, message: "We could not save that address." };

  revalidatePath("/account/addresses");
  return { ok: true, message: addressId ? "Address updated." : "Address saved." };
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const id = String(formData.get("addressId") ?? "");
  if (!id) return;

  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("addresses").delete().eq("id", id);
  revalidatePath("/account/addresses");
}
