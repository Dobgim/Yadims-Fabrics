import type { Metadata } from "next";
import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getAllProducts, getCollections } from "@/lib/queries/products";
import { shopPhotos } from "@/data/images";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { ContactBanner } from "@/components/shared/contact-banner";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Seven house collections — Luxury Lace, Wedding, Traditional, Evening, Bridal, Premium and New Arrivals. Each grouped by what the cloth is actually for.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([getCollections(), getAllProducts()]);

  const countFor = (collectionId: string) =>
    products.filter((p) => p.collection_id === collectionId).length;

  return (
    <>
      <PageHeader
        eyebrow="Grouped by purpose"
        title="The collections"
        description="We group fabric by what it is for, not by what it is made of. A bride does not need a fibre taxonomy — she needs the eleven bolts that will actually work for her gown."
        breadcrumbs={[{ name: "Collections", href: "/collections" }]}
        image={shopPhotos.laceShelves}
      />

      <section className="section">
        <div className="container grid gap-6 md:grid-cols-2 lg:gap-8">
          {collections.map((collection, i) => {
            const count = countFor(collection.id);
            // The first two tiles run full-bleed to open the page.
            const wide = i < 2;

            return (
              <Reveal
                key={collection.id}
                delay={(i % 2) * 0.08}
                className={wide ? "md:col-span-2" : undefined}
              >
                <Link
                  href={`/collections/${collection.slug}`}
                  className="group relative block overflow-hidden rounded-[2rem] bg-brand-900"
                >
                  <div className={wide ? "relative aspect-[16/10] md:aspect-[21/9]" : "relative aspect-[4/3]"}>
                    {collection.cover_image_url ? (
                      <Image
                        src={collection.cover_image_url}
                        alt=""
                        fill
                        sizes={wide ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                        className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.07]"
                      />
                    ) : null}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/30 to-transparent"
                      aria-hidden
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 md:p-9">
                    <div className="max-w-lg">
                      <p className="text-eyebrow font-medium uppercase text-gold-400">
                        {count} {count === 1 ? "fabric" : "fabrics"}
                      </p>
                      <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
                        {collection.name}
                      </h2>
                      {collection.tagline ? (
                        <p className="mt-2 font-display text-lg italic text-white/70">
                          {collection.tagline}
                        </p>
                      ) : null}
                      {wide && collection.description ? (
                        <p className="mt-4 hidden max-w-md text-sm leading-relaxed text-white/60 md:block">
                          {collection.description}
                        </p>
                      ) : null}
                    </div>

                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/30 text-white transition-all duration-500 ease-luxe group-hover:border-gold-400 group-hover:bg-gold-400 group-hover:text-brand-900">
                      <ArrowUpRight className="h-5 w-5" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <ContactBanner />
    </>
  );
}
