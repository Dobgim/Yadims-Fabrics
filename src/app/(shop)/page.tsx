import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";

import { siteConfig } from "@/config/site";
import { instagramGrid, whyChooseUs } from "@/data/company";
import {
  getCategories,
  getCollections,
  getFeaturedProducts,
  getNewArrivals,
  getProductsByCollectionSlug,
} from "@/lib/queries/products";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/home/hero";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { CollectionFeature } from "@/components/home/collection-feature";
import { Testimonials } from "@/components/home/testimonials";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { WhyChooseUs } from "@/components/shared/why-choose-us";
import { ContactBanner } from "@/components/shared/contact-banner";

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, collections, featured, newArrivals, wedding, lace, premium] =
    await Promise.all([
      getCategories(),
      getCollections(),
      getFeaturedProducts(8),
      getNewArrivals(8),
      getProductsByCollectionSlug("wedding", 4),
      getProductsByCollectionSlug("luxury-lace", 4),
      getProductsByCollectionSlug("premium", 3),
    ]);

  const weddingCollection = collections.find((c) => c.slug === "wedding");
  const laceCollection = collections.find((c) => c.slug === "luxury-lace");

  // Full counts for the feature meta strips — `wedding`/`lace` above are
  // capped at four for the grid, so they cannot be used for this.
  const [weddingCount, laceCount] = await Promise.all([
    getProductsByCollectionSlug("wedding").then((p) => p.length),
    getProductsByCollectionSlug("luxury-lace").then((p) => p.length),
  ]);

  return (
    <>
      <Hero />

      {/* -------------------------------------------------- Categories */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Browse by cloth"
            title="Featured categories"
            description="Eight house categories, each chosen because we could source it well — not because the shelf needed filling."
            action={
              <Button asChild variant="outline">
                <Link href="/shop">
                  All fabrics <ArrowRight />
                </Link>
              </Button>
            }
            className="mb-14"
          />
          <CategoryShowcase categories={categories} />
        </div>
      </section>

      {/* ---------------------------------------------- Featured fabrics */}
      <section className="section bg-secondary/50">
        <div className="container">
          <SectionHeading
            eyebrow="Chosen by the house"
            title="Featured fabrics"
            description="The bolts we would reach for first — and the ones we most often talk customers into."
            className="mb-14"
          />
          <ProductCarousel products={featured} />
        </div>
      </section>

      {/* ------------------------------------------------ New arrivals */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Just off the bolt"
            title="New arrivals"
            description="Updated as stock lands. Lengths on new lines are limited until we know how they sell."
            action={
              <Button asChild variant="outline">
                <Link href="/collections/new-arrivals">
                  See everything new <ArrowRight />
                </Link>
              </Button>
            }
            className="mb-14"
          />
          <ProductGrid products={newArrivals.slice(0, 4)} columns={4} />
        </div>
      </section>

      {/* -------------------------------------------- Wedding collection */}
      {weddingCollection ? (
        <section className="section bg-brand-900 text-white">
          <div className="container space-y-16">
            <CollectionFeature
              collection={weddingCollection}
              eyebrow="Collection"
              tone="dark"
              productCount={weddingCount}
            />
            {wedding.length ? <ProductGrid products={wedding} columns={4} /> : null}
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------- Luxury lace */}
      {laceCollection ? (
        <section className="section">
          <div className="container space-y-16">
            <CollectionFeature
              collection={laceCollection}
              eyebrow="Collection"
              reversed
              productCount={laceCount}
            />
            {lace.length ? <ProductGrid products={lace} columns={4} /> : null}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------- Premium fabrics */}
      <section className="section bg-secondary/50">
        <div className="container">
          <SectionHeading
            eyebrow="The top of the house"
            title="Premium fabrics"
            description="Limited-length bolts from European and Asian mills. When a premium piece sells out, it rarely returns."
            action={
              <Button asChild variant="outline">
                <Link href="/collections/premium">
                  The premium collection <ArrowRight />
                </Link>
              </Button>
            }
            className="mb-14"
          />
          <ProductGrid products={premium} columns={3} />
        </div>
      </section>

      {/* --------------------------------------------- Why choose us */}
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

      {/* ------------------------------------------------ Testimonials */}
      <section className="section bg-secondary/50">
        <div className="container">
          <SectionHeading
            eyebrow="In their words"
            title="Customers, in their own words"
            description="Brides, ateliers and procurement managers — the three groups we serve, and the three hardest to satisfy."
            className="mb-14"
          />
          <Testimonials />
        </div>
      </section>

      {/* -------------------------------------------------- Instagram */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="@yadimsfabrics"
            title="From the shop floor"
            description="New stock, fittings and the occasional very good delivery day."
            className="mb-14"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {instagramGrid.map((src, i) => (
              <Reveal key={src + i} delay={i * 0.05}>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group relative block aspect-square overflow-hidden rounded-3xl bg-muted"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 16vw, 45vw"
                    className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-110"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-brand-900/0 text-white opacity-0 transition-all duration-500 group-hover:bg-brand-900/45 group-hover:opacity-100">
                    <Instagram className="h-6 w-6" aria-hidden />
                    <span className="sr-only">View on Instagram</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContactBanner />
    </>
  );
}
