"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surfaced in the platform logs; the digest is the only safe handle to
    // give a customer when they report a problem.
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-7 px-6 py-24 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary">
        <AlertTriangle className="h-8 w-8 text-brand-500" aria-hidden />
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-3xl">Something came apart at the seam</h1>
        <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
          An unexpected error stopped this page from loading. Trying again usually works — if it
          does not, message us and we will look into it.
        </p>
        {error.digest ? (
          <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="luxe" onClick={reset}>
          <RotateCw /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home /> Back to the shop
          </Link>
        </Button>
      </div>
    </main>
  );
}
