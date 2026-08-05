"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";

import { PHOTO_PLACEHOLDER, shopPhotos } from "@/data/images";

/**
 * Shop photography is supplied by the owner over time. Until a given file
 * exists, `/_next/image` answers 400 for it, so those paths bypass the
 * optimiser and load natively — a missing file then fails silently instead of
 * filling the console with optimiser errors.
 */
const PENDING = new Set<string>(Object.values(shopPhotos));

/**
 * `next/image` that degrades to a house placeholder when a file is missing,
 * and picks up the real photograph automatically once it is dropped in.
 */
export function SafeImage({
  src,
  alt,
  fallback = PHOTO_PLACEHOLDER,
  unoptimized,
  ...props
}: ImageProps & { fallback?: string }) {
  const [resolved, setResolved] = React.useState(src);

  // A changed `src` (carousel, gallery filter) must clear a previous failure.
  React.useEffect(() => setResolved(src), [src]);

  const raw =
    resolved === fallback ||
    (typeof resolved === "string" && PENDING.has(resolved));

  return (
    <Image
      {...props}
      src={resolved}
      alt={alt}
      onError={() => setResolved(fallback)}
      unoptimized={unoptimized || raw}
    />
  );
}
