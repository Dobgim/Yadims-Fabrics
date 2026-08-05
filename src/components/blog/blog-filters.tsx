"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BlogFiltersProps {
  categories: readonly string[];
}

export function BlogFilters({ categories }: BlogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "All";
  const [term, setTerm] = React.useState(searchParams.get("q") ?? "");

  React.useEffect(() => setTerm(searchParams.get("q") ?? ""), [searchParams]);

  const push = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
        {categories.map((category) => (
          <Button
            key={category}
            role="tab"
            aria-selected={activeCategory === category}
            variant={activeCategory === category ? "luxe" : "outline"}
            size="sm"
            onClick={() =>
              push((params) => {
                if (category === "All") params.delete("category");
                else params.set("category", category);
              })
            }
          >
            {category}
          </Button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          push((params) => {
            if (term.trim()) params.set("q", term.trim());
            else params.delete("q");
          });
        }}
        className="relative lg:w-72"
      >
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search the journal"
          aria-label="Search the journal"
          className="h-11 w-full rounded-full border border-border bg-background pl-11 pr-10 text-sm placeholder:text-muted-foreground focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        {term ? (
          <button
            type="button"
            onClick={() => {
              setTerm("");
              push((params) => params.delete("q"));
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </form>
    </div>
  );
}
