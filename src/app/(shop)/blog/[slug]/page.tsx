import type { Metadata } from "next";
import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { getBlogPosts, getPostBySlug, getRelatedPosts } from "@/lib/queries/content";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { ArticleBody } from "@/components/blog/article-body";
import { PostCard } from "@/components/blog/post-card";
import { ArticleJsonLd } from "@/components/seo/json-ld";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.published_at ?? post.created_at,
      authors: [post.author_name],
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);

  return (
    <>
      <PageHeader
        eyebrow={post.category}
        title={post.title}
        breadcrumbs={[
          { name: "Journal", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span>{post.author_name}</span>
          <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
          <time dateTime={post.published_at ?? post.created_at}>
            {formatDate(post.published_at ?? post.created_at)}
          </time>
          <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {post.read_minutes} min read
          </span>
        </div>
      </PageHeader>

      <article className="container py-16 md:py-20">
        {post.cover_image_url ? (
          <div className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-[2rem] bg-muted">
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mx-auto mt-14 max-w-2xl">
          {post.excerpt ? (
            <p className="border-l-2 border-gold-400 pl-6 font-display text-xl leading-relaxed text-foreground">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-10">
            <ArticleBody content={post.content} />
          </div>

          {post.tags.length ? (
            <>
              <Separator className="my-12" />
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-secondary px-3.5 py-1.5 text-xs text-muted-foreground"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <div className="mt-12 rounded-4xl bg-secondary/60 p-8">
            <h2 className="font-display text-2xl">Read the next one first</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              One email a month — new stock and whatever we have just written down.
            </p>
            <div className="mt-6">
              <NewsletterForm source={`article:${post.slug}`} />
            </div>
          </div>

          <Button asChild variant="link" className="mt-10">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" /> All journal entries
            </Link>
          </Button>
        </div>
      </article>

      {related.length ? (
        <section className="section bg-secondary/50">
          <div className="container">
            <SectionHeading eyebrow="Keep reading" title="Related pieces" className="mb-12" />
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ArticleJsonLd post={post} />
    </>
  );
}
