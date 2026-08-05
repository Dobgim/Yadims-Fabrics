import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-10 flex items-center justify-between border-b border-border pb-6">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-56 rounded-full" />
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[4/5] w-full rounded-4xl" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
