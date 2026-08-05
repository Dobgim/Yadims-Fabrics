import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";

export interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  count: number;
  featured: boolean;
  href: string;
}

/** Shared card grid for categories and collections — the shapes are identical. */
export function TaxonomyGrid({
  items,
  emptyMessage,
}: {
  items: TaxonomyItem[];
  emptyMessage: string;
}) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="group overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div className="relative aspect-[16/9] bg-muted">
            {item.image ? (
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                className="object-cover"
              />
            ) : null}

            {item.featured ? (
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-brand-900">
                <Star className="h-3 w-3 fill-current" aria-hidden /> Featured
              </span>
            ) : null}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-xl">{item.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">/{item.slug}</p>
              </div>
              <Link
                href={item.href}
                target="_blank"
                aria-label={`View ${item.name} on the site`}
                className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>

            {item.description ? (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            ) : null}

            <p className="mt-5 text-sm text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">{item.count}</span>{" "}
              {item.count === 1 ? "product" : "products"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
