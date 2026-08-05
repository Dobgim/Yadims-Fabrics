"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "rating", label: "Best rated" },
] as const;

interface ShopToolbarProps {
  total: number;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  children?: React.ReactNode;
}

export function ShopToolbar({ total, view, onViewChange, children }: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [term, setTerm] = React.useState(searchParams.get("q") ?? "");
  React.useEffect(() => setTerm(searchParams.get("q") ?? ""), [searchParams]);

  const push = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    push((params) => {
      if (term.trim()) params.set("q", term.trim());
      else params.delete("q");
    });
  };

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        {children}
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{total}</span>{" "}
          {total === 1 ? "fabric" : "fabrics"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={submitSearch} className="relative flex-1 sm:min-w-[16rem]">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search fabrics"
            aria-label="Search fabrics"
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

        <Select
          value={searchParams.get("sort") ?? "newest"}
          onValueChange={(value) =>
            push((params) => {
              if (value === "newest") params.delete("sort");
              else params.set("sort", value);
            })
          }
        >
          <SelectTrigger className="h-11 w-[11.5rem] rounded-full" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          className="hidden items-center rounded-full border border-border p-1 sm:flex"
          role="group"
          aria-label="Layout"
        >
          <ViewButton
            active={view === "grid"}
            onClick={() => onViewChange("grid")}
            label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </ViewButton>
          <ViewButton
            active={view === "list"}
            onClick={() => onViewChange("list")}
            label="List view"
          >
            <List className="h-4 w-4" />
          </ViewButton>
        </div>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(active && "bg-brand-500 text-white hover:bg-brand-600 hover:text-white")}
    >
      {children}
    </Button>
  );
}
