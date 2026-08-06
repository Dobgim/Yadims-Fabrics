import type { Metadata } from "next";
import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import * as Icons from "lucide-react";

import { services, whyChooseUs } from "@/data/company";
import { sceneImages as S } from "@/data/images";
import { siteConfig } from "@/config/site";
import { cn, whatsappLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { WhyChooseUs } from "@/components/shared/why-choose-us";
import { ContactBanner } from "@/components/shared/contact-banner";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Fabric sales, wholesale supply, bulk and aso-ebi coordination, fashion consultation, recommendations and special sourcing from YADIMS Fabrics & Seams.",
  alternates: { canonical: "/services" },
};

function ServiceIcon({ name }: { name: string }) {
  const Component = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Sparkles;
  return <Component className="h-5 w-5" aria-hidden />;
}

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What we do"
        title="Services"
        description="Six ways we work with customers — from a single yard cut over the counter to a five-hundred-metre uniform contract. All of them start with the same conversation about what the cloth has to do."
        breadcrumbs={[{ name: "Services", href: "/services" }]}
        image={S.shop1}
      />

      {/* Overview cards */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="At a glance"
            title="Six services, one counter"
            description="Nothing here carries a hidden fee. Where a service costs something, the price is stated and it is credited against your order."
            className="mb-14"
          />

          {/*
            Each card pairs its photograph with the copy: image on the left,
            text on the right, so the eye can scan either column on its own.
          */}
          <div className="grid gap-5 lg:grid-cols-2">
            {services.map((service, i) => (
              <Reveal key={service.slug} delay={(i % 2) * 0.07}>
                {/*
                  Stacked below `sm` — a 38% image column beside text is far
                  too narrow on a phone for either half to be legible.
                */}
                <a
                  href={`#${service.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-4xl border border-border/70 bg-card transition-all duration-500 ease-luxe hover:-translate-y-1 hover:shadow-lift sm:flex-row"
                >
                  <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:w-2/5">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 16rem, (min-width: 640px) 40vw, 100vw"
                      className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
                    />
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-transparent to-card/25"
                      aria-hidden
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-colors duration-500 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-800/60 dark:text-brand-200">
                      <ServiceIcon name={service.icon} />
                    </span>

                    <h3 className="mt-5 font-display text-xl leading-snug">{service.title}</h3>

                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {service.summary}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-sm text-brand-600 transition-transform duration-500 ease-luxe group-hover:translate-x-1">
                      Read more <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed alternating sections */}
      <section className="border-t border-border">
        {services.map((service, i) => (
          <div
            key={service.slug}
            id={service.slug}
            className={cn("scroll-mt-24 py-20 md:py-28", i % 2 === 1 && "bg-secondary/50")}
          >
            <div className="container">
              <div
                className={cn(
                  "grid items-center gap-12 lg:grid-cols-2 lg:gap-20",
                  i % 2 === 1 && "lg:[&>*:first-child]:order-2",
                )}
              >
                <Reveal preset="reveal">
                  <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-muted">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 45vw, 92vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>

                <Reveal preset={i % 2 === 1 ? "left" : "right"}>
                  <p className="eyebrow">Service {String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-4 text-display-sm">{service.title}</h2>
                  <span className="rule-gold mt-6 block" aria-hidden />
                  <p className="mt-6 text-[1.0625rem] leading-relaxed text-muted-foreground">
                    {service.detail}
                  </p>

                  <ul className="mt-8 space-y-3">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9 flex flex-wrap gap-3">
                    <Button asChild variant="luxe">
                      <a
                        href={whatsappLink(
                          siteConfig.contact.whatsapp,
                          `Hello YADIMS — I would like to ask about ${service.title}.`,
                        )}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <MessageCircle /> Enquire
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/contact">
                        Book a visit <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Why YADIMS"
            title="What a family shop can do that a warehouse cannot"
            className="mb-16"
          />
          <WhyChooseUs items={whyChooseUs} />
        </div>
      </section>

      <ContactBanner />
    </>
  );
}
