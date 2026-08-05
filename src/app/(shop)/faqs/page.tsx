import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { faqGroups } from "@/data/content";
import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { FaqJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "How fabric is measured and sold, swatches, dye lots, delivery across Cameroon, returns on cut lengths, and wholesale accounts — answered plainly.",
  alternates: { canonical: "/faqs" },
};

const allItems = faqGroups.flatMap((group) => group.items);

export default function FaqsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Before you ask"
        title="Frequently asked questions"
        description="The questions we answer most often across the counter. If yours is not here, message us — we would rather answer it twice than have you guess."
        breadcrumbs={[{ name: "FAQs", href: "/faqs" }]}
      />

      <section className="section">
        <div className="container grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div className="space-y-14">
            {faqGroups.map((group, groupIndex) => (
              <Reveal key={group.title} delay={groupIndex * 0.05}>
                <h2 className="font-display text-2xl">{group.title}</h2>
                <span className="rule-gold mt-4 block" aria-hidden />

                <Accordion type="single" collapsible className="mt-6">
                  {group.items.map((item, i) => (
                    <AccordionItem key={item.q} value={`${group.title}-${i}`}>
                      <AccordionTrigger className="py-5 text-left font-display text-lg hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 text-[0.95rem] leading-relaxed text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-4xl border border-border/70 bg-card p-8">
              <h2 className="font-display text-xl">Still unsure?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Send a photograph of what you are making. We will tell you what fabric it needs,
                roughly how much, and what it will cost — usually the same day.
              </p>

              <div className="mt-7 grid gap-3">
                <Button asChild variant="luxe">
                  <a
                    href={whatsappLink(
                      siteConfig.contact.whatsapp,
                      "Hello YADIMS — I have a question that is not in your FAQs.",
                    )}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <MessageCircle /> WhatsApp us
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Send a message</Link>
                </Button>
              </div>

              <dl className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
                {siteConfig.contact.hours.map((slot) => (
                  <div key={slot.day} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{slot.day}</dt>
                    <dd className="text-right">{slot.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <FaqJsonLd items={allItems.map((item) => ({ q: item.q, a: item.a }))} />
    </>
  );
}
