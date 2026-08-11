import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { getCollections, getProductsByCollectionSlug } from "@/lib/queries/products";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductGrid } from "@/components/shop/product-grid";
import { ContactBanner } from "@/components/shared/contact-banner";

export const revalidate = 300;

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = (await getCollections()).find((c) => c.slug === slug);
  if (!collection) return { title: "Collection not found" };

  return {
    title: collection.name,
    description: collection.description ?? collection.tagline ?? undefined,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      title: collection.name,
      description: collection.description ?? undefined,
      images: collection.cover_image_url ? [collection.cover_image_url] : undefined,
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collections = await getCollections();
  const collection = collections.find((c) => c.slug === slug);
  if (!collection) notFound();

  const products = await getProductsByCollectionSlug(slug);
  const others = collections.filter((c) => c.id !== collection.id).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={collection.tagline ?? "Collection"}
        title={collection.name}
        description={collection.description ?? undefined}
        breadcrumbs={[
          { name: "Collections", href: "/collections" },
          { name: collection.name, href: `/collections/${collection.slug}` },
        ]}
        image={collection.cover_image_url ?? undefined}
      />

      <section className="section">
        <div className="container">
          {products.length ? (
            <>
              <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">
                    {products.length}
                  </span>{" "}
                  {products.length === 1 ? "fabric" : "fabrics"} in this collection
                </p>
                <Button asChild variant="link">
                  <Link href={`/shop?collection=${collection.slug}`}>
                    Open in shop with filters <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <ProductGrid products={products} columns={3} priorityCount={3} />
            </>
          ) : (
            <div className="rounded-4xl border border-dashed border-border py-24 text-center">
              <p className="font-display text-2xl">This collection is being restocked</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                New bolts are on their way. Tell us what you are looking for and we will hold a
                length when it lands.
              </p>
              <Button asChild variant="luxe" className="mt-7">
                <Link href="/contact">Ask us to hold a length</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {others.length ? (
        <section className="section bg-secondary/50">
          <div className="container">
            <SectionHeading
              eyebrow="Keep looking"
              title="Other collections"
              className="mb-12"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/collections/${other.slug}`}
                  className="group rounded-3xl border border-border bg-card p-7 transition-all duration-500 ease-luxe hover:-translate-y-1 hover:shadow-lift"
                >
                  <h3 className="font-display text-xl">{other.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{other.tagline}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm text-brand-600 transition-transform duration-500 ease-luxe group-hover:translate-x-1">
                    View <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ContactBanner />
    </>
  );
}
