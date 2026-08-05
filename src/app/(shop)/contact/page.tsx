import type { Metadata } from "next";
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { siteConfig } from "@/config/site";
import { publicEnv } from "@/lib/env";
import { whatsappLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit YADIMS Fabrics & Seams at Tam-Tam, opposite Bali Hotel in Yaoundé. WhatsApp, phone, email and opening hours, plus a form for recommendations and bulk enquiries.",
  alternates: { canonical: "/contact" },
};

/**
 * Google Maps embed. Falls back to a plain Maps link when no API key is set,
 * so the page is never broken by missing configuration.
 */
function MapEmbed() {
  const key = publicEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const query = encodeURIComponent(siteConfig.contact.mapQuery);

  if (!key) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-secondary/60 p-10 text-center">
        <MapPin className="h-8 w-8 text-brand-500" aria-hidden />
        <div>
          <p className="font-display text-xl">{siteConfig.contact.address.line1}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {siteConfig.contact.address.line2}, {siteConfig.contact.address.country}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${query}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open in Google Maps
          </a>
        </Button>
      </div>
    );
  }

  return (
    <iframe
      title={`Map showing ${siteConfig.name}`}
      src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${query}&zoom=16`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className="h-full w-full border-0"
    />
  );
}

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Fastest — same day in opening hours",
    href: whatsappLink(siteConfig.contact.whatsapp, "Hello YADIMS —"),
    external: true,
  },
  {
    icon: Phone,
    label: "Telephone",
    value: siteConfig.contact.phone,
    href: siteConfig.contact.phoneHref,
  },
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
  },
  {
    icon: MapPin,
    label: "The shop",
    value: `${siteConfig.contact.address.line1}, ${siteConfig.contact.address.line2}`,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.contact.mapQuery)}`,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Come and see us"
        title="Contact"
        description="A photograph cannot tell you how a fabric falls. Visit the shop, or send us a message and we will do our best to describe it honestly."
        breadcrumbs={[{ name: "Contact", href: "/contact" }]}
      />

      <section className="section">
        <div className="container grid gap-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <Reveal>
            <h2 className="font-display text-3xl">Send us a message</h2>
            <p className="mt-3 max-w-lg leading-relaxed text-muted-foreground">
              For recommendations, bulk quotes, wholesale accounts or special sourcing. The more
              detail you give us, the more useful the reply.
            </p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal preset="right" className="space-y-6">
            <div className="rounded-4xl border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="font-display text-xl">Reach us directly</h2>

              <ul className="mt-6 space-y-5">
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      {...(channel.external
                        ? { target: "_blank", rel: "noreferrer noopener" }
                        : {})}
                      className="group flex gap-4"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-colors duration-500 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-800/60 dark:text-brand-200">
                        <channel.icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          {channel.label}
                        </span>
                        <span className="mt-1 block break-words text-sm leading-snug group-hover:text-brand-600">
                          {channel.value}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-4xl border border-border/70 bg-card p-6 sm:p-8">
              <h2 className="flex items-center gap-2.5 font-display text-xl">
                <Clock className="h-4 w-4 text-brand-500" aria-hidden /> Opening hours
              </h2>
              <dl className="mt-5 space-y-3 text-sm">
                {siteConfig.contact.hours.map((slot) => (
                  <div key={slot.day} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{slot.day}</dt>
                    <dd className="text-right font-medium">{slot.time}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-4xl bg-brand-700 p-6 text-white sm:p-8">
              <h2 className="font-display text-xl">Follow the shop</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-white/70">
                New stock, fittings and delivery days.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Instagram"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/25 transition-all duration-500 hover:border-gold-400 hover:bg-gold-400 hover:text-brand-900"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Facebook"
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/25 transition-all duration-500 hover:border-gold-400 hover:bg-gold-400 hover:text-brand-900"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-label="Shop location" className="h-[26rem] w-full overflow-hidden md:h-[32rem]">
        <MapEmbed />
      </section>
    </>
  );
}
