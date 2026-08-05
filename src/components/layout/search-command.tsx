"use client";

import * as React from "react";
import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { products } from "@/data/catalogue";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Type-ahead over the catalogue. Matching runs against the bundled index so
 * results appear instantly; pressing Enter hands off to the full shop search.
 */
export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [term, setTerm] = React.useState("");

  // Clear the query each time the dialog is dismissed, adjusted during render.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setTerm("");
  }

  // Cmd/Ctrl+K anywhere on the site.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const results = React.useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) =>
        [p.name, p.material ?? "", ...p.tags, ...p.colors].join(" ").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [term]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    onOpenChange(false);
    router.push(`/shop?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-24 max-w-2xl translate-y-0 gap-0 overflow-hidden rounded-4xl p-0">
        <DialogTitle className="sr-only">Search fabrics</DialogTitle>

        <form onSubmit={submit} className="flex items-center gap-3 border-b border-border px-5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search lace, silk, wax print, colour…"
            aria-label="Search fabrics"
            className="h-14 flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[0.65rem] text-muted-foreground sm:block">
            ESC
          </kbd>
        </form>

        <div className="max-h-[22rem] overflow-y-auto p-2">
          {term && !results.length ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No fabrics match “{term}”. Try a material, colour or collection name.
            </p>
          ) : null}

          {!term ? (
            <div className="px-4 py-8">
              <p className="eyebrow mb-4">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {["Lace", "Silk", "Bridal", "Wax print", "Velvet", "Linen"].map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => setTerm(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          <ul>
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/shop/${product.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-secondary"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{product.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {product.material}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm tabular-nums">
                    {formatPrice(product.price, product.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
