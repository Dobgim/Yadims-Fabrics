import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { blogCategories } from "@/data/content";
import { searchPosts } from "@/lib/queries/content";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { PostCard } from "@/components/blog/post-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import { ContactBanner } from "@/components/shared/contact-banner";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Practical writing on choosing, cutting and caring for fine fabric — bridal lace, GSM and momme, aso-ebi planning, velvet nap and wholesale buying.",
  alternates: { canonical: "/blog" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const term = first(params.q);
  const category = first(params.category);

  const posts = await searchPosts(term, category);
  const filtering = Boolean(term || (category && category !== "All"));

  const [lead, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow="The journal"
        title="Notes from the shop floor"
        description="Everything we find ourselves explaining across the counter, written down properly — so you can read it before you buy rather than after."
        breadcrumbs={[{ name: "Journal", href: "/blog" }]}
      />

      <section className="section">
        <div className="container space-y-12">
          <Suspense fallback={<div className="h-24" />}>
            <BlogFilters categories={blogCategories} />
          </Suspense>

          {posts.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-border py-24 text-center">
              <p className="font-display text-2xl">Nothing written on that yet</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Try another category, or ask us directly — the questions we get asked twice tend to
                become the next article.
              </p>
              <div className="mt-7 flex justify-center gap-3">
                <Button asChild variant="outline">
                  <Link href="/blog">Clear filters</Link>
                </Button>
                <Button asChild variant="luxe">
                  <Link href="/contact">Ask us</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* The most recent piece leads the page, unless filtering */}
              {!filtering && lead ? (
                <Reveal>
                  <PostCard post={lead} featured priority />
                </Reveal>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(filtering ? posts : rest).map((post, i) => (
                  <Reveal key={post.id} delay={(i % 3) * 0.07}>
                    <PostCard post={post} priority={filtering && i < 3} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <ContactBanner />
    </>
  );
}
