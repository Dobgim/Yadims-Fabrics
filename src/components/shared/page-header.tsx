import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

interface Crumb {
  name: string;
  href: string;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  image?: string;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Shared page masthead. With an `image` it renders as a dark editorial banner;
 * without one it falls back to a quiet, typographic header on the page canvas.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  image,
  align = "left",
  className,
  children,
}: PageHeaderProps) {
  const dark = Boolean(image);
  const centered = align === "center";
  const crumbs: Crumb[] = [{ name: "Home", href: "/" }, ...breadcrumbs];

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        dark ? "bg-brand-900 text-white" : "border-b border-border bg-secondary/40",
        className,
      )}
    >
      {image ? (
        <>
          <Image src={image} alt="" fill sizes="100vw" className="-z-10 object-cover" aria-hidden />
          <div className="absolute inset-0 -z-10 bg-brand-900/80" aria-hidden />
        </>
      ) : null}

      <div
        className={cn(
          "container py-16 md:py-24",
          centered && "flex flex-col items-center text-center",
        )}
      >
        <nav aria-label="Breadcrumb">
          <ol
            className={cn(
              "flex flex-wrap items-center gap-1.5 text-xs",
              dark ? "text-white/55" : "text-muted-foreground",
              centered && "justify-center",
            )}
          >
            {crumbs.map((crumb, i) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 ? <ChevronRight className="h-3 w-3 opacity-50" aria-hidden /> : null}
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className={dark ? "text-white" : "text-foreground"}>
                    {crumb.name}
                  </span>
                ) : (
                  <Link href={crumb.href} className="link-underline hover:opacity-100">
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {eyebrow ? (
          <p className={cn("eyebrow mt-7", dark && "text-gold-400")}>{eyebrow}</p>
        ) : null}

        <h1 className={cn("mt-4 text-display-lg", dark ? "text-white" : "text-foreground")}>
          {title}
        </h1>

        {description ? (
          <p
            className={cn(
              "mt-6 max-w-2xl text-[1.0625rem] leading-relaxed",
              dark ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}

        {children ? <div className="mt-9">{children}</div> : null}
      </div>

      <BreadcrumbJsonLd items={crumbs} />
    </section>
  );
}
