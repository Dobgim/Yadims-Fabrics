import Link from "next/link";

import { formatDate } from "@/lib/utils";
import { footerNav } from "@/config/site";
import { PageHeader } from "@/components/shared/page-header";
import type { LegalDocument } from "@/data/legal";

/** Shared renderer for all four policy documents. */
export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <PageHeader
        eyebrow={document.eyebrow}
        title={document.title}
        description={document.summary}
        breadcrumbs={[{ name: document.title, href: `/${document.slug}` }]}
      />

      <section className="section">
        <div className="container grid gap-14 lg:grid-cols-[16rem_1fr] lg:gap-20">
          {/* In-page contents + sibling policies */}
          <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow">Contents</p>
            <ol className="mt-5 space-y-2.5 text-sm">
              {document.sections.map((section, i) => (
                <li key={section.heading}>
                  <a
                    href={`#section-${i}`}
                    className="link-underline text-muted-foreground hover:text-foreground"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>

            <p className="eyebrow mt-12">Other policies</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {footerNav.care
                .filter((link) => link.href !== `/${document.slug}` && link.href !== "/faqs")
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-underline text-muted-foreground hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>

          <article className="max-w-2xl">
            <p className="text-sm text-muted-foreground">
              Last updated {formatDate(document.updated)}
            </p>

            <div className="mt-10 space-y-12">
              {document.sections.map((section, i) => (
                <section key={section.heading} id={`section-${i}`} className="scroll-mt-28">
                  <h2 className="font-display text-2xl">{section.heading}</h2>
                  <span className="rule-gold mt-4 block" aria-hidden />
                  <div className="mt-5 space-y-4">
                    {section.body.map((paragraph, j) => (
                      <p key={j} className="leading-[1.85] text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-14 rounded-4xl bg-secondary/60 p-8">
              <h2 className="font-display text-xl">Questions about this policy?</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                Write to hello@yadimsfabrics.com or message us on WhatsApp. A real person reads
                every one.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex text-sm text-brand-600 link-underline"
              >
                Get in touch
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
