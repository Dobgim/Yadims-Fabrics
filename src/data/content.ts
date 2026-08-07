import { productImages as P, sceneImages as S, shopPhotos } from "@/data/images";
import type { GalleryItemRow } from "@/types/database";

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

type GallerySeed = [string, string, string, GalleryItemRow["category"], GalleryItemRow["aspect"]];

/** The owner's own photographs lead the gallery once they are supplied. */
const realSeeds: GallerySeed[] = [
  [shopPhotos.boltWall, "The Shelves", "Cottons, crepes and metallic jacquards, sorted by hand every Monday morning.", "Store", "portrait"],
  [shopPhotos.laceShelves, "The Lace Corner", "Sequin, beaded and embroidered lace — where every bridal decision actually gets made.", "Fabric Displays", "portrait"],
  [shopPhotos.mannequin, "Draped and Measured", "Black embroidered lace on the stand, tape alongside. A photograph cannot tell you how it falls.", "Customer Showcase", "portrait"],
  [shopPhotos.displayWall, "Front of House", "Packaged lengths held for collection, against the full display wall.", "Store", "portrait"],
];

const stockSeeds: GallerySeed[] = [
  [S.shop2, "The Bolt Wall", "Floor to ceiling, sorted by weight rather than colour.", "Store", "portrait"],
  [S.shelfSilk, "Silk Shelf", "Charmeuse and duchess satin, folded on the bias.", "Fabric Displays", "portrait"],
  [S.laceTable, "The Lace Table", "Where every bridal decision actually gets made.", "Fabric Displays", "landscape"],
  [S.cottonRolls, "Cotton Rolls", "Solid cottons and poplins in forty shades.", "New Stock", "portrait"],
  [P.velvetEmerald, "Velvet Corner", "Silk-blend velvet in the house green.", "Fabric Displays", "square"],
  [P.wax1, "Wax, Worn", "A six-yard piece, cut and sewn by a customer.", "Customer Showcase", "portrait"],
  [S.tailor1, "At the Machine", "The part nobody photographs and everybody feels.", "Events", "landscape"],
  [S.tailor2, "Finishing", "A hem pressed before it leaves the counter.", "Customer Showcase", "portrait"],
  [S.sequinDetail, "Sequin, Under Light", "Matte sequin on a stretch mesh ground.", "New Stock", "square"],
  [S.shop3, "Opening Up", "The shop at eight in the morning.", "Events", "landscape"],
];

export const galleryItems: GalleryItemRow[] = [...realSeeds, ...stockSeeds].map(
  ([image_url, title, caption, category, aspect], i) => ({
    id: `gal-${i + 1}`,
    title,
    caption,
    image_url,
    category,
    aspect,
    position: i,
    is_published: true,
    created_at: new Date(Date.UTC(2025, 2, 1 + i)).toISOString(),
  }),
);

export const galleryCategories = [
  "All",
  "Store",
  "Fabric Displays",
  "New Stock",
  "Events",
  "Customer Showcase",
] as const;

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

/**
 * ⚠️  PLACEHOLDER COPY — REPLACE BEFORE LAUNCH.
 *
 * These are written examples, not real customers. The shop opened in 2026 and
 * has no review history yet. Publishing invented testimonials as though they
 * were genuine would mislead buyers, so swap each one for a real quote (with
 * permission) as soon as you have it, or delete the section from
 * `src/app/(shop)/page.tsx` until you do.
 */
export const testimonials = [
  {
    id: "t1",
    quote:
      "I have bought lace in three countries. YADIMS is the only shop that asked what the gown needed to do before showing me a single bolt.",
    author: "Adaeze Kounde",
    role: "Bride, Yaoundé",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "They held a matched dye lot for eleven weeks while my client kept changing the headcount. Forty outfits, and every one photographs identically.",
    author: "Marie-Claire Ngassa",
    role: "Atelier Owner, Douala",
    rating: 5,
  },
  {
    id: "t3",
    quote:
      "The mikado is the real thing — Italian, correctly finished, and priced below what I was paying to import it myself.",
    author: "Serge Mbala",
    role: "Couturier, Atelier Mbala",
    rating: 5,
  },
  {
    id: "t4",
    quote:
      "I called about a 200-metre uniform contract expecting to be brushed off. They ran the shrinkage test themselves and sent me the numbers.",
    author: "Ibrahim Sow",
    role: "Procurement, Hospitality Group",
    rating: 5,
  },
  {
    id: "t5",
    quote:
      "A new shop, so I took one yard to test before committing. The weight on the label was exactly right, which is more than I can say for most of them.",
    author: "Fadimatou Bello",
    role: "Bride, Garoua",
    rating: 5,
  },
  {
    id: "t6",
    quote:
      "They talked me out of the expensive bolt and into the right one. I did not expect that from anybody selling fabric.",
    author: "Grace Etonde",
    role: "Fashion Student",
    rating: 5,
  },
] as const;

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: "Ordering",
    items: [
      {
        q: "How is fabric measured and sold?",
        a: "By the yard (0.91m) as a default, cut in continuous lengths. If you prefer metres, say so — we cut to either. Wax prints are sold as a full six-yard piece unless you ask us otherwise, because cutting into a piece breaks the pattern.",
      },
      {
        q: "Can I order a swatch before committing?",
        a: "Yes, and we would rather you did. Swatches are 10cm × 10cm and cost 1,500 XAF for up to five, refunded against any order over 20,000 XAF. Photographs cannot show you weight, hand or how a colour behaves under your light.",
      },
      {
        q: "Do you hold stock while I decide?",
        a: "We hold a cut length for 72 hours at no charge. For dye-lot reservations on larger orders we ask for a 30% deposit, and we will hold for up to twelve weeks.",
      },
      {
        q: "What is the minimum order?",
        a: "One yard for most fabrics. A small number of premium bolts carry a two-yard minimum, and that is stated on the product page. Wholesale pricing begins at 50 metres.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      {
        q: "Where do you deliver?",
        a: "Across Cameroon, and internationally by courier. Yaoundé is usually same-day, Douala next-day, and other regions two to four working days. International delivery is quoted per consignment.",
      },
      {
        q: "How much is delivery?",
        a: "Free within Yaoundé on orders over 50,000 XAF. Otherwise 2,500 XAF within Yaoundé, 4,500 XAF elsewhere in Cameroon. International is quoted at checkout or by WhatsApp.",
      },
      {
        q: "Can I collect from the shop?",
        a: "Yes, and there is no charge. Choose collection at checkout and we will message you when your cut is ready — usually within two hours during opening times.",
      },
    ],
  },
  {
    title: "Fabric & Care",
    items: [
      {
        q: "Will the colour I see on screen match the fabric?",
        a: "Close, but never exact — screens vary considerably. This is precisely what the swatch service is for, especially for bridal whites and anything being matched across several garments.",
      },
      {
        q: "Do you guarantee dye lots match?",
        a: "Within a single reserved lot, yes. Across separate purchases made weeks apart, no — and no honest shop would claim otherwise. Tell us up front if pieces need to match and we will reserve from one lot.",
      },
      {
        q: "How should I store fabric before sewing?",
        a: "Rolled rather than folded, in cotton rather than plastic, somewhere shaded and ventilated. In coastal humidity, plastic storage is the single most common cause of ruined silk.",
      },
    ],
  },
  {
    title: "Returns & Trade",
    items: [
      {
        q: "Can I return cut fabric?",
        a: "Cut lengths cannot be returned unless faulty, because we cannot resell them — this is standard across the trade. Faults must be reported within seven days and we replace from the same lot or refund in full.",
      },
      {
        q: "Do you offer wholesale accounts?",
        a: "Yes. Wholesale pricing starts at 50 metres, with further tiers at 200 and 500 metres. Trade accounts get first access to new arrivals and 30-day terms after three settled orders.",
      },
      {
        q: "Can you source something you do not stock?",
        a: "Frequently. Send a photograph and a description of what the fabric needs to do, and we will tell you honestly whether we can find it, roughly what it will cost, and how long it will take.",
      },
    ],
  },
];
