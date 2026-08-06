/**
 * Single registry for every brand and photography asset.
 *
 * Photography in `public/fabrics/` is from Pexels — free for commercial use,
 * no attribution required. Every file was reviewed before being committed, so
 * each one genuinely shows the fabric its name claims.
 *
 * The owner's own shop photographs go in `public/shop/` and take precedence
 * wherever they are wired up; see `public/IMAGES-README.md`.
 */

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

export const brand = {
  /** Full circular lockup: rings, needle-and-thread, wordmark, tagline. */
  logo: "/brand/yadims-logo.svg",
  /** Needle-and-thread disc alone, for tight spaces and the browser tab. */
  mark: "/brand/yadims-mark.svg",
  /** Emerald velvet behind the hero — already the house green, so it needs
   *  only a light scrim rather than a heavy colour wash. */
  heroFabric: "/fabrics/hero-velvet.jpg",
  /** Vector drape painted underneath, so the hero is never a flat colour
   *  while the photograph loads. */
  backdrop: "/brand/fabric-backdrop.svg",
} as const;

/* ------------------------------------------------------------------ */
/* Category imagery — one per house category                           */
/* ------------------------------------------------------------------ */

export const categoryImages = {
  lace: "/fabrics/cat-lace.jpg",
  "silk-satin": "/fabrics/cat-silk.jpg",
  bridal: "/fabrics/cat-bridal.jpg",
  "african-prints": "/fabrics/cat-wax.jpg",
  velvet: "/fabrics/cat-velvet.jpg",
  "linen-cotton": "/fabrics/cat-linen.jpg",
  "chiffon-georgette": "/fabrics/cat-chiffon.jpg",
  "brocade-jacquard": "/fabrics/cat-brocade.jpg",
} as const;

/* ------------------------------------------------------------------ */
/* Collection imagery — cover plus a smaller accent                    */
/* ------------------------------------------------------------------ */

export const collectionImages = {
  "luxury-lace": { cover: "/fabrics/col-lace.jpg", accent: "/fabrics/col-lace-accent.jpg" },
  wedding: { cover: "/fabrics/col-wedding.jpg", accent: "/fabrics/col-wedding-accent.jpg" },
  traditional: {
    cover: "/fabrics/col-traditional.jpg",
    accent: "/fabrics/col-traditional-accent.jpg",
  },
  evening: { cover: "/fabrics/col-evening.jpg", accent: "/fabrics/col-evening-accent.jpg" },
  bridal: { cover: "/fabrics/col-bridal.jpg", accent: "/fabrics/col-bridal-accent.jpg" },
  premium: { cover: "/fabrics/col-premium.jpg", accent: "/fabrics/col-premium-accent.jpg" },
  "new-arrivals": { cover: "/fabrics/col-new.jpg", accent: "/fabrics/col-new-accent.jpg" },
} as const;

/* ------------------------------------------------------------------ */
/* Product imagery                                                     */
/* ------------------------------------------------------------------ */

export const productImages = {
  laceEyelet: "/fabrics/p-lace-eyelet.jpg",
  laceBeaded: "/fabrics/p-lace-beaded.jpg",
  laceTulle: "/fabrics/p-lace-tulle.jpg",
  laceRack: "/fabrics/p-lace-rack.jpg",
  silkTeal: "/fabrics/p-silk-teal.jpg",
  silkNavy: "/fabrics/p-silk-navy.jpg",
  silkPink: "/fabrics/p-silk-pink.jpg",
  silkStack: "/fabrics/p-silk-stack.jpg",
  bridalFitting: "/fabrics/p-bridal-fitting.jpg",
  sequinGold: "/fabrics/p-sequin-gold.jpg",
  sequinDrape: "/fabrics/p-sequin-drape.jpg",
  wax1: "/fabrics/p-wax-1.jpg",
  wax2: "/fabrics/p-wax-2.jpg",
  wax3: "/fabrics/p-wax-3.jpg",
  velvetEmerald: "/fabrics/p-velvet-emerald.jpg",
  velvetDark: "/fabrics/p-velvet-dark.jpg",
  velvetRed: "/fabrics/p-velvet-red.jpg",
  velvetOlive: "/fabrics/p-velvet-olive.jpg",
  linenRolls: "/fabrics/p-linen-rolls.jpg",
  linenPeach: "/fabrics/p-linen-peach.jpg",
  linenDenim: "/fabrics/p-linen-denim.jpg",
  chiffonBlue: "/fabrics/p-chiffon-blue.jpg",
  chiffonChampagne: "/fabrics/p-chiffon-champagne.jpg",
  chiffonCoral: "/fabrics/p-chiffon-coral.jpg",
  chiffonLilac: "/fabrics/p-chiffon-lilac.jpg",
  brocadeGold: "/fabrics/p-brocade-gold.jpg",
  brocadeDetail: "/fabrics/p-brocade-detail.jpg",
} as const;

/* ------------------------------------------------------------------ */
/* Gallery, store and services                                         */
/* ------------------------------------------------------------------ */

export const sceneImages = {
  shop1: "/fabrics/g-shop-1.jpg",
  shop2: "/fabrics/g-shop-2.jpg",
  shop3: "/fabrics/g-shop-3.jpg",
  shelfSilk: "/fabrics/g-shelf-silk.jpg",
  laceTable: "/fabrics/g-lace-table.jpg",
  tailor1: "/fabrics/g-tailor-1.jpg",
  tailor2: "/fabrics/g-tailor-2.jpg",
  cottonRolls: "/fabrics/g-cotton-rolls.jpg",
  waxModel: "/fabrics/g-wax-model.jpg",
  sequinDetail: "/fabrics/g-sequin-detail.jpg",
} as const;

/* ------------------------------------------------------------------ */
/* The owner's own shop photography                                    */
/* ------------------------------------------------------------------ */

/** Shown whenever one of these has not been supplied yet. */
export const PHOTO_PLACEHOLDER = "/shop/placeholder.svg";

export const shopPhotos = {
  boltWall: "/shop/bolt-wall.jpg",
  laceShelves: "/shop/lace-shelves.jpg",
  mannequin: "/shop/mannequin-drape.jpg",
  displayWall: "/shop/display-wall.jpg",
} as const;

export const allShopPhotos = Object.values(shopPhotos);
