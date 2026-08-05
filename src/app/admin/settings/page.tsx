import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { siteConfig } from "@/config/site";
import { publicEnv } from "@/lib/env";
import { formatPrice } from "@/lib/utils";
import {
  DELIVERY_FEE_LOCAL,
  DELIVERY_FEE_NATIONAL,
  FREE_DELIVERY_THRESHOLD,
} from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = { title: "Settings" };

/**
 * Store configuration is code-owned rather than database-owned: these values
 * are read at build time by the storefront, the checkout and the order record,
 * so a single source in `src/config` and `src/lib/pricing` keeps them honest.
 */
export default function AdminSettingsPage() {
  const groups = [
    {
      title: "Store identity",
      file: "src/config/site.ts",
      rows: [
        { label: "Name", value: siteConfig.name },
        { label: "Tagline", value: siteConfig.tagline },
        { label: "Currency", value: siteConfig.currency },
        { label: "Site URL", value: siteConfig.url },
      ],
    },
    {
      title: "Contact",
      file: "src/config/site.ts",
      rows: [
        { label: "Email", value: siteConfig.contact.email },
        { label: "Orders email", value: siteConfig.contact.salesEmail },
        { label: "Phone", value: siteConfig.contact.phone },
        { label: "WhatsApp", value: siteConfig.contact.whatsapp },
        {
          label: "Address",
          value: `${siteConfig.contact.address.line1}, ${siteConfig.contact.address.line2}`,
        },
      ],
    },
    {
      title: "Delivery",
      file: "src/lib/pricing.ts",
      rows: [
        { label: "Free over (Yaoundé)", value: formatPrice(FREE_DELIVERY_THRESHOLD) },
        { label: "Yaoundé fee", value: formatPrice(DELIVERY_FEE_LOCAL) },
        { label: "National fee", value: formatPrice(DELIVERY_FEE_NATIONAL) },
        { label: "Collection", value: "Free" },
      ],
    },
    {
      title: "Integrations",
      file: ".env.local",
      rows: [
        {
          label: "Supabase",
          value: publicEnv.NEXT_PUBLIC_SUPABASE_URL ? "Connected" : "Not configured",
        },
        {
          label: "Google Maps",
          value: publicEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            ? "Key present"
            : "No key — map falls back to a link",
        },
        {
          label: "Service role key",
          value: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Present" : "Missing (RLS-scoped reads)",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        description="These values are read directly by the storefront, the checkout and every order record. Change them in the files listed and redeploy."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title} className="rounded-3xl border border-border bg-card p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl">{group.title}</h3>
              <code className="rounded bg-secondary px-2 py-1 text-xs text-muted-foreground">
                {group.file}
              </code>
            </div>

            <Separator className="my-5" />

            <dl className="space-y-3.5 text-sm">
              {group.rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-6">
                  <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="rounded-3xl border border-border bg-card p-7">
        <h3 className="font-display text-xl">Policies</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The four customer-facing policies are authored in{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">src/data/legal.ts</code> and
          rendered by a shared component, so wording and the &ldquo;last updated&rdquo; date stay
          consistent across all of them.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {["privacy-policy", "shipping-policy", "return-policy", "terms"].map((slug) => (
            <Button key={slug} asChild variant="outline" size="sm">
              <Link href={`/${slug}`} target="_blank">
                {slug.replace(/-/g, " ")} <ExternalLink />
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
