"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { colorToCss } from "@/components/shop/product-card";
import type { CategoryRow, CollectionRow } from "@/types/database";

export interface FilterOptions {
  categories: CategoryRow[];
  collections: CollectionRow[];
  materials: string[];
  colors: string[];
  priceRange: { min: number; max: number };
}

/**
 * URL-driven filters. Search params are the single source of truth, which
 * keeps every filtered view shareable, bookmarkable and back-button friendly.
 */
function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getAll = React.useCallback(
    (key: string) => searchParams.getAll(key).filter(Boolean),
    [searchParams],
  );

  const apply = React.useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page"); // any filter change resets pagination
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggle = React.useCallback(
    (key: string, value: string) => {
      apply((params) => {
        const current = params.getAll(key);
        params.delete(key);
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        next.forEach((v) => params.append(key, v));
      });
    },
    [apply],
  );

  const setRange = React.useCallback(
    (min: number, max: number, bounds: { min: number; max: number }) => {
      apply((params) => {
        if (min > bounds.min) params.set("minPrice", String(min));
        else params.delete("minPrice");
        if (max < bounds.max) params.set("maxPrice", String(max));
        else params.delete("maxPrice");
      });
    },
    [apply],
  );

  const clearAll = React.useCallback(() => {
    apply((params) => {
      const q = params.get("q");
      Array.from(params.keys()).forEach((key) => params.delete(key));
      if (q) params.set("q", q);
    });
  }, [apply]);

  return { getAll, toggle, setRange, clearAll, searchParams };
}

/** Persistent rail, large screens only. */
export function FilterSidebar({ options }: { options: FilterOptions }) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block" aria-label="Product filters">
      <div className="sticky top-24">
        <FilterPanel options={options} />
      </div>
    </aside>
  );
}

/** Trigger + sheet for small screens. Lives inside the results toolbar. */
export function FilterDrawer({ options }: { options: FilterOptions }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-xl">Refine</SheetTitle>
        </SheetHeader>
        <div className="mt-6 pb-10">
          <FilterPanel options={options} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterPanel({ options }: { options: FilterOptions }) {
  const { getAll, toggle, setRange, clearAll, searchParams } = useFilterParams();
  const { priceRange } = options;

  const activeMin = Number(searchParams.get("minPrice") ?? priceRange.min);
  const activeMax = Number(searchParams.get("maxPrice") ?? priceRange.max);
  const [draft, setDraft] = React.useState<[number, number]>([activeMin, activeMax]);

  // Keep the slider in step with browser navigation and "clear all".
  React.useEffect(() => setDraft([activeMin, activeMax]), [activeMin, activeMax]);

  const selectedCategories = getAll("category");
  const selectedCollections = getAll("collection");
  const selectedMaterials = getAll("material");
  const selectedColors = getAll("color");

  const activeCount =
    selectedCategories.length +
    selectedCollections.length +
    selectedMaterials.length +
    selectedColors.length +
    (searchParams.has("minPrice") || searchParams.has("maxPrice") ? 1 : 0) +
    (searchParams.get("new") === "1" ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">
          Refine
          {activeCount > 0 ? (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({activeCount})</span>
          ) : null}
        </h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        ) : null}
      </div>

      <Separator />

      <Accordion
        type="multiple"
        defaultValue={["category", "collection", "price", "material", "color"]}
        className="space-y-1"
      >
        <FilterGroup value="category" label="Category">
          {options.categories.map((category) => (
            <CheckRow
              key={category.id}
              id={`cat-${category.slug}`}
              label={category.name}
              checked={selectedCategories.includes(category.slug)}
              onToggle={() => toggle("category", category.slug)}
            />
          ))}
        </FilterGroup>

        <FilterGroup value="collection" label="Collection">
          {options.collections.map((collection) => (
            <CheckRow
              key={collection.id}
              id={`col-${collection.slug}`}
              label={collection.name}
              checked={selectedCollections.includes(collection.slug)}
              onToggle={() => toggle("collection", collection.slug)}
            />
          ))}
        </FilterGroup>

        <FilterGroup value="price" label="Price">
          <div className="px-1 pt-2">
            <Slider
              value={draft}
              min={priceRange.min}
              max={priceRange.max}
              step={500}
              minStepsBetweenThumbs={1}
              onValueChange={(v) => setDraft([v[0], v[1]])}
              onValueCommit={(v) => setRange(v[0], v[1], priceRange)}
              aria-label="Price range"
            />
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatPrice(draft[0])}</span>
              <span>{formatPrice(draft[1])}</span>
            </div>
          </div>
        </FilterGroup>

        <FilterGroup value="material" label="Material">
          {options.materials.map((material) => (
            <CheckRow
              key={material}
              id={`mat-${material}`}
              label={material}
              checked={selectedMaterials.includes(material)}
              onToggle={() => toggle("material", material)}
            />
          ))}
        </FilterGroup>

        <FilterGroup value="color" label="Colour">
          <div className="flex flex-wrap gap-2 pt-1">
            {options.colors.map((color) => {
              const selected = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggle("color", color)}
                  title={color}
                  aria-label={color}
                  aria-pressed={selected}
                  className={cn(
                    "h-7 w-7 rounded-full border transition-all duration-300 ease-luxe hover:scale-110",
                    selected
                      ? "border-brand-500 ring-2 ring-brand-500 ring-offset-2 ring-offset-background"
                      : "border-border",
                  )}
                  style={{ backgroundColor: colorToCss(color) }}
                />
              );
            })}
          </div>
        </FilterGroup>
      </Accordion>

      <Separator />

      <CheckRow
        id="new-only"
        label="New arrivals only"
        checked={searchParams.get("new") === "1"}
        onToggle={() => toggle("new", "1")}
      />
    </div>
  );
}

function FilterGroup({
  value,
  label,
  children,
}: {
  value: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value} className="border-b-0">
      <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
        {label}
      </AccordionTrigger>
      <AccordionContent className="space-y-2.5 pb-5">{children}</AccordionContent>
    </AccordionItem>
  );
}

function CheckRow({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} />
      <Label
        htmlFor={id}
        className="cursor-pointer text-sm font-normal leading-snug text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
      </Label>
    </div>
  );
}
