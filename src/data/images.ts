/**
 * Brand assets only.
 *
 * There is no stock photography in this project. Every photograph on the site
 * is uploaded by the shop through the dashboard and lives in Supabase Storage
 * — fabrics, gallery, everything. The owner asked for it that way, and it is
 * the honest arrangement: a customer looking at a photograph on this site is
 * looking at cloth the shop actually has.
 *
 * What remains here is drawn artwork, not photography: the logo, the mark and
 * a vector drape used as a background. Those are part of the brand rather than
 * a claim about stock.
 */

export const brand = {
  /** Full circular lockup: rings, needle-and-thread, wordmark, tagline. */
  logo: "/brand/yadims-logo.svg",
  /** Needle-and-thread disc alone, for tight spaces and the browser tab. */
  mark: "/brand/yadims-mark.svg",
  /** Vector drape painted behind the hero, so it is never a flat colour. */
  backdrop: "/brand/fabric-backdrop.svg",
} as const;

/** Shown wherever a photograph has not been uploaded yet. */
export const PHOTO_PLACEHOLDER = "/shop/placeholder.svg";

/**
 * The owner's own shop photographs, dropped into `public/shop/` by hand.
 * Optional: anything not supplied simply does not render.
 */
export const shopPhotos = {
  boltWall: "/shop/bolt-wall.jpg",
  laceShelves: "/shop/lace-shelves.jpg",
  mannequin: "/shop/mannequin-drape.jpg",
  displayWall: "/shop/display-wall.jpg",
} as const;

export const allShopPhotos = Object.values(shopPhotos);
