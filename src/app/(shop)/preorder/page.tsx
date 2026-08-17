import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, HandCoins, PackageCheck } from "lucide-react";

import { getPreorderProducts } from "@/lib/queries/products";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ProductGrid } from "@/components/shop/product-grid";
import { ContactBanner } from "@/components/shared/contact-banner";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Pre-Order Fabrics",
  description:
    "Reserve made-to-order cloth from YADIMS. Pre-order fabrics are brought in specially — reserve yours with a 60% deposit and we bring it in for you.",
  alternates: { canonical: "/preorder" },
};

const STEPS = [
  {
    icon: PackageCheck,
    title: "Choose your fabric",
    body: "Browse the pre-order fabrics below and message us about the one you want, in the colour and quantity you need.",
  },
  {
    icon: HandCoins,
    title: "Reserve with a 60% deposit",
    body: "We confirm the price on WhatsApp. A 60% deposit reserves your length; the balance is settled when it arrives.",
  },
  {
    icon: Clock,
    title: "We bring it in",
    body: "Your cloth is sourced and set aside for you — no risk of it selling out while it is on its way.",
  },
];

export default async function PreorderPage() {
  const products = await getPreorderProducts();

  return (
    <>
      <PageHeader
        eyebrow="Reserved to order"
        title="Pre-order fabrics"
        description="Some of the finest cloth is brought in to order. Reserve the fabric you want with a 60% deposit and we source it for you — the balance is settled when it arrives."
        breadcrumbs={[{ name: "Pre-order", href: "/preorder" }]}
      />

      <section className="section">
        <div className="container">
          <div className="mb-16 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-3xl border border-border bg-card p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-100 text-brand-900 dark:bg-gold-400/20 dark:text-gold-200">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>

          {products.length ? (
            <>
              <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">
                    {products.length}
                  </span>{" "}
                  {products.length === 1 ? "fabric" : "fabrics"} available to pre-order
                </p>
                <Button asChild variant="link">
                  <Link href="/shop">
                    Browse the full shelf <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <ProductGrid products={products} columns={3} priorityCount={3} />
            </>
          ) : (
            <div className="rounded-4xl border border-dashed border-border py-24 text-center">
              <p className="font-display text-2xl">Nothing on pre-order just now</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                There is a length you are after, tell us — we will source it and hold it for you
                with a deposit.
              </p>
              <Button asChild variant="luxe" className="mt-7">
                <Link href="/contact">Ask us to source a fabric</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <ContactBanner />
    </>
  );
}
