import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import type { CheckoutInput } from "@/lib/validations";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Pre-fill from the signed-in profile and default address when we have them.
  const supabase = await createClient();
  let defaults: Partial<CheckoutInput> = {};

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [{ data: profile }, { data: address }] = await Promise.all([
        supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).maybeSingle(),
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_default", true)
          .maybeSingle(),
      ]);

      defaults = {
        fullName: address?.full_name ?? profile?.full_name ?? "",
        email: profile?.email ?? user.email ?? "",
        phone: address?.phone ?? profile?.phone ?? "",
        ...(address
          ? {
              label: address.label,
              line1: address.line1,
              line2: address.line2 ?? "",
              city: address.city,
              region: address.region ?? "",
              country: address.country,
              postalCode: address.postal_code ?? "",
            }
          : {}),
      };
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Final step"
        title="Checkout"
        description="We confirm every order by WhatsApp before cutting, so nothing is committed until you have spoken to a person."
        breadcrumbs={[
          { name: "Cart", href: "/cart" },
          { name: "Checkout", href: "/checkout" },
        ]}
      />

      <section className="section">
        <div className="container">
          <CheckoutForm defaults={defaults} />
        </div>
      </section>
    </>
  );
}
