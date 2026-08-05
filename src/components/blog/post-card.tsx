import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
import type { BlogPostRow } from "@/types/database";

interface PostCardProps {
  post: BlogPostRow;
  featured?: boolean;
  priority?: boolean;
}

export function PostCard({ post, featured, priority }: PostCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-4xl border border-border/70 bg-card transition-all duration-500 ease-luxe hover:-translate-y-1 hover:shadow-lift",
        featured && "lg:flex-row",
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn("relative block bg-muted", featured ? "lg:w-1/2" : "")}
      >
        <div className={cn("relative", featured ? "aspect-[16/10] lg:h-full lg:aspect-auto" : "aspect-[16/10]")}>
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              priority={priority}
              sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 768px) 45vw, 100vw"}
              className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
            />
          ) : null}
        </div>
        <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3.5 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-brand-800 backdrop-blur">
          {post.category}
        </span>
      </Link>

      <div className={cn("flex flex-1 flex-col p-7", featured && "lg:justify-center lg:p-11")}>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={post.published_at ?? post.created_at}>
            {formatDate(post.published_at ?? post.created_at)}
          </time>
          <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" aria-hidden /> {post.read_minutes} min read
          </span>
        </div>

        <h3 className={cn("mt-4 font-display leading-snug", featured ? "text-3xl" : "text-xl")}>
          <Link href={`/blog/${post.slug}`} className="link-underline">
            {post.title}
          </Link>
        </h3>

        <p
          className={cn(
            "mt-3 flex-1 text-sm leading-relaxed text-muted-foreground",
            featured ? "line-clamp-4 text-base" : "line-clamp-3",
          )}
        >
          {post.excerpt}
        </p>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-6 inline-flex items-center gap-2 self-start text-sm text-brand-600 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
        >
          Read the piece <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
