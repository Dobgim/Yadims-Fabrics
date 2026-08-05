import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading UI for the storefront. Mirrors the page rhythm. */
export default function Loading() {
  return (
    <div className="container py-20">
      <div className="space-y-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-14 w-2/3 max-w-xl" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-3/4 max-w-xl" />
      </div>

      <div className="mt-20 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[4/5] w-full rounded-4xl" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
