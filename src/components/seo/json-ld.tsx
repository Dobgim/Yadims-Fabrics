import { siteConfig } from "@/config/site";
import type { BlogPostRow, ProductRow } from "@/types/database";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is authored here, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Store",
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        telephone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
        slogan: siteConfig.tagline,
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.contact.address.line1,
          addressLocality: "Yaoundé",
          addressRegion: "Centre",
          addressCountry: "CM",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "18:30",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "08:00",
            closes: "19:00",
          },
        ],
        sameAs: [siteConfig.social.instagram, siteConfig.social.facebook],
      }}
    />
  );
}

export function ProductJsonLd({ product }: { product: ProductRow }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.short_description ?? product.description ?? undefined,
        sku: product.sku ?? undefined,
        image: product.images,
        material: product.material ?? undefined,
        color: product.colors.join(", ") || undefined,
        brand: { "@type": "Brand", name: siteConfig.shortName },
        offers: {
          "@type": "Offer",
          url: `${siteConfig.url}/shop/${product.slug}`,
          priceCurrency: product.currency,
          price: product.price,
          availability:
            product.stock_quantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: siteConfig.name },
        },
        ...(product.rating_count > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating_average,
                reviewCount: product.rating_count,
              },
            }
          : {}),
      }}
    />
  );
}

export function ArticleJsonLd({ post }: { post: BlogPostRow }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt ?? undefined,
        image: post.cover_image_url ?? undefined,
        datePublished: post.published_at ?? post.created_at,
        dateModified: post.updated_at,
        author: { "@type": "Organization", name: post.author_name },
        publisher: { "@type": "Organization", name: siteConfig.name },
        mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; href: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${siteConfig.url}${item.href}`,
        })),
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }}
    />
  );
}
