"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  contactSchema,
  newsletterSchema,
  type ActionResult,
} from "@/lib/validations";

export async function subscribeToNewsletter(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? "footer",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the email address.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  // Without a database we still accept the submission so the UI is testable;
  // the address is simply not persisted.
  if (!supabase) {
    return { ok: true, message: "You are on the list. Welcome to the house." };
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.email.toLowerCase(), source: parsed.data.source });

  // 23505 = unique violation. Already subscribed is a success from the user's view.
  if (error && error.code !== "23505") {
    return { ok: false, message: "We could not save that just now. Please try again." };
  }

  return { ok: true, message: "You are on the list. Welcome to the house." };
}

export async function submitContactMessage(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: true, message: "Message received. We reply within one working day." };
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    return { ok: false, message: "We could not send that just now. Please try WhatsApp." };
  }

  revalidatePath("/admin/messages");
  return { ok: true, message: "Message received. We reply within one working day." };
}
