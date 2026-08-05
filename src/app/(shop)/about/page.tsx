import type { Metadata } from "next";
import { SafeImage as Image } from "@/components/shared/safe-image";
import { Compass, Eye, Target } from "lucide-react";

import { coreValues, storeStats, timeline, whyChooseUs } from "@/data/company";
import { shopPhotos } from "@/data/images";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { WhyChooseUs } from "@/components/shared/why-choose-us";
import { ContactBanner } from "@/components/shared/contact-banner";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "YADIMS Fabrics & Seams opened in Yaoundé in 2026 on a single rule: only sell fabric we would sew with ourselves, and publish the numbers that prove it.",
  alternates: { canonical: "/about" },
};

const storePhotos = [
  { src: shopPhotos.boltWall, caption: "The shelves, sorted every Monday" },
  { src: shopPhotos.laceShelves, caption: "The lace corner" },
  { src: shopPhotos.mannequin, caption: "Draped on the stand, tape alongside" },
  { src: shopPhotos.displayWall, caption: "Lengths held for collection" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Since 2026"
        title="A family shop that never wanted to be a warehouse"
        description="We opened on a single rule: only sell fabric we would sew with ourselves, and publish the numbers that let you check."
        breadcrumbs={[{ name: "About", href: "/about" }]}
        image={shopPhotos.boltWall}
      />

      {/* Story */}
      <section className="section">
        <div className="container grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal preset="reveal">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted">
              <Image
                src={shopPhotos.displayWall}
                alt="The YADIMS shop at Tam-Tam, opposite Bali Hotel"
                fill
                sizes="(min-width: 1024px) 45vw, 92vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal preset="right" className="flex flex-col justify-center">
            <p className="eyebrow">Our story</p>
            <h2 className="mt-4 text-display-md">
              Why we opened
            </h2>
            <span className="rule-gold mt-7 block" aria-hidden />

            <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.85] text-muted-foreground">
              <p>
                We opened in 2026 because we had spent years on the other side of the counter,
                buying cloth that turned out to be nothing like the photograph. Nobody would tell
                us the weight. Nobody would name the mill. You found out what you had bought at
                the fitting, which is the worst possible moment.
              </p>
              <p>
                So this shop is built the other way round. We publish weight, width, fibre content
                and origin on every single listing, because those four numbers decide whether a
                fabric can do what your design asks of it. We buy directly from mills in Como,
                Lyon, Abeokuta and Hangzhou rather than through importers, which is why our
                premium cloth sits below imported equivalents.
              </p>
              <p>
                And we will talk you out of the expensive bolt when the cheaper one is right. We
                are new, and we know exactly what we are asking of you in trusting a new shop with
                a wedding. The only way to earn that is to be right about the cloth, every time.
              </p>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-9 sm:grid-cols-4">
              {storeStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl text-brand-600">{stat.value}</span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="section bg-brand-900 text-white">
        <div className="container grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Mission",
              body: "To put genuinely good cloth within reach of the people who sew in this city — honestly described, fairly priced, and explained by someone who knows what it will do.",
            },
            {
              icon: Eye,
              title: "Vision",
              body: "To be the house West African designers name first when asked where their fabric comes from — and to still be a family shop when they say it.",
            },
            {
              icon: Compass,
              title: "Promise",
              body: "The numbers on the label are true, the origin is real, and if a fabric will not do what you need, we will say so before you buy it.",
            },
          ].map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <article className="h-full rounded-4xl border border-white/12 bg-white/[0.04] p-9 backdrop-blur-sm">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-400/15 text-gold-400">
                  <card.icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-7 font-display text-2xl text-white">{card.title}</h2>
                <p className="mt-4 leading-relaxed text-white/65">{card.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="How we got here"
            title="How we got to opening day"
            className="mb-16"
          />

          <ol className="relative mx-auto max-w-3xl">
            <span
              className="absolute left-[0.4375rem] top-2 h-[calc(100%-1rem)] w-px bg-border md:left-1/2 md:-translate-x-1/2"
              aria-hidden
            />

            {timeline.map((entry, i) => (
              <Reveal
                key={entry.title}
                as="li"
                delay={i * 0.06}
                className="relative pb-12 pl-10 last:pb-0 md:pl-0"
              >
                <span
                  className="absolute left-0 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-gold-400 bg-background md:left-1/2 md:-translate-x-1/2"
                  aria-hidden
                />

                <div
                  className={
                    i % 2 === 0
                      ? "md:mr-auto md:w-[calc(50%-2.5rem)] md:text-right"
                      : "md:ml-auto md:w-[calc(50%-2.5rem)]"
                  }
                >
                  <p className="font-display text-2xl text-gold-500">{entry.year}</p>
                  <h3 className="mt-2 font-display text-xl">{entry.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {entry.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-secondary/50">
        <div className="container">
          <SectionHeading
            eyebrow="What we hold to"
            title="Core values"
            description="Four commitments that decide what we stock, what we charge, and what we refuse."
            className="mb-14"
          />

          <div className="grid gap-5 md:grid-cols-2">
            {coreValues.map((value, i) => (
              <Reveal key={value.title} delay={(i % 2) * 0.08}>
                <article className="h-full rounded-4xl border border-border/70 bg-card p-9">
                  <span className="font-display text-4xl text-gold-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-2xl">{value.title}</h3>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{value.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Store photos */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="The shop"
            title="Where all of this happens"
            className="mb-14"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {storePhotos.map((photo, i) => (
              <Reveal key={photo.src} delay={i * 0.06}>
                <figure className="group">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted">
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      sizes="(min-width: 1024px) 24vw, 45vw"
                      className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm text-muted-foreground">
                    {photo.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-secondary/50">
        <div className="container">
          <SectionHeading
            eyebrow="Why YADIMS"
            title="Four reasons customers come back"
            className="mb-16"
          />
          <WhyChooseUs items={whyChooseUs} />
        </div>
      </section>

      <ContactBanner />
    </>
  );
}
