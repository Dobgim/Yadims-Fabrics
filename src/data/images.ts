/**
 * Single registry for every brand and photography asset.
 *
 * Real photography lives in `public/`. Files that have not been supplied yet
 * resolve to a placeholder at render time via `<SafeImage>`, so no page ever
 * shows a broken image — drop the real file in at the documented path and it
 * is picked up on the next reload, with no code change.
 *
 * See `public/IMAGES-README.md` for the file list.
 */

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

export const brand = {
  /** Full circular lockup: rings, needle-and-thread, wordmark, tagline. */
  logo: "/brand/yadims-logo.svg",
  /** Needle-and-thread disc alone, for tight spaces and the browser tab. */
  mark: "/brand/yadims-mark.svg",
  /**
   * Photographed draped silk behind the hero. Neutral white in the original,
   * so the green scrim over it reads as green silk while every fold and the
   * weave of the cloth stay visible.
   */
  heroFabric: "/brand/hero-fabric.jpg",
  /**
   * Vector drape painted underneath the photograph. It costs four kilobytes
   * and guarantees the hero is never a flat colour while the JPEG loads.
   */
  backdrop: "/brand/fabric-backdrop.svg",
} as const;

/* ------------------------------------------------------------------ */
/* Shop photography                                                    */
/* ------------------------------------------------------------------ */

/** Shown whenever a photograph has not been supplied yet. */
export const PHOTO_PLACEHOLDER = "/shop/placeholder.svg";

export const shopPhotos = {
  /** Cube shelving: cottons, crepes, brocades and metallic jacquards. */
  boltWall: "/shop/bolt-wall.jpg",
  /** Lace, sequin and beaded shelves — the lace corner. */
  laceShelves: "/shop/lace-shelves.jpg",
  /** Mannequin draped in black embroidered lace, measuring tape alongside. */
  mannequin: "/shop/mannequin-drape.jpg",
  /** Wider shelving view with packaged lengths in front. */
  displayWall: "/shop/display-wall.jpg",
} as const;

export const allShopPhotos = Object.values(shopPhotos);

/* ------------------------------------------------------------------ */
/* Stock placeholders                                                  */
/* ------------------------------------------------------------------ */

/**
 * Unsplash fallbacks for editorial imagery not yet photographed in store.
 * Replace these as real photographs are taken.
 */
export const stock = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
