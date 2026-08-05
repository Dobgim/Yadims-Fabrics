import { Star } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { ProductRow, ReviewRow } from "@/types/database";

export function StarRating({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex gap-0.5", className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
            i < Math.round(value) ? "fill-gold-400 text-gold-400" : "text-border",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

interface ProductReviewsProps {
  product: ProductRow;
  reviews: ReviewRow[];
}

export function ProductReviews({ product, reviews }: ProductReviewsProps) {
  // Distribution across the five star buckets, for the summary bars.
  const buckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const total = reviews.length || product.rating_count;

  return (
    <div className="grid gap-12 lg:grid-cols-[20rem_1fr]">
      <div className="space-y-6">
        <div>
          <p className="font-display text-5xl leading-none">
            {product.rating_average ? product.rating_average.toFixed(1) : "—"}
          </p>
          <StarRating value={product.rating_average} size="md" className="mt-3" />
          <p className="mt-2 text-sm text-muted-foreground">
            {total} {total === 1 ? "review" : "reviews"}
          </p>
        </div>

        {reviews.length ? (
          <ul className="space-y-2">
            {buckets.map((bucket) => (
              <li key={bucket.star} className="flex items-center gap-3 text-xs">
                <span className="w-3 tabular-nums text-muted-foreground">{bucket.star}</span>
                <Star className="h-3 w-3 fill-gold-400 text-gold-400" aria-hidden />
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-gold-400"
                    style={{ width: `${total ? (bucket.count / total) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-5 text-right tabular-nums text-muted-foreground">
                  {bucket.count}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div>
        {reviews.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-xl">No written reviews yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {product.rating_count > 0
                ? `This fabric holds a ${product.rating_average.toFixed(1)} rating from ${product.rating_count} customers in store. Written reviews appear here once approved.`
                : "Be the first to write about this fabric once you have sewn with it. Reviews are published after we have checked them."}
            </p>
          </div>
        ) : (
          <ul className="space-y-8">
            {reviews.map((review, i) => (
              <li key={review.id}>
                {i > 0 ? <Separator className="mb-8" /> : null}
                <article className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{review.author_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                    <StarRating value={review.rating} />
                  </div>
                  {review.title ? (
                    <h3 className="font-display text-lg">{review.title}</h3>
                  ) : null}
                  <p className="leading-relaxed text-muted-foreground">{review.body}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
