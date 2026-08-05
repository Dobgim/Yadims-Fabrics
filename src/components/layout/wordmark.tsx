import { cn } from "@/lib/utils";
import { brand } from "@/data/images";
import { siteConfig } from "@/config/site";

interface WordmarkProps {
  tone?: "default" | "light";
  className?: string;
  showTagline?: boolean;
  /** Renders the circular mark only — for tight spaces. */
  markOnly?: boolean;
}

/**
 * Brand lockup. The circular mark is the supplied logo asset; the wordmark
 * beside it is set in the house display face so it stays crisp at any size
 * and inherits the surrounding colour.
 */
export function Wordmark({
  tone = "default",
  className,
  showTagline = false,
  markOnly = false,
}: WordmarkProps) {
  const light = tone === "light";

  /*
   * A plain <img> rather than next/image: the mark is a small inline SVG that
   * the optimiser cannot improve on, and it must paint immediately in the
   * header rather than wait on an optimisation round-trip.
   */
  const mark = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.mark}
      alt=""
      width={44}
      height={44}
      className={cn(
        "shrink-0 rounded-full",
        markOnly ? "h-11 w-11" : "h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11",
      )}
    />
  );

  if (markOnly) {
    return (
      <span className={cn("inline-flex", className)}>
        {mark}
        <span className="sr-only">{siteConfig.name}</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2 sm:gap-2.5", className)}>
      {mark}

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.3rem] tracking-[0.02em] sm:text-[1.5rem] md:text-[1.65rem]",
            light ? "text-white" : "text-brand-700 dark:text-brand-100",
          )}
        >
          YADIMS
        </span>
        <span
          className={cn(
            "mt-1 whitespace-nowrap text-[0.45rem] uppercase tracking-[0.2em] sm:text-[0.5rem] sm:tracking-[0.28em] md:text-[0.55rem]",
            light ? "text-white/60" : "text-muted-foreground",
          )}
        >
          {showTagline ? siteConfig.tagline : "Fabrics & Seams"}
        </span>
      </span>
    </span>
  );
}
