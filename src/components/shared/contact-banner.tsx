import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";

import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ContactBanner() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* House green over the drawn drape — no photograph, since the only
          photographs on this site are ones the shop took itself. */}
      <div className="absolute inset-0 -z-10 bg-brand-900" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-[url('/brand/fabric-backdrop.svg')] bg-cover bg-center opacity-25"
        aria-hidden
      />

      <div className="container flex flex-col items-center gap-9 py-24 text-center text-white md:py-32">
        <p className="eyebrow text-gold-400">Come and feel the cloth</p>

        <h2 className="max-w-3xl text-display-md text-white">
          A photograph cannot tell you how a fabric falls
        </h2>

        <p className="max-w-xl text-lg leading-relaxed text-white/70">
          Visit us at Tam-Tam, opposite Bali Hotel, or send a picture of what you are making and we
          will suggest two or three fabrics — usually the same day.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" variant="gold">
            <a
              href={whatsappLink(
                siteConfig.contact.whatsapp,
                "Hello YADIMS — I would like a fabric recommendation.",
              )}
              target="_blank"
              rel="noreferrer noopener"
            >
              <MessageCircle /> Message on WhatsApp
            </a>
          </Button>

          <Button asChild size="lg" variant="glass">
            <a href={siteConfig.contact.phoneHref}>
              <Phone /> {siteConfig.contact.phone}
            </a>
          </Button>

          <Button asChild size="lg" variant="glass">
            <Link href="/contact">
              Visit the shop <ArrowRight />
            </Link>
          </Button>
        </div>

        <dl className="mt-6 grid gap-x-12 gap-y-3 text-sm text-white/60 sm:grid-cols-3">
          {siteConfig.contact.hours.map((slot) => (
            <div key={slot.day} className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-[0.16em] text-white/40">{slot.day}</dt>
              <dd>{slot.time}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
